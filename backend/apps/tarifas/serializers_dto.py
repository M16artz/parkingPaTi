from rest_framework import serializers
from .models import EstrategiaTarifa, IncrementoTarifa, DescuentoTarifa

class IncrementoTarifaDTO(serializers.ModelSerializer):
    """
    Serializer para operaciones CRUD de Incrementos.
    """
    class Meta:
        model = IncrementoTarifa
        fields = [
            'id', 
            'estrategia', 
            'porcentaje', 
            'motivo', 
            'aplica_fin_semana', 
            'hora_inicio', 
            'hora_fin'
        ]

class DescuentoTarifaDTO(serializers.ModelSerializer):
    """
    Serializer para operaciones CRUD de Descuentos.
    """
    class Meta:
        model = DescuentoTarifa
        fields = [
            'id', 
            'estrategia', 
            'porcentaje', 
            'motivo'
        ]

class EstrategiaTarifaLecturaDTO(serializers.ModelSerializer):
    """
    Serializer para lectura. 
    Expone la tarifa base y anida las listas de incrementos y descuentos.
    """
    # Usamos los related_names 'incrementos' y 'descuentos' definidos en models.txt
    incrementos = IncrementoTarifaDTO(many=True, read_only=True)
    descuentos = DescuentoTarifaDTO(many=True, read_only=True)

    class Meta:
        model = EstrategiaTarifa
        fields = [
            'id', 
            'parqueadero', 
            'tarifa_base', 
            'incrementos', 
            'descuentos'
        ]
        read_only_fields = fields

class EstrategiaTarifaEscrituraDTO(serializers.ModelSerializer):
    """
    Serializer para crear o actualizar estrictamente la tarifa base.
    Los incrementos y descuentos se manejan en sus propios endpoints.
    """
    class Meta:
        model = EstrategiaTarifa
        fields = [
            'id', 
            'parqueadero', 
            'tarifa_base'
        ]