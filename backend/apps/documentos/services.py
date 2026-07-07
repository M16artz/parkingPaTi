"""
Capa de servicio para documentos.
La subida real al storage (Google Drive) se delega a GoogleDriveStorage,
manteniendo la logica de negocio (validaciones, permisos) separada del
detalle de infraestructura de almacenamiento.
"""

from django.db import IntegrityError
from django.db import IntegrityError, transaction
from rest_framework.exceptions import PermissionDenied, ValidationError
import logging
logger = logging.getLogger(__name__)

from apps.documentos.repositories import DocumentoRepository
from apps.documentos.storage_backends import GoogleDriveStorage
from core.permissions import es_administrador


class DocumentoService:
    @staticmethod
    def obtener_por_cuenta(cuenta_id):
        documento = DocumentoRepository.obtener_por_cuenta(cuenta_id)
        if documento is None:
            raise ValidationError("Esta cuenta no tiene un documento registrado.")
        return documento

    @staticmethod
    def subir_documento(cuenta, archivo, fecha_expiracion=None):
        if DocumentoRepository.obtener_por_cuenta(cuenta.id) is not None:
            raise ValidationError("Esta cuenta ya tiene un documento registrado; usa actualizar en su lugar.")

        storage = GoogleDriveStorage()
        nombre_guardado = storage.save(archivo.name, archivo)
        enlace = storage.url(nombre_guardado)

        try:
            with transaction.atomic():
                return DocumentoRepository.crear(
                    cuenta=cuenta,
                    ruta=enlace,
                    file_id=nombre_guardado,
                    fecha_expiracion=fecha_expiracion,
                    es_valido=False,
                )
        except IntegrityError:
            # Limpiar archivo de Drive si falló la creación en BD
            storage.delete(nombre_guardado)
            raise ValidationError("Esta cuenta ya tiene un documento registrado; usa actualizar en su lugar.")
        
    @staticmethod
    def validar_documento(documento_id):
        """Solo deberia invocarse desde un endpoint protegido con EsAdministrador."""
        documento = DocumentoRepository.obtener_por_id(documento_id)
        if documento is None:
            raise ValidationError("El documento solicitado no existe.")
        return DocumentoRepository.actualizar(documento, es_valido=True)

    @staticmethod
    def eliminar(documento_id, cuenta_solicitante):
        documento = DocumentoRepository.obtener_por_id(documento_id)
        if documento is None:
            raise ValidationError("El documento solicitado no existe.")
        if not es_administrador(cuenta_solicitante) and documento.cuenta_id != cuenta_solicitante.id:
            raise PermissionDenied("No tienes permiso para eliminar este documento.")

        file_id = documento.file_id
        storage = GoogleDriveStorage()
        try:
            storage.delete(file_id)  # Si falla, lanza excepción
        except Exception as e:
            # Registrar y relanzar para no eliminar el registro
            logger.error(f"Error al eliminar archivo de Drive: {e}")
            raise ValidationError("No se pudo eliminar el archivo del almacenamiento.")

        DocumentoRepository.eliminar(documento)

    @staticmethod
    def actualizar_documento(documento_id, cuenta_solicitante, archivo, fecha_expiracion=None):
        documento = DocumentoRepository.obtener_por_id(documento_id)
        if documento is None:
            raise ValidationError("El documento solicitado no existe.")
            
        if not es_administrador(cuenta_solicitante) and documento.cuenta_id != cuenta_solicitante.id:
            raise PermissionDenied("No tienes permiso para modificar este documento.")

        storage = GoogleDriveStorage()
        
        # 1. Subir el nuevo archivo
        nuevo_file_id = storage.save(archivo.name, archivo)
        nuevo_enlace = storage.url(nuevo_file_id)
        
        # 2. Borrar el archivo viejo de Drive
        try:
            storage.delete(documento.file_id)
        except Exception as e:
            logger.error(f"Error al eliminar archivo viejo de Drive {documento.file_id}: {e}")
            
        # 3. Actualizar la base de datos
        return DocumentoRepository.actualizar(
            documento, 
            ruta=nuevo_enlace, 
            file_id=nuevo_file_id,
            fecha_expiracion=fecha_expiracion,
            es_valido=False # Al cambiar documento, requiere nueva validación
        )