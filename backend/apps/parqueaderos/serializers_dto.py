"""
DTOs para parqueaderos y espacios.
"""

from rest_framework import serializers

from apps.parqueaderos.models import Direccion, Disponibilidad, Espacio, Parqueadero, TipoEstado, Ubicacion
from apps.parqueaderos.repositories import EspacioRepository


class DireccionDTO(serializers.ModelSerializer):
    class Meta:
        model = Direccion
        fields = ["calle_principal", "calle_secundaria", "numero_lote"]


class UbicacionDTO(serializers.ModelSerializer):
    class Meta:
        model = Ubicacion
        fields = ["latitud", "longitud"]


class EspacioDTO(serializers.ModelSerializer):
    class Meta:
        model = Espacio
        # Agregado numero_espacio
        fields = ["id", "parqueadero", "numero_espacio", "estado"]
        read_only_fields = ["id", "parqueadero"]


class ParqueaderoResumenDTO(serializers.ModelSerializer):
    ubicacion = UbicacionDTO(read_only=True)
    espacios_disponibles = serializers.SerializerMethodField()

    class Meta:
        model = Parqueadero
        fields = ["id", "nombre", "ubicacion", "disponibilidad", "espacios_disponibles"]

class ParqueaderoDetalleDTO(serializers.ModelSerializer):
    direccion = DireccionDTO(read_only=True)
    ubicacion = UbicacionDTO(read_only=True)
    espacios = EspacioDTO(many=True, read_only=True)

    class Meta:
        model = Parqueadero
        fields = [
            "id", "nombre", "estado", "validado",
            "disponibilidad", "direccion", "ubicacion", "espacios", "propietario",
        ]
        read_only_fields = ["id", "validado", "propietario"]

class ParqueaderoActualizarDTO(serializers.Serializer):
    nombre = serializers.CharField(max_length=150, required=False)
    estado = serializers.BooleanField(required=False)
    disponibilidad = serializers.ChoiceField(choices=Disponibilidad.choices, required=False)
    # tarifa eliminado

class ParqueaderoCrearDTO(serializers.Serializer):
    nombre = serializers.CharField(max_length=150)
    # tarifa eliminado; la tarifa se gestiona en EstrategiaTarifa
    calle_principal = serializers.CharField(max_length=200)
    calle_secundaria = serializers.CharField(max_length=200, required=False, allow_blank=True)
    numero_lote = serializers.CharField(max_length=50, required=False, allow_blank=True)
    latitud = serializers.DecimalField(max_digits=9, decimal_places=6)
    longitud = serializers.DecimalField(max_digits=9, decimal_places=6)

    def to_parqueadero_datos(self):
        return {"nombre": self.validated_data["nombre"]}


# Nuevo DTO para forzar la validación del numero_espacio en la creación
class EspacioCrearDTO(serializers.Serializer):
    parqueadero = serializers.IntegerField()
    numero_espacio = serializers.CharField(max_length=20)


class EspacioCambiarEstadoDTO(serializers.Serializer):
    estado = serializers.ChoiceField(choices=TipoEstado.choices)
    