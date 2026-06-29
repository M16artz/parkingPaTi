"""
Capa de servicio para documentos.
La subida real al storage (Google Drive) se delega a GoogleDriveStorage,
manteniendo la logica de negocio (validaciones, permisos) separada del
detalle de infraestructura de almacenamiento.
"""

from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.documentos.repositories import DocumentoRepository
from apps.documentos.storage_backends import GoogleDriveStorage


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

        return DocumentoRepository.crear(
            cuenta=cuenta,
            ruta=nombre_guardado,
            fecha_expiracion=fecha_expiracion,
            es_valido=False,  # Requiere validacion posterior de un administrador
        )

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

        es_admin = getattr(cuenta_solicitante.rol, "nombre", None) == "ADMINISTRADOR"
        if not es_admin and documento.cuenta_id != cuenta_solicitante.id:
            raise PermissionDenied("No tienes permiso para eliminar este documento.")

        DocumentoRepository.eliminar(documento)
