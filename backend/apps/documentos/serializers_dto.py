from django.core.validators import FileExtensionValidator
from rest_framework import serializers

from apps.documentos.models import DocumentoHabilitacion


class DocumentoLecturaDTO(serializers.ModelSerializer):
    class Meta:
        model = DocumentoHabilitacion
        fields = [
            "id", "cuenta", "nombre_archivo", "nombre_original",
            "mime_type", "size_bytes", "estado", "motivo_rechazo", "uploaded_at",
            "reviewed_at", "reviewed_by",
        ]
        read_only_fields = fields


class DocumentoEscrituraDTO(serializers.Serializer):
    archivo = serializers.FileField(
        write_only=True,
        validators=[FileExtensionValidator(allowed_extensions=["pdf", "jpg", "jpeg", "png"])],
    )

    def validate_archivo(self, value):
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("El archivo no puede superar los 5MB.")
        if value.size == 0:
            raise serializers.ValidationError("El archivo esta vacio.")

        firmas = {
            "application/pdf": (b"%PDF-",),
            "image/jpeg": (b"\xff\xd8\xff",),
            "image/png": (b"\x89PNG\r\n\x1a\n",),
        }
        mime_type = getattr(value, "content_type", "")
        if mime_type not in firmas:
            raise serializers.ValidationError("El tipo MIME no esta permitido.")
        encabezado = value.read(16)
        value.seek(0)
        if not any(encabezado.startswith(firma) for firma in firmas[mime_type]):
            raise serializers.ValidationError("El contenido no coincide con el tipo de archivo declarado.")
        return value
