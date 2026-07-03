"""
Capa de servicio para documentos.
La subida real al storage (Google Drive) se delega a GoogleDriveStorage,
manteniendo la logica de negocio (validaciones, permisos) separada del
detalle de infraestructura de almacenamiento.
"""

from django.db import IntegrityError
from rest_framework.exceptions import PermissionDenied, ValidationError

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
        # BUG CORREGIDO: antes se guardaba `nombre_guardado` (el file ID de
        # Drive) directamente en `ruta` (un URLField); el propio docstring
        # de storage_backends.py aclara que hay que persistir el enlace
        # (storage.url(...)), no el ID crudo.
        enlace = storage.url(nombre_guardado)

        try:
            return DocumentoRepository.crear(
                cuenta=cuenta,
                ruta=enlace,
                fecha_expiracion=fecha_expiracion,
                es_valido=False,  # Requiere validacion posterior de un administrador
            )
        except IntegrityError:
            # Defensa en profundidad ante una condicion de carrera: dos
            # subidas casi simultaneas de la misma cuenta. El chequeo de
            # arriba no es atomico con la creacion; el OneToOneField de
            # Documento.cuenta es la garantia real a nivel de BD.
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

        DocumentoRepository.eliminar(documento)
