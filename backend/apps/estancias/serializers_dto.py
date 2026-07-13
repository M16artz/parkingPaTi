from rest_framework import serializers

from apps.estancias.models import Estancia


class EstanciaInicioDTO(serializers.Serializer):
    tarifa_id = serializers.IntegerField(required=False, allow_null=True, min_value=1)


class EstanciaResponseDTO(serializers.Serializer):
    id = serializers.IntegerField()
    espacio_id = serializers.IntegerField()
    espacio_nombre = serializers.CharField()
    parqueadero_id = serializers.IntegerField()
    parqueadero_nombre = serializers.CharField()
    tarifa_id = serializers.IntegerField()
    tarifa_tipo_snapshot = serializers.CharField()
    precio_hora_snapshot = serializers.DecimalField(max_digits=8, decimal_places=2)
    inicio = serializers.DateTimeField()
    fin = serializers.DateTimeField(allow_null=True)
    calculado_hasta = serializers.DateTimeField()
    minutos_reales = serializers.IntegerField()
    horas_cobradas = serializers.IntegerField()
    costo_total = serializers.DecimalField(max_digits=10, decimal_places=2)
    estado = serializers.CharField()


class EstanciaRegistroDTO(serializers.ModelSerializer):
    espacio_nombre = serializers.CharField(source="espacio.nombre")
    parqueadero_id = serializers.IntegerField(source="espacio.parqueadero_id")
    parqueadero_nombre = serializers.CharField(source="espacio.parqueadero.nombre")
    calculado_hasta = serializers.DateTimeField(source="fin")

    class Meta:
        model = Estancia
        fields = [
            "id",
            "espacio_id",
            "espacio_nombre",
            "parqueadero_id",
            "parqueadero_nombre",
            "tarifa_id",
            "tarifa_tipo_snapshot",
            "precio_hora_snapshot",
            "inicio",
            "fin",
            "calculado_hasta",
            "minutos_reales",
            "horas_cobradas",
            "costo_total",
            "estado",
        ]


class EstanciaPaginaDTO(serializers.Serializer):
    count = serializers.IntegerField()
    next = serializers.URLField(allow_null=True)
    previous = serializers.URLField(allow_null=True)
    results = EstanciaRegistroDTO(many=True)
