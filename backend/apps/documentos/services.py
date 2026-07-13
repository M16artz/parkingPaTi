import logging
import unicodedata
from pathlib import Path

from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError

from apps.documentos.models import EstadoDocumento
from apps.documentos.repositories import DocumentoRepository
from apps.documentos.storage_backends import GoogleDriveStorage
from apps.usuarios.models import EstadoOnboarding
from core.permissions import es_administrador

logger = logging.getLogger(__name__)


def nombre_drive_privado(cuenta, nombre_original):
    extension = Path(nombre_original).suffix.lower()
    base = f"{cuenta.persona.apellido}_{cuenta.persona.nombre}_{cuenta.id}"
    normalizado = unicodedata.normalize("NFKD", base).encode("ascii", "ignore").decode("ascii")
    seguro = "_".join(
        filter(None, "".join(caracter.lower() if caracter.isalnum() else " " for caracter in normalizado).split())
    )
    return f"{seguro}{extension}"


class DocumentoService:
    @staticmethod
    def listar(cuenta_solicitante):
        if es_administrador(cuenta_solicitante):
            return DocumentoRepository.listar()
        documento = DocumentoRepository.obtener_por_cuenta(cuenta_solicitante.id)
        return [documento] if documento else []

    @staticmethod
    def obtener(documento_id, cuenta_solicitante):
        documento = DocumentoRepository.obtener_por_id(documento_id)
        if documento is None:
            raise NotFound("El documento solicitado no existe.")
        DocumentoService._verificar_permiso(documento, cuenta_solicitante)
        return documento

    @staticmethod
    def obtener_por_cuenta(cuenta_id):
        documento = DocumentoRepository.obtener_por_cuenta(cuenta_id)
        if documento is None:
            raise NotFound("Esta cuenta no tiene un documento registrado.")
        return documento

    @staticmethod
    def subir_o_reemplazar(cuenta, archivo, storage=None):
        if cuenta.onboarding_estado not in {
            EstadoOnboarding.DATOS_INICIALES_PENDIENTES,
            EstadoOnboarding.RECHAZADO,
        }:
            raise ValidationError("El documento no puede modificarse en el estado actual.")

        storage = storage or GoogleDriveStorage()
        nombre_seguro = nombre_drive_privado(cuenta, archivo.name)
        nuevo = storage.upload(nombre_seguro, archivo)
        anterior_id = None
        try:
            with transaction.atomic():
                documento = DocumentoRepository.bloquear_por_cuenta(cuenta.id)
                datos = {
                    "drive_file_id": nuevo.file_id,
                    "drive_web_view_link": nuevo.web_view_link,
                    "nombre_archivo": nombre_seguro,
                    "nombre_original": Path(archivo.name).name,
                    "mime_type": archivo.content_type,
                    "size_bytes": archivo.size,
                    "estado": EstadoDocumento.PENDIENTE,
                    "motivo_rechazo": "",
                    "reviewed_at": None,
                    "reviewed_by": None,
                }
                if documento is None:
                    documento = DocumentoRepository.crear(cuenta=cuenta, **datos)
                else:
                    anterior_id = documento.drive_file_id
                    documento = DocumentoRepository.actualizar(documento, **datos)
        except Exception:
            try:
                storage.delete(nuevo.file_id)
            except Exception:
                logger.exception("Fallo la compensacion de un archivo nuevo en Drive")
            raise

        if anterior_id:
            try:
                storage.delete(anterior_id)
            except Exception:
                logger.exception("No se pudo retirar la version anterior de un documento")
        return documento

    @staticmethod
    def subir_documento(cuenta, archivo, storage=None):
        if DocumentoRepository.obtener_por_cuenta(cuenta.id) is not None:
            raise ValidationError("Esta cuenta ya tiene un documento registrado.")
        return DocumentoService.subir_o_reemplazar(cuenta, archivo, storage=storage)

    @staticmethod
    def actualizar_documento(documento_id, cuenta_solicitante, archivo, storage=None):
        documento = DocumentoService.obtener(documento_id, cuenta_solicitante)
        return DocumentoService.subir_o_reemplazar(documento.cuenta, archivo, storage=storage)

    @staticmethod
    def validar_documento(documento_id, revisor):
        documento = DocumentoRepository.obtener_por_id(documento_id)
        if documento is None:
            raise NotFound("El documento solicitado no existe.")
        return DocumentoRepository.actualizar(
            documento,
            estado=EstadoDocumento.APROBADO,
            motivo_rechazo="",
            reviewed_at=timezone.now(),
            reviewed_by=revisor,
        )

    @staticmethod
    def eliminar(documento_id, cuenta_solicitante, storage=None):
        documento = DocumentoService.obtener(documento_id, cuenta_solicitante)
        if not es_administrador(cuenta_solicitante) and cuenta_solicitante.onboarding_estado not in {
            EstadoOnboarding.DATOS_INICIALES_PENDIENTES,
            EstadoOnboarding.RECHAZADO,
        }:
            raise ValidationError("El documento no puede eliminarse en el estado actual.")
        storage = storage or GoogleDriveStorage()
        try:
            storage.delete(documento.drive_file_id)
        except Exception as exc:
            logger.exception("No se pudo eliminar un documento de Drive")
            raise ValidationError("No se pudo eliminar el archivo del almacenamiento.") from exc
        DocumentoRepository.eliminar(documento)

    @staticmethod
    def _verificar_permiso(documento, cuenta_solicitante):
        if not es_administrador(cuenta_solicitante) and documento.cuenta_id != cuenta_solicitante.id:
            raise PermissionDenied("No tienes permiso para acceder a este documento.")
