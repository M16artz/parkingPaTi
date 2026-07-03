from rest_framework import serializers
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
    """
    Antes era un ModelSerializer que exponia `cuenta` (redundante: el
    controlador siempre lo sobreescribe con request.user) y `ruta` como
    texto libre (permitiendo al cliente inventar cualquier URL sin que el
    backend subiera realmente nada a Google Drive). Ahora recibe el
    archivo real y `ruta` la calcula el servicio tras subirlo.
    """
    archivo = serializers.FileField(write_only=True)
    fecha_expiracion = serializers.DateField(required=False, allow_null=True)
