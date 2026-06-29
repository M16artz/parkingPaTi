"""
DTOs para tarifas.
"""

from rest_framework import serializers
from apps.tarifas.models import EstrategiaTarifa, IncrementoTarifa, DescuentoTarifa


class EstrategiaTarifaDTO(serializers.ModelSerializer):
    class Meta:
        model = EstrategiaTarifa
        fields = ["id", "precio_hora"]
        read_only_fields = ["id"]


class IncrementoTarifaDTO(serializers.ModelSerializer):
    class Meta:
        model = IncrementoTarifa
        # Hereda 'precio_hora' de EstrategiaTarifa
        fields = ["id", "precio_hora", "parqueadero", "porcentaje"]
        read_only_fields = ["id"]


class DescuentoTarifaDTO(serializers.ModelSerializer):
    class Meta:
        model = DescuentoTarifa
        # Hereda 'precio_hora' de EstrategiaTarifa
        fields = ["id", "precio_hora", "parqueadero", "porcentaje"]
        read_only_fields = ["id"]
