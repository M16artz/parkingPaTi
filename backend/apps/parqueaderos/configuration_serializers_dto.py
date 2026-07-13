from rest_framework import serializers

from apps.horarios.models import DiasSemana, HorarioAtencion
from apps.parqueaderos.models import Espacio, EstadoEspacio
from apps.tarifas.models import CategoriaTarifa, TipoCategoriaTarifa


class HorarioConfiguracionDTO(serializers.Serializer):
    dia = serializers.ChoiceField(choices=DiasSemana.choices)
    hora_apertura = serializers.TimeField()
    hora_cierre = serializers.TimeField()

    def validate(self, data):
        if data["hora_apertura"] >= data["hora_cierre"]:
            raise serializers.ValidationError("La apertura debe ser anterior al cierre.")
        return data


class TarifaConfiguracionDTO(serializers.Serializer):
    codigo = serializers.ChoiceField(choices=TipoCategoriaTarifa.choices)
    nombre_visible = serializers.CharField(max_length=80, required=False, allow_blank=False)
    precio_hora = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=0)
    activa = serializers.BooleanField(required=False, default=True)


class ConfiguracionFinalDTO(serializers.Serializer):
    horarios = HorarioConfiguracionDTO(many=True, allow_empty=False)
    tarifas = TarifaConfiguracionDTO(many=True, allow_empty=False)
    cantidad_espacios = serializers.IntegerField(min_value=1, max_value=500)

    def validate(self, data):
        dias = [item["dia"] for item in data["horarios"]]
        if len(dias) != len(set(dias)):
            raise serializers.ValidationError({"horarios": "No se puede repetir un dia."})
        codigos = [item["codigo"] for item in data["tarifas"]]
        if len(codigos) != len(set(codigos)):
            raise serializers.ValidationError({"tarifas": "No se puede repetir un tipo de tarifa."})
        if TipoCategoriaTarifa.NORMAL not in codigos:
            raise serializers.ValidationError({"tarifas": "La tarifa NORMAL es obligatoria."})
        return data


class HorarioConfiguracionResponseDTO(serializers.ModelSerializer):
    class Meta:
        model = HorarioAtencion
        fields = ["id", "dia", "hora_apertura", "hora_cierre"]


class TarifaConfiguracionResponseDTO(serializers.ModelSerializer):
    class Meta:
        model = CategoriaTarifa
        fields = ["id", "codigo", "nombre_visible", "precio_hora", "activa"]


class EspacioConfiguracionResponseDTO(serializers.ModelSerializer):
    tarifa_codigo = serializers.CharField(source="tarifa_predeterminada.codigo", allow_null=True)
    tarifa_precio_hora = serializers.DecimalField(
        source="tarifa_predeterminada.precio_hora",
        max_digits=8,
        decimal_places=2,
        allow_null=True,
    )

    class Meta:
        model = Espacio
        fields = [
            "id",
            "nombre",
            "estado",
            "tarifa_predeterminada",
            "tarifa_codigo",
            "tarifa_precio_hora",
            "is_active",
            "deleted_at",
        ]


class ConfiguracionFinalResponseDTO(serializers.Serializer):
    parqueadero_id = serializers.IntegerField()
    configuracion_completa = serializers.BooleanField()
    onboarding_estado = serializers.CharField()
    estado_operativo = serializers.CharField()
    total_espacios = serializers.IntegerField()
    espacios_disponibles = serializers.IntegerField()
    horarios = HorarioConfiguracionResponseDTO(many=True)
    tarifas = TarifaConfiguracionResponseDTO(many=True)
    espacios = EspacioConfiguracionResponseDTO(many=True)


class EspaciosLoteDTO(serializers.Serializer):
    cantidad = serializers.IntegerField(min_value=1, max_value=100)


class EspacioEditarDTO(serializers.Serializer):
    nombre = serializers.CharField(max_length=50, required=False, trim_whitespace=True)
    estado = serializers.ChoiceField(
        choices=[EstadoEspacio.LIBRE, EstadoEspacio.INHABILITADO],
        required=False,
    )
    tarifa_predeterminada = serializers.IntegerField(required=False)

    def validate_nombre(self, value):
        if not value:
            raise serializers.ValidationError("El nombre no puede estar vacio.")
        return value
