from rest_framework import serializers
from .models import EstrategiaTarifa, IncrementoTarifa, DescuentoTarifa

class EstrategiaTarifaDTO(serializers.ModelSerializer):
    class Meta:
        model = EstrategiaTarifa
        fields = ['id', 'precio_hora']


class IncrementoTarifaDTO(serializers.ModelSerializer):
    class Meta:
        model = IncrementoTarifa
        fields = ['id', 'precio_hora', 'parqueadero', 'porcentaje']


class DescuentoTarifaDTO(serializers.ModelSerializer):
    class Meta:
        model = DescuentoTarifa
        fields = ['id', 'precio_hora', 'parqueadero', 'porcentaje']