from rest_framework import serializers

from apps.tarifas.models import CategoriaTarifa, TipoCategoriaTarifa


class CategoriaTarifaDTO(serializers.ModelSerializer):
    class Meta:
        model = CategoriaTarifa
        fields = ["id", "parqueadero", "codigo", "nombre_visible", "precio_hora", "activa"]
        read_only_fields = ["id"]


class CategoriaTarifaCrearDTO(serializers.Serializer):
    parqueadero = serializers.IntegerField()
    codigo = serializers.ChoiceField(choices=TipoCategoriaTarifa.choices)
    nombre_visible = serializers.CharField(max_length=80)
    precio_hora = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=0)
    activa = serializers.BooleanField(required=False, default=True)


class CategoriaTarifaActualizarDTO(serializers.Serializer):
    nombre_visible = serializers.CharField(max_length=80, required=False)
    precio_hora = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=0, required=False)
    activa = serializers.BooleanField(required=False)
