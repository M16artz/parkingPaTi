import logging

from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import APIException, NotFound, PermissionDenied, ValidationError

from apps.documentos.models import EstadoDocumento
from apps.documentos.repositories import DocumentoRepository
from apps.parqueaderos.models import EstadoHabilitacion, EstadoOperativo
from apps.parqueaderos.repositories import ParqueaderoRepository
from apps.usuarios.email_adapters import GmailSmtpEmailAdapter
from apps.usuarios.models import EstadoOnboarding, TipoRol
from apps.usuarios.repositories import CuentaRepository, PersonaRepository
from core.permissions import es_administrador

logger = logging.getLogger(__name__)


class ConflictoEstado(APIException):
    status_code = 409
    default_detail = "El recurso ya fue modificado o no admite esta transicion."
    default_code = "state_conflict"


class AdminService:
    @staticmethod
    def _validar_admin(administrador):
        if not es_administrador(administrador) or not administrador.is_active:
            raise PermissionDenied("Se requieren permisos de administrador.")

    @staticmethod
    def listar_solicitudes(administrador, estado=None, busqueda=""):
        AdminService._validar_admin(administrador)
        return CuentaRepository.listar_solicitudes_admin(estado=estado, busqueda=busqueda)

    @staticmethod
    def obtener_solicitud(administrador, cuenta_id):
        AdminService._validar_admin(administrador)
        cuenta = CuentaRepository.obtener_solicitud_admin(cuenta_id)
        if cuenta is None:
            raise NotFound("La solicitud no existe.")
        return cuenta

    @staticmethod
    def listar_cuentas(administrador, estado=None, activo=None, busqueda=""):
        AdminService._validar_admin(administrador)
        return CuentaRepository.listar_propietarios_admin(
            estado=estado,
            activo=activo,
            busqueda=busqueda,
        )

    @staticmethod
    def obtener_cuenta(administrador, cuenta_id):
        AdminService._validar_admin(administrador)
        cuenta = CuentaRepository.obtener_propietario_admin(cuenta_id)
        if cuenta is None:
            raise NotFound("La cuenta propietaria no existe.")
        return cuenta

    @staticmethod
    def acceso_documento(administrador, cuenta_id):
        cuenta = AdminService.obtener_solicitud(administrador, cuenta_id)
        return cuenta.documento_habilitacion.drive_web_view_link

    @staticmethod
    def aprobar(administrador, cuenta_id, email_adapter=None):
        cuenta = AdminService._aprobar_atomico(administrador, cuenta_id)
        email_enviado = AdminService._notificar_resultado(
            cuenta,
            aprobado=True,
            email_adapter=email_adapter,
        )
        return cuenta, email_enviado

    @staticmethod
    @transaction.atomic
    def _aprobar_atomico(administrador, cuenta_id):
        AdminService._validar_admin(administrador)
        cuenta = CuentaRepository.bloquear_por_id(cuenta_id)
        if cuenta is None or cuenta.rol != TipoRol.PROPIETARIO:
            raise NotFound("La solicitud no existe.")
        parqueadero = ParqueaderoRepository.bloquear_por_propietario(cuenta.id)
        documento = DocumentoRepository.bloquear_por_cuenta(cuenta.id)
        if parqueadero is None or documento is None:
            raise ConflictoEstado("La solicitud no tiene parqueadero y documento completos.")
        if (
            cuenta.onboarding_estado != EstadoOnboarding.REVISION_PENDIENTE
            or parqueadero.habilitacion_estado not in {
                EstadoHabilitacion.BORRADOR,
                EstadoHabilitacion.PENDIENTE,
            }
            or documento.estado != EstadoDocumento.PENDIENTE
        ):
            raise ConflictoEstado("La solicitud ya fue revisada o cambio de estado.")

        ahora = timezone.now()
        ParqueaderoRepository.actualizar(
            parqueadero,
            habilitacion_estado=EstadoHabilitacion.APROBADO,
            motivo_rechazo="",
            approved_at=ahora,
        )
        DocumentoRepository.actualizar(
            documento,
            estado=EstadoDocumento.APROBADO,
            motivo_rechazo="",
            reviewed_at=ahora,
            reviewed_by=administrador,
        )
        return CuentaRepository.actualizar(
            cuenta,
            onboarding_estado=EstadoOnboarding.CONFIGURACION_PENDIENTE,
        )

    @staticmethod
    def rechazar(administrador, cuenta_id, motivo, email_adapter=None):
        if not motivo or not motivo.strip():
            raise ValidationError("El motivo de rechazo es obligatorio.")
        cuenta = AdminService._rechazar_atomico(administrador, cuenta_id, motivo.strip())
        email_enviado = AdminService._notificar_resultado(
            cuenta,
            aprobado=False,
            motivo=motivo.strip(),
            email_adapter=email_adapter,
        )
        return cuenta, email_enviado

    @staticmethod
    @transaction.atomic
    def _rechazar_atomico(administrador, cuenta_id, motivo):
        AdminService._validar_admin(administrador)
        cuenta = CuentaRepository.bloquear_por_id(cuenta_id)
        if cuenta is None or cuenta.rol != TipoRol.PROPIETARIO:
            raise NotFound("La solicitud no existe.")
        parqueadero = ParqueaderoRepository.bloquear_por_propietario(cuenta.id)
        documento = DocumentoRepository.bloquear_por_cuenta(cuenta.id)
        if parqueadero is None or documento is None:
            raise ConflictoEstado("La solicitud no tiene parqueadero y documento completos.")
        if (
            cuenta.onboarding_estado != EstadoOnboarding.REVISION_PENDIENTE
            or parqueadero.habilitacion_estado not in {
                EstadoHabilitacion.BORRADOR,
                EstadoHabilitacion.PENDIENTE,
            }
            or documento.estado != EstadoDocumento.PENDIENTE
        ):
            raise ConflictoEstado("La solicitud ya fue revisada o cambio de estado.")

        ahora = timezone.now()
        ParqueaderoRepository.actualizar(
            parqueadero,
            habilitacion_estado=EstadoHabilitacion.RECHAZADO,
            motivo_rechazo=motivo,
            approved_at=None,
        )
        DocumentoRepository.actualizar(
            documento,
            estado=EstadoDocumento.RECHAZADO,
            motivo_rechazo=motivo,
            reviewed_at=ahora,
            reviewed_by=administrador,
        )
        return CuentaRepository.actualizar(cuenta, onboarding_estado=EstadoOnboarding.RECHAZADO)

    @staticmethod
    @transaction.atomic
    def deshabilitar(administrador, cuenta_id):
        AdminService._validar_admin(administrador)
        cuenta = CuentaRepository.bloquear_por_id(cuenta_id)
        if cuenta is None or cuenta.rol != TipoRol.PROPIETARIO:
            raise NotFound("La cuenta propietaria no existe.")
        if not cuenta.is_active or cuenta.onboarding_estado == EstadoOnboarding.DESHABILITADO:
            raise ConflictoEstado("La cuenta ya esta deshabilitada.")

        parqueadero = ParqueaderoRepository.bloquear_por_propietario(cuenta.id)
        if parqueadero is not None:
            ParqueaderoRepository.actualizar(parqueadero, estado_operativo=EstadoOperativo.INACTIVO)
        PersonaRepository.actualizar_estado(cuenta.persona, False)
        CuentaRepository.revocar_refresh_tokens(cuenta)
        return CuentaRepository.actualizar(
            cuenta,
            is_active=False,
            onboarding_estado=EstadoOnboarding.DESHABILITADO,
        )

    @staticmethod
    @transaction.atomic
    def rehabilitar(administrador, cuenta_id):
        AdminService._validar_admin(administrador)
        cuenta = CuentaRepository.bloquear_por_id(cuenta_id)
        if cuenta is None or cuenta.rol != TipoRol.PROPIETARIO:
            raise NotFound("La cuenta propietaria no existe.")
        if cuenta.is_active or cuenta.onboarding_estado != EstadoOnboarding.DESHABILITADO:
            raise ConflictoEstado("La cuenta no esta deshabilitada.")

        parqueadero = ParqueaderoRepository.bloquear_por_propietario(cuenta.id)
        documento = DocumentoRepository.bloquear_por_cuenta(cuenta.id)
        nuevo_estado = AdminService._estado_al_rehabilitar(cuenta, parqueadero, documento)
        PersonaRepository.actualizar_estado(cuenta.persona, True)
        cuenta = CuentaRepository.actualizar(cuenta, is_active=True, onboarding_estado=nuevo_estado)
        if parqueadero is not None:
            if nuevo_estado == EstadoOnboarding.ACTIVO:
                from apps.parqueaderos.services import EspacioService
                EspacioService.recalcular_conteos(parqueadero)
            else:
                ParqueaderoRepository.actualizar(parqueadero, estado_operativo=EstadoOperativo.INACTIVO)
        return cuenta

    @staticmethod
    def _estado_al_rehabilitar(cuenta, parqueadero, documento):
        if not cuenta.correo_verificado:
            return EstadoOnboarding.CORREO_PENDIENTE
        if parqueadero is None or documento is None:
            return EstadoOnboarding.DATOS_INICIALES_PENDIENTES
        if parqueadero.habilitacion_estado == EstadoHabilitacion.RECHAZADO or documento.estado == EstadoDocumento.RECHAZADO:
            return EstadoOnboarding.RECHAZADO
        if parqueadero.habilitacion_estado == EstadoHabilitacion.PENDIENTE and documento.estado == EstadoDocumento.PENDIENTE:
            return EstadoOnboarding.REVISION_PENDIENTE
        if parqueadero.habilitacion_estado == EstadoHabilitacion.APROBADO and documento.estado == EstadoDocumento.APROBADO:
            return EstadoOnboarding.ACTIVO if parqueadero.configuracion_completa else EstadoOnboarding.CONFIGURACION_PENDIENTE
        return EstadoOnboarding.DATOS_INICIALES_PENDIENTES

    @staticmethod
    def _notificar_resultado(cuenta, aprobado, motivo="", email_adapter=None):
        try:
            (email_adapter or GmailSmtpEmailAdapter()).enviar_resultado_solicitud(
                cuenta,
                aprobado,
                motivo,
            )
            return True
        except Exception:
            logger.exception(
                "No se pudo enviar el resultado de solicitud para cuenta_id=%s",
                cuenta.id,
            )
            return False
