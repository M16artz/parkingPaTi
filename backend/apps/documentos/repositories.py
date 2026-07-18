from apps.documentos.models import DocumentoHabilitacion
from core.repositories import actualizar_generico


class DocumentoRepository:
    @staticmethod
    def listar():
        return DocumentoHabilitacion.objects.select_related("cuenta", "reviewed_by").order_by("id")

    @staticmethod
    def obtener_por_cuenta(cuenta_id):
        return DocumentoHabilitacion.objects.select_related("cuenta").filter(cuenta_id=cuenta_id).first()

    @staticmethod
    def obtener_por_id(documento_id):
        return DocumentoHabilitacion.objects.select_related("cuenta", "reviewed_by").filter(id=documento_id).first()

    @staticmethod
    def bloquear_por_cuenta(cuenta_id):
        return DocumentoHabilitacion.objects.select_for_update().select_related("cuenta").filter(
            cuenta_id=cuenta_id
        ).first()

    @staticmethod
    def crear(cuenta, **datos):
        return DocumentoHabilitacion.objects.create(cuenta=cuenta, **datos)

    @staticmethod
    def actualizar(documento, **datos):
        return actualizar_generico(
            documento,
            campos_permitidos={
                "drive_file_id",
                "drive_web_view_link",
                "nombre_archivo",
                "nombre_original",
                "mime_type",
                "size_bytes",
                "estado",
                "motivo_rechazo",
                "reviewed_at",
                "reviewed_by",
            },
            **datos,
        )

    @staticmethod
    def eliminar(documento):
        documento.delete()
