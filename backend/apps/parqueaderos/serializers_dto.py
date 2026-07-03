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
        # Agregada la disponibilidad
        fields = ["id", "nombre", "ubicacion", "tarifa", "disponibilidad", "espacios_disponibles"]

    def get_espacios_disponibles(self, obj):
        # Usa el valor pre-calculado por ParqueaderoRepository.listar()
        # (annotate) cuando esta disponible, evitando el N+1 de antes.
        # Fallback a la query individual solo si el objeto no vino del
        # repositorio anotado (p. ej. en tests unitarios del serializer).
        anotado = getattr(obj, "espacios_disponibles_count", None)
        if anotado is not None:
            return anotado
        return EspacioRepository.contar_disponibles(obj.id)


class ParqueaderoDetalleDTO(serializers.ModelSerializer):
    direccion = DireccionDTO(read_only=True)
    ubicacion = UbicacionDTO(read_only=True)
    espacios = EspacioDTO(many=True, read_only=True)

    class Meta:
        model = Parqueadero
        # Agregada disponibilidad y cambiado "cuenta" por "propietario"
        fields = [
            "id", "nombre", "estado", "validado", "tarifa", "disponibilidad",
            "direccion", "ubicacion", "espacios", "propietario",
        ]
        read_only_fields = ["id", "validado", "propietario"]

    # NOTA: se elimino el metodo create() que existia aqui - era codigo
    # muerto (la creacion real siempre pasa por ParqueaderoService/
    # ParqueaderoRepository.crear, ver ParqueaderoViewSet.create), y
    # mantener dos caminos de creacion divergentes es una fuente de bugs.


class ParqueaderoActualizarDTO(serializers.Serializer):
    """
    DTO de whitelist para PUT/PATCH (hallazgo 2.3: antes `update`/
    `partial_update` pasaban request.data crudo al repositorio via
    **kwargs, permitiendo mass assignment de `validado` o `propietario`).
    Solo se exponen los campos que un propietario puede modificar; `validado`
    y `propietario` quedan fuera a proposito.
    """
    nombre = serializers.CharField(max_length=150, required=False)
    estado = serializers.BooleanField(required=False)
    tarifa = serializers.DecimalField(max_digits=8, decimal_places=2, required=False)
    disponibilidad = serializers.ChoiceField(choices=Disponibilidad.choices, required=False)


class ParqueaderoCrearDTO(serializers.Serializer):
    nombre = serializers.CharField(max_length=150)
    tarifa = serializers.DecimalField(max_digits=8, decimal_places=2, default=0) # Adaptado a DecimalField

    calle_principal = serializers.CharField(max_length=200)
    calle_secundaria = serializers.CharField(max_length=200, required=False, allow_blank=True)
    numero_lote = serializers.CharField(max_length=50, required=False, allow_blank=True)

    latitud = serializers.DecimalField(max_digits=9, decimal_places=6) # Adaptado a DecimalField
    longitud = serializers.DecimalField(max_digits=9, decimal_places=6)

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

    def to_parqueadero_datos(self):
        return {
            "nombre": self.validated_data["nombre"],
            "tarifa": self.validated_data["tarifa"],
        }


# Nuevo DTO para forzar la validación del numero_espacio en la creación
class EspacioCrearDTO(serializers.Serializer):
    parqueadero = serializers.IntegerField()
    numero_espacio = serializers.CharField(max_length=20)


class EspacioCambiarEstadoDTO(serializers.Serializer):
    estado = serializers.ChoiceField(choices=TipoEstado.choices)
    