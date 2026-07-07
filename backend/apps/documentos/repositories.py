"""Patron Repository para documentos."""

from apps.documentos.models import Documento
from core.repositories import actualizar_generico


class DocumentoRepository:
    @staticmethod
    def obtener_por_cuenta(cuenta_id):
        return Documento.objects.filter(cuenta_id=cuenta_id).first()

    @staticmethod
    def obtener_por_id(documento_id):
        return Documento.objects.select_related("cuenta").filter(id=documento_id).first()

    @staticmethod
    def crear(cuenta, ruta, file_id, fecha_expiracion=None, es_valido=False):
        return Documento.objects.create(
            cuenta=cuenta, ruta=ruta, file_id=file_id,
            fecha_expiracion=fecha_expiracion, es_valido=es_valido
        )

    @staticmethod
    def actualizar(documento, **datos):
        return actualizar_generico(
            documento, campos_permitidos={"es_valido", "fecha_expiracion", "ruta"}, **datos
        )

    @staticmethod
    def eliminar(documento):
        documento.delete()
        