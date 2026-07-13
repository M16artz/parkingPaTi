from decimal import Decimal, InvalidOperation

from django.conf import settings
from rest_framework import serializers

from apps.horarios.models import HorarioAtencion
from apps.parqueaderos.models import Parqueadero
from apps.tarifas.models import CategoriaTarifa


class PublicParkingQueryDTO(serializers.Serializer):
    bbox = serializers.CharField()

    def validate_bbox(self, value):
        partes = [item.strip() for item in value.split(",")]
        if len(partes) != 4:
            raise serializers.ValidationError("Usa minLng,minLat,maxLng,maxLat.")
        try:
            min_lng, min_lat, max_lng, max_lat = [Decimal(item) for item in partes]
        except InvalidOperation as exc:
            raise serializers.ValidationError("Todos los valores bbox deben ser numericos.") from exc
        if min_lng >= max_lng or min_lat >= max_lat:
            raise serializers.ValidationError("El bbox debe respetar minimos menores que maximos.")

        loja_min_lng, loja_min_lat, loja_max_lng, loja_max_lat = [
            Decimal(str(item)) for item in settings.LOJA_BBOX
        ]
        tolerancia = Decimal(str(settings.LOJA_BBOX_TOLERANCE))
        if not (
            min_lng >= loja_min_lng - tolerancia
            and min_lat >= loja_min_lat - tolerancia
            and max_lng <= loja_max_lng + tolerancia
            and max_lat <= loja_max_lat + tolerancia
        ):
            raise serializers.ValidationError("El bbox debe permanecer dentro del limite autorizado de Loja.")
        return min_lng, min_lat, max_lng, max_lat


class PublicParkingSummaryDTO(serializers.ModelSerializer):
    name = serializers.CharField(source="nombre")
    latitude = serializers.FloatField(source="ubicacion.latitud")
    longitude = serializers.FloatField(source="ubicacion.longitud")
    address = serializers.SerializerMethodField()
    total_spaces = serializers.IntegerField(source="total_espacios")
    available_spaces = serializers.IntegerField(source="espacios_disponibles")
    status = serializers.SerializerMethodField()

    class Meta:
        model = Parqueadero
        fields = [
            "id",
            "name",
            "latitude",
            "longitude",
            "address",
            "total_spaces",
            "available_spaces",
            "status",
            "updated_at",
        ]

    def get_address(self, parqueadero) -> str:
        direccion = parqueadero.direccion
        partes = [direccion.calle_principal, direccion.calle_secundaria]
        if direccion.numero_lote:
            partes.append(f"Lote {direccion.numero_lote}")
        return ", ".join(parte for parte in partes if parte)

    def get_status(self, parqueadero) -> str:
        return {
            "ABIERTO": "OPEN",
            "LLENO": "FULL",
            "CERRADO": "CLOSED",
        }[parqueadero.estado_operativo]


class PublicParkingListDTO(serializers.Serializer):
    updated_at = serializers.DateTimeField()
    results = PublicParkingSummaryDTO(many=True)


class PublicRateDTO(serializers.ModelSerializer):
    code = serializers.CharField(source="codigo")
    name = serializers.CharField(source="nombre_visible")
    price_per_hour = serializers.DecimalField(source="precio_hora", max_digits=8, decimal_places=2)

    class Meta:
        model = CategoriaTarifa
        fields = ["code", "name", "price_per_hour"]


class PublicScheduleDTO(serializers.ModelSerializer):
    day = serializers.CharField(source="dia")
    opens_at = serializers.TimeField(source="hora_apertura")
    closes_at = serializers.TimeField(source="hora_cierre")

    class Meta:
        model = HorarioAtencion
        fields = ["day", "opens_at", "closes_at"]


class PublicParkingDetailDTO(PublicParkingSummaryDTO):
    description = serializers.CharField(source="descripcion")
    rates = PublicRateDTO(source="tarifas_publicas", many=True)
    schedules = PublicScheduleDTO(source="horarios", many=True)

    class Meta(PublicParkingSummaryDTO.Meta):
        fields = PublicParkingSummaryDTO.Meta.fields + ["description", "rates", "schedules"]
