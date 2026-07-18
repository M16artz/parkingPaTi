from rest_framework import serializers

from apps.parqueaderos.models import (
    Direccion,
    Espacio,
    EstadoEspacio,
    Parqueadero,
    Ubicacion,
)


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
        fields = ["id", "parqueadero", "nombre", "estado", "tarifa_predeterminada", "is_active"]
        read_only_fields = ["id", "parqueadero", "is_active"]


class ParqueaderoResumenDTO(serializers.ModelSerializer):
    ubicacion = UbicacionDTO(read_only=True)

    class Meta:
        model = Parqueadero
        fields = [
            "id", "nombre", "ubicacion", "estado_operativo",
            "total_espacios", "espacios_disponibles", "updated_at",
        ]


class ParqueaderoDetalleDTO(serializers.ModelSerializer):
    direccion = DireccionDTO(read_only=True)
    ubicacion = UbicacionDTO(read_only=True)
    espacios = EspacioDTO(many=True, read_only=True)

    class Meta:
        model = Parqueadero
        fields = [
            "id", "nombre", "descripcion", "habilitacion_estado", "motivo_rechazo",
            "estado_operativo", "total_espacios", "espacios_disponibles",
            "configuracion_completa", "direccion", "ubicacion", "espacios", "propietario",
            "approved_at", "updated_at",
        ]
        read_only_fields = fields


class ParqueaderoActualizarDTO(serializers.Serializer):
    CAMPOS_UBICACION = {
        "calle_principal", "calle_secundaria", "numero_lote", "latitud", "longitud"
    }
    nombre = serializers.CharField(max_length=150, required=False)
    descripcion = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if self.CAMPOS_UBICACION.intersection(self.initial_data):
            raise serializers.ValidationError({
                "ubicacion": "La ubicacion aprobada es de solo lectura para el propietario."
            })
        return attrs

    def to_parqueadero_datos(self):
        return {
            campo: self.validated_data[campo]
            for campo in ("nombre", "descripcion")
            if campo in self.validated_data
        }

    def to_direccion_datos(self):
        return {}

    def to_ubicacion_datos(self):
        return {}


class ParqueaderoCrearDTO(serializers.Serializer):
    nombre = serializers.CharField(max_length=150)
    descripcion = serializers.CharField(required=False, allow_blank=True)
    calle_principal = serializers.CharField(max_length=200)
    calle_secundaria = serializers.CharField(max_length=200, required=False, allow_blank=True)
    numero_lote = serializers.CharField(max_length=50, required=False, allow_blank=True)
    latitud = serializers.DecimalField(max_digits=9, decimal_places=6)
    longitud = serializers.DecimalField(max_digits=9, decimal_places=6)

    def to_parqueadero_datos(self):
        return {
            "nombre": self.validated_data["nombre"],
            "descripcion": self.validated_data.get("descripcion", ""),
        }

    def to_direccion_datos(self):
        return {
            "calle_principal": self.validated_data["calle_principal"],
            "calle_secundaria": self.validated_data.get("calle_secundaria", ""),
            "numero_lote": self.validated_data.get("numero_lote", ""),
        }

    def to_ubicacion_datos(self):
        return {
            "latitud": self.validated_data["latitud"],
            "longitud": self.validated_data["longitud"],
        }


class EspacioCrearDTO(serializers.Serializer):
    parqueadero = serializers.IntegerField()
    nombre = serializers.CharField(max_length=50)


class EspacioCambiarEstadoDTO(serializers.Serializer):
    nombre = serializers.CharField(max_length=50, required=False)
    estado = serializers.ChoiceField(choices=EstadoEspacio.choices, required=False)
    tarifa_predeterminada = serializers.IntegerField(required=False, allow_null=True)
