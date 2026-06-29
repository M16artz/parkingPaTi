"""Patron Repository para documentos."""

from apps.documentos.models import Documento


class DocumentoRepository:
    @staticmethod
    def obtener_por_cuenta(cuenta_id):
        return Documento.objects.filter(cuenta_id=cuenta_id).first()

    @staticmethod
    def obtener_por_id(documento_id):
        return Documento.objects.select_related("cuenta").filter(id=documento_id).first()

    @staticmethod
    def crear(cuenta, ruta, fecha_expiracion=None, es_valido=False):
        return Documento.objects.create(
            cuenta=cuenta, ruta=ruta, fecha_expiracion=fecha_expiracion, es_valido=es_valido
        )

    @staticmethod
    def actualizar(documento, **datos):
        for campo, valor in datos.items():
            setattr(documento, campo, valor)
        documento.save()
        return documento

    @staticmethod
    def eliminar(documento):
        documento.delete()
