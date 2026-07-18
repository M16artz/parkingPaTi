import hashlib
import logging
import secrets
from datetime import timedelta
from pathlib import Path

from django.contrib.auth.password_validation import validate_password
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.documentos.models import EstadoDocumento
from apps.documentos.repositories import DocumentoRepository
from apps.documentos.services import nombre_drive_privado
from apps.documentos.storage_backends import get_document_storage
from apps.parqueaderos.repositories import ParqueaderoRepository
from apps.usuarios.email_adapters import GmailSmtpEmailAdapter
from apps.usuarios.models import EstadoOnboarding, TipoRol
from apps.usuarios.repositories import (
    CuentaRepository,
    PersonaRepository,
    VerificacionCorreoRepository,
)

logger = logging.getLogger(__name__)


class SesionService:
    @staticmethod
    def validar_login(cuenta):
        if not cuenta.is_active or not cuenta.correo_verificado:
            raise AuthenticationFailed("No fue posible iniciar sesion con estas credenciales.")

    @staticmethod
    def refrescar(refresh):
        try:
            token = RefreshToken(refresh)
        except TokenError as exc:
            raise AuthenticationFailed("La sesion no es valida.") from exc
        cuenta = CuentaRepository.obtener_por_id(token.get("user_id"))
        if cuenta is None or not cuenta.is_active or not cuenta.correo_verificado:
            raise AuthenticationFailed("La sesion no es valida.")
        serializer = TokenRefreshSerializer(data={"refresh": refresh})
        serializer.is_valid(raise_exception=True)
        return dict(serializer.validated_data)

    @staticmethod
    def cerrar(refresh):
        if not refresh:
            return
        try:
            RefreshToken(refresh).blacklist()
        except Exception:
            return


class RegistroService:
    @staticmethod
    def registrar_cuenta(
        datos_persona: dict,
        datos_cuenta: dict,
        nombre_rol: str = TipoRol.PROPIETARIO,
        email_adapter=None,
    ):
        if CuentaRepository.existe_username_o_correo(
            datos_cuenta["username"], datos_cuenta["correo"]
        ):
            raise ValidationError("El nombre de usuario o el correo ya están registrados.")

        persona_existente = PersonaRepository.obtener_por_identificacion(
            datos_persona["identificacion"]
        )
        if persona_existente is not None:
            raise ValidationError("Ya existe una persona registrada con esa identificación.")

        with transaction.atomic():
            persona = PersonaRepository.crear(**datos_persona)

            cuenta = CuentaRepository.crear(
                username=datos_cuenta["username"],
                correo=datos_cuenta["correo"],
                password=datos_cuenta["password"],
                persona=persona,
                rol=nombre_rol,
            )

        email_enviado = VerificacionCorreoService.emitir(cuenta, email_adapter=email_adapter)
        return cuenta, email_enviado

    @staticmethod
    def registrar_completo(
        datos_persona,
        datos_cuenta,
        datos_parqueadero,
        datos_direccion,
        datos_ubicacion,
        archivo,
        storage=None,
        email_adapter=None,
    ):
        from core.geo import validar_coordenadas_loja

        if CuentaRepository.existe_username_o_correo(
            datos_cuenta["username"], datos_cuenta["correo"]
        ):
            raise ValidationError("El nombre de usuario o el correo ya estÃ¡n registrados.")
        if PersonaRepository.obtener_por_identificacion(datos_persona["identificacion"]):
            raise ValidationError("Ya existe una persona registrada con esa identificaciÃ³n.")

        validar_coordenadas_loja(datos_ubicacion["latitud"], datos_ubicacion["longitud"])
        storage = storage or get_document_storage()
        nuevo_archivo = None
        try:
            with transaction.atomic():
                persona = PersonaRepository.crear(**datos_persona)
                cuenta = CuentaRepository.crear(
                    username=datos_cuenta["username"],
                    correo=datos_cuenta["correo"],
                    password=datos_cuenta["password"],
                    persona=persona,
                    rol=TipoRol.PROPIETARIO,
                )
                ParqueaderoRepository.crear(
                    cuenta,
                    datos_direccion,
                    datos_ubicacion,
                    **datos_parqueadero,
                )
                nombre_seguro = nombre_drive_privado(cuenta, archivo.name)
                nuevo_archivo = storage.upload(nombre_seguro, archivo)
                DocumentoRepository.crear(
                    cuenta=cuenta,
                    drive_file_id=nuevo_archivo.file_id,
                    drive_web_view_link=nuevo_archivo.web_view_link,
                    nombre_archivo=nombre_seguro,
                    nombre_original=Path(archivo.name).name,
                    mime_type=archivo.content_type,
                    size_bytes=archivo.size,
                    estado=EstadoDocumento.PENDIENTE,
                )
        except Exception:
            if nuevo_archivo is not None:
                try:
                    storage.delete(nuevo_archivo.file_id)
                except Exception:
                    logger.exception("No se pudo compensar el documento del registro completo")
            raise

        email_enviado = VerificacionCorreoService.emitir(cuenta, email_adapter=email_adapter)
        return cuenta, email_enviado


class VerificacionCorreoService:
    @staticmethod
    def _hash(token):
        return hashlib.sha256(token.encode("utf-8")).hexdigest()

    @staticmethod
    def emitir(cuenta, email_adapter=None):
        if cuenta.correo_verificado:
            return True

        token = secrets.token_urlsafe(48)
        with transaction.atomic():
            VerificacionCorreoRepository.invalidar_activas(cuenta.id)
            VerificacionCorreoRepository.crear(
                cuenta=cuenta,
                token_hash=VerificacionCorreoService._hash(token),
                expires_at=timezone.now() + timedelta(seconds=settings.EMAIL_VERIFICATION_TTL_SECONDS),
            )

        try:
            (email_adapter or GmailSmtpEmailAdapter()).enviar_verificacion(cuenta, token)
            return True
        except Exception:
            logger.exception("No se pudo enviar el correo de verificacion para cuenta_id=%s", cuenta.id)
            return False

    @staticmethod
    def reenviar(correo, email_adapter=None):
        cuenta = CuentaRepository.obtener_por_correo(correo.strip().lower())
        if cuenta is not None and cuenta.is_active and not cuenta.correo_verificado:
            VerificacionCorreoService.emitir(cuenta, email_adapter=email_adapter)

    @staticmethod
    @transaction.atomic
    def verificar(token):
        token_hash = VerificacionCorreoService._hash(token)
        verificacion = VerificacionCorreoRepository.bloquear_por_hash(token_hash)
        ahora = timezone.now()
        if verificacion is None or verificacion.used_at is not None or verificacion.expires_at <= ahora:
            raise ValidationError("El enlace de verificacion no es valido o ha expirado.")

        cuenta = verificacion.cuenta
        VerificacionCorreoRepository.marcar_usada(verificacion)
        VerificacionCorreoRepository.invalidar_activas(cuenta.id)
        CuentaRepository.actualizar(
            cuenta,
            correo_verificado=True,
            correo_verificado_en=ahora,
            onboarding_estado=EstadoOnboarding.DATOS_INICIALES_PENDIENTES,
        )
        return cuenta


class CuentaService:
    TRANSICIONES_ONBOARDING = {
        EstadoOnboarding.CORREO_PENDIENTE: {EstadoOnboarding.DATOS_INICIALES_PENDIENTES},
        EstadoOnboarding.DATOS_INICIALES_PENDIENTES: {EstadoOnboarding.REVISION_PENDIENTE},
        EstadoOnboarding.REVISION_PENDIENTE: {
            EstadoOnboarding.RECHAZADO,
            EstadoOnboarding.CONFIGURACION_PENDIENTE,
        },
        EstadoOnboarding.RECHAZADO: {EstadoOnboarding.REVISION_PENDIENTE},
        EstadoOnboarding.CONFIGURACION_PENDIENTE: {EstadoOnboarding.ACTIVO},
        EstadoOnboarding.ACTIVO: {EstadoOnboarding.DESHABILITADO},
        EstadoOnboarding.DESHABILITADO: set(),
    }

    @staticmethod
    def listar_cuentas():
        return CuentaRepository.listar()

    @staticmethod
    def obtener_cuenta(cuenta_id):
        cuenta = CuentaRepository.obtener_por_id(cuenta_id)
        if cuenta is None:
            raise ValidationError("La cuenta solicitada no existe.")
        return cuenta

    @staticmethod
    def actualizar_cuenta(cuenta_id, **datos):
        cuenta = CuentaService.obtener_cuenta(cuenta_id)
        password = datos.pop("password", None)

        cuenta = CuentaRepository.actualizar(cuenta, **datos)

        if password:
            # validate_password ya corrio en el DTO (CuentaActualizarDTO),
            # pero se revalida aqui tambien porque los services son el
            # limite de confianza real de la capa de negocio (defensa en
            # profundidad: no asumir que todo caller pasa por el DTO).
            validate_password(password, user=cuenta)
            cuenta.set_password(password)
            cuenta.save(update_fields=["password"])

        return cuenta

    @staticmethod
    def eliminar_cuenta(cuenta_id):
        cuenta = CuentaService.obtener_cuenta(cuenta_id)
        CuentaRepository.eliminar(cuenta)

    @staticmethod
    def cambiar_onboarding(cuenta_id, nuevo_estado):
        cuenta = CuentaService.obtener_cuenta(cuenta_id)
        permitidos = CuentaService.TRANSICIONES_ONBOARDING.get(cuenta.onboarding_estado, set())
        if nuevo_estado not in permitidos:
            raise ValidationError("La transicion de onboarding solicitada no es valida.")
        return CuentaRepository.actualizar(cuenta, onboarding_estado=nuevo_estado)
