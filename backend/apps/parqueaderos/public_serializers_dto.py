from decimal import Decimal, InvalidOperation

from django.conf import settings
from rest_framework import serializers

from apps.horarios.models import HorarioAtencion
from apps.parqueaderos.models import EstadoEspacio, Parqueadero
from apps.parqueaderos.operational_status import calcular_estado_actual
from apps.tarifas.models import CategoriaTarifa, TipoCategoriaTarifa


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
    normal_rate = serializers.DecimalField(
        source="tarifa_normal_publica",
        max_digits=8,
        decimal_places=2,
        allow_null=True,
        read_only=True,
    )

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
            "normal_rate",
            "updated_at",
        ]

    def get_address(self, parqueadero) -> str:
        direccion = parqueadero.direccion
        partes = [direccion.calle_principal, direccion.calle_secundaria]
        if direccion.numero_lote:
            partes.append(f"Lote {direccion.numero_lote}")
        return ", ".join(parte for parte in partes if parte)

    def get_status(self, parqueadero) -> str:
        estado = calcular_estado_actual(
            parqueadero,
            getattr(parqueadero, "horario_abierto_ahora", False),
        )
        return {
            "ABIERTO": "OPEN",
            "LLENO": "FULL",
            "CERRADO": "CLOSED",
            "FUERA_DE_SERVICIO": "OUT_OF_SERVICE",
            "INACTIVO": "CLOSED",
        }[estado]


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


class PublicSpaceDTO(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(source="nombre", read_only=True)
    status = serializers.SerializerMethodField()
    rate_code = serializers.SerializerMethodField()
    rate_name = serializers.SerializerMethodField()
    price_per_hour = serializers.SerializerMethodField()

    RATE_NAMES = {
        TipoCategoriaTarifa.NORMAL: "General",
        TipoCategoriaTarifa.DESCUENTO: "Descuento",
        TipoCategoriaTarifa.INCREMENTO: "Incremento",
    }

    def _tarifa_aplicada(self, espacio):
        if espacio.estado == EstadoEspacio.OCUPADO and espacio.estancias_activas:
            estancia = espacio.estancias_activas[0]
            return estancia.tarifa_tipo_snapshot, estancia.precio_hora_snapshot, None
        tarifa = espacio.tarifa_predeterminada
        if tarifa is None:
            return None, None, None
        return tarifa.codigo, tarifa.precio_hora, tarifa.nombre_visible

    def get_status(self, espacio):
        return {
            EstadoEspacio.LIBRE: "FREE",
            EstadoEspacio.OCUPADO: "OCCUPIED",
            EstadoEspacio.INHABILITADO: "DISABLED",
        }[espacio.estado]

    def get_rate_code(self, espacio):
        return self._tarifa_aplicada(espacio)[0]

    def get_rate_name(self, espacio):
        codigo, _, nombre = self._tarifa_aplicada(espacio)
        return nombre or self.RATE_NAMES.get(codigo)

    def get_price_per_hour(self, espacio):
        precio = self._tarifa_aplicada(espacio)[1]
        return format(precio, ".2f") if precio is not None else None


class PublicParkingDetailDTO(PublicParkingSummaryDTO):
    description = serializers.CharField(source="descripcion")
    rates = PublicRateDTO(source="tarifas_publicas", many=True)
    schedules = PublicScheduleDTO(source="horarios", many=True)
    spaces = PublicSpaceDTO(source="espacios_publicos", many=True)

    class Meta(PublicParkingSummaryDTO.Meta):
        fields = PublicParkingSummaryDTO.Meta.fields + ["description", "rates", "schedules", "spaces"]
