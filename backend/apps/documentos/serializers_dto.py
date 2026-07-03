from rest_framework import serializers
from django.core.validators import FileExtensionValidator
from .models import Documento


class DocumentoLecturaDTO(serializers.ModelSerializer):
    class Meta:
        model = Documento
        fields = [
            'id',
            'cuenta',
            'es_valido',
            'fecha_expiracion',
            'ruta'
        ]
        read_only_fields = fields


class DocumentoEscrituraDTO(serializers.Serializer):
    archivo = serializers.FileField(
        write_only=True,
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'jpg', 'png'])]
    )
    fecha_expiracion = serializers.DateField(required=False, allow_null=True)

    def validate_archivo(self, value):
        if value.size > 5 * 1024 * 1024:  # Limite de 5MB
            raise serializers.ValidationError("El archivo no puede superar los 5MB.")
        return value
