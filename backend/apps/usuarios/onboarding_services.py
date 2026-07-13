from django.db import transaction
from rest_framework.exceptions import NotFound, ValidationError

from apps.documentos.models import EstadoDocumento
from apps.documentos.repositories import DocumentoRepository
from apps.parqueaderos.models import EstadoHabilitacion
from apps.parqueaderos.repositories import ParqueaderoRepository
from apps.usuarios.models import EstadoOnboarding
from apps.usuarios.repositories import CuentaRepository
from core.geo import validar_coordenadas_loja


class OnboardingService:
    @staticmethod
    def estado(cuenta):
        parqueadero = ParqueaderoRepository.obtener_por_propietario(cuenta.id)
        documento = DocumentoRepository.obtener_por_cuenta(cuenta.id)
        if not cuenta.correo_verificado:
            paso = "VERIFICAR_CORREO"
        elif cuenta.onboarding_estado == EstadoOnboarding.REVISION_PENDIENTE:
            paso = "REVISION_PENDIENTE"
        elif cuenta.onboarding_estado == EstadoOnboarding.CONFIGURACION_PENDIENTE:
            paso = "CONFIGURACION_FINAL"
        elif cuenta.onboarding_estado == EstadoOnboarding.ACTIVO:
            paso = "COMPLETADO"
        elif parqueadero is None:
            paso = "DATOS_INICIALES"
        elif documento is None:
            paso = "DOCUMENTO"
        else:
            paso = "ENVIAR_SOLICITUD"
        return {
            "estado": cuenta.onboarding_estado,
            "paso": paso,
            "correo_verificado": cuenta.correo_verificado,
            "parqueadero": OnboardingService._parqueadero_dict(parqueadero),
            "documento": OnboardingService._documento_dict(documento),
        }

    @staticmethod
    @transaction.atomic
    def guardar_datos_iniciales(cuenta, direccion_datos, ubicacion_datos, **datos):
        if not cuenta.correo_verificado:
            raise ValidationError("Debes verificar el correo antes de continuar.")
        if cuenta.onboarding_estado not in {
            EstadoOnboarding.DATOS_INICIALES_PENDIENTES,
            EstadoOnboarding.RECHAZADO,
        }:
            raise ValidationError("Los datos iniciales no pueden modificarse en el estado actual.")
        validar_coordenadas_loja(ubicacion_datos["latitud"], ubicacion_datos["longitud"])
        parqueadero = ParqueaderoRepository.bloquear_por_propietario(cuenta.id)
        if parqueadero is None:
            return ParqueaderoRepository.crear(cuenta, direccion_datos, ubicacion_datos, **datos)
        return ParqueaderoRepository.actualizar_datos_iniciales(
            parqueadero,
            direccion_datos,
            ubicacion_datos,
            motivo_rechazo="",
            **datos,
        )

    @staticmethod
    @transaction.atomic
    def enviar_solicitud(cuenta):
        cuenta_bloqueada = CuentaRepository.bloquear_por_id(cuenta.id)
        if cuenta_bloqueada is None:
            raise NotFound("La cuenta no existe.")
        parqueadero = ParqueaderoRepository.bloquear_por_propietario(cuenta.id)
        documento = DocumentoRepository.bloquear_por_cuenta(cuenta.id)

        if cuenta_bloqueada.onboarding_estado == EstadoOnboarding.REVISION_PENDIENTE:
            return OnboardingService.estado(cuenta_bloqueada)
        if not cuenta_bloqueada.correo_verificado:
            raise ValidationError("Debes verificar el correo antes de enviar la solicitud.")
        if parqueadero is None or not hasattr(parqueadero, "direccion") or not hasattr(parqueadero, "ubicacion"):
            raise ValidationError("Los datos iniciales del parqueadero estan incompletos.")
        if documento is None:
            raise ValidationError("Debes subir el documento de habilitacion.")
        if cuenta_bloqueada.onboarding_estado not in {
            EstadoOnboarding.DATOS_INICIALES_PENDIENTES,
            EstadoOnboarding.RECHAZADO,
        }:
            raise ValidationError("La solicitud no puede enviarse en el estado actual.")

        validar_coordenadas_loja(parqueadero.ubicacion.latitud, parqueadero.ubicacion.longitud)
        ParqueaderoRepository.actualizar(
            parqueadero,
            habilitacion_estado=EstadoHabilitacion.PENDIENTE,
            motivo_rechazo="",
        )
        DocumentoRepository.actualizar(
            documento,
            estado=EstadoDocumento.PENDIENTE,
            motivo_rechazo="",
            reviewed_at=None,
            reviewed_by=None,
        )
        CuentaRepository.actualizar(cuenta_bloqueada, onboarding_estado=EstadoOnboarding.REVISION_PENDIENTE)
        cuenta_bloqueada.refresh_from_db()
        return OnboardingService.estado(cuenta_bloqueada)

    @staticmethod
    def _parqueadero_dict(parqueadero):
        if parqueadero is None:
            return None
        return {
            "id": parqueadero.id,
            "nombre": parqueadero.nombre,
            "descripcion": parqueadero.descripcion,
            "habilitacion_estado": parqueadero.habilitacion_estado,
            "calle_principal": parqueadero.direccion.calle_principal,
            "calle_secundaria": parqueadero.direccion.calle_secundaria,
            "numero_lote": parqueadero.direccion.numero_lote,
            "latitud": parqueadero.ubicacion.latitud,
            "longitud": parqueadero.ubicacion.longitud,
        }

    @staticmethod
    def _documento_dict(documento):
        if documento is None:
            return None
        return {
            "id": documento.id,
            "nombre_archivo": documento.nombre_archivo,
            "nombre_original": documento.nombre_original,
            "mime_type": documento.mime_type,
            "size_bytes": documento.size_bytes,
            "estado": documento.estado,
        }
