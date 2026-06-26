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


class DocumentoEscrituraDTO(serializers.ModelSerializer):
    class Meta:
        model = Documento
        fields = [
            'cuenta', 
            'fecha_expiracion', 
            'ruta'
        ]