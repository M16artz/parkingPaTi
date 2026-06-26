from rest_framework import serializers
from .models import Documento

class DocumentoLecturaDTO(serializers.ModelSerializer):
    """
    Serializer usado para devolver datos al cliente (GET).
    Expone toda la información necesaria, incluyendo el estado de validación.
    """
    class Meta:
        model = Documento
        fields = [
            'id', 
            'parqueadero', 
            'nombre', 
            'archivo_url', 
            'fecha_subida', 
            'fecha_expiracion', 
            'es_valido'
        ]
        read_only_fields = fields


class DocumentoEscrituraDTO(serializers.ModelSerializer):
    """
    Serializer usado para recibir datos del cliente (POST, PUT, PATCH).
    Protege los campos internos: no incluye 'es_valido' (lo maneja el admin) 
    ni 'fecha_subida' (automático).
    """
    class Meta:
        model = Documento
        fields = [
            'parqueadero', 
            'nombre', 
            'archivo_url', 
            'fecha_expiracion'
        ]