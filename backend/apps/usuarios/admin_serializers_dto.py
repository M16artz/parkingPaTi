from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field

from apps.documentos.models import DocumentoHabilitacion
from apps.parqueaderos.models import Parqueadero
from apps.usuarios.models import Cuenta, EstadoOnboarding, Persona


class AdminSolicitudQueryDTO(serializers.Serializer):
    onboarding_estado = serializers.ChoiceField(choices=EstadoOnboarding.choices, required=False)
    q = serializers.CharField(required=False, max_length=150, trim_whitespace=True)


class AdminCuentaQueryDTO(serializers.Serializer):
    onboarding_estado = serializers.ChoiceField(choices=EstadoOnboarding.choices, required=False)
    activo = serializers.BooleanField(required=False)
    q = serializers.CharField(required=False, max_length=150, trim_whitespace=True)


class AdminRechazoDTO(serializers.Serializer):
    motivo = serializers.CharField(min_length=3, max_length=1000, trim_whitespace=True)


class AdminPersonaDTO(serializers.ModelSerializer):
    class Meta:
        model = Persona
        fields = ["nombre", "apellido", "tipo_identificacion", "identificacion"]


class AdminParqueaderoDTO(serializers.ModelSerializer):
    calle_principal = serializers.CharField(source="direccion.calle_principal")
    calle_secundaria = serializers.CharField(source="direccion.calle_secundaria")
    numero_lote = serializers.CharField(source="direccion.numero_lote")
    latitud = serializers.DecimalField(source="ubicacion.latitud", max_digits=9, decimal_places=6)
    longitud = serializers.DecimalField(source="ubicacion.longitud", max_digits=9, decimal_places=6)

    class Meta:
        model = Parqueadero
        fields = [
            "id",
            "nombre",
            "descripcion",
            "habilitacion_estado",
            "estado_operativo",
            "motivo_rechazo",
            "calle_principal",
            "calle_secundaria",
            "numero_lote",
            "latitud",
            "longitud",
            "updated_at",
        ]


class AdminDocumentoDTO(serializers.ModelSerializer):
    revisado_por = serializers.SerializerMethodField()

    class Meta:
        model = DocumentoHabilitacion
        fields = [
            "id",
            "nombre_original",
            "mime_type",
            "size_bytes",
            "estado",
            "motivo_rechazo",
            "uploaded_at",
            "reviewed_at",
            "revisado_por",
        ]

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_revisado_por(self, obj):
        if obj.reviewed_by is None:
            return None
        persona = obj.reviewed_by.persona
        return f"{persona.nombre} {persona.apellido}"


class AdminSolicitudResumenDTO(serializers.ModelSerializer):
    persona = AdminPersonaDTO()
    parqueadero_nombre = serializers.CharField(source="parqueadero.nombre")
    documento_estado = serializers.CharField(source="documento_habilitacion.estado")
    actualizada_en = serializers.DateTimeField(source="parqueadero.updated_at")

    class Meta:
        model = Cuenta
        fields = [
            "id",
            "correo",
            "persona",
            "is_active",
            "onboarding_estado",
            "parqueadero_nombre",
            "documento_estado",
            "actualizada_en",
        ]


class AdminSolicitudPaginaDTO(serializers.Serializer):
    count = serializers.IntegerField()
    next = serializers.URLField(allow_null=True)
    previous = serializers.URLField(allow_null=True)
    results = AdminSolicitudResumenDTO(many=True)


class AdminSolicitudDetalleDTO(serializers.ModelSerializer):
    persona = AdminPersonaDTO()
    parqueadero = AdminParqueaderoDTO()
    documento = AdminDocumentoDTO(source="documento_habilitacion")

    class Meta:
        model = Cuenta
        fields = [
            "id",
            "correo",
            "persona",
            "is_active",
            "correo_verificado",
            "onboarding_estado",
            "date_joined",
            "parqueadero",
            "documento",
        ]


class AdminCuentaResumenDTO(serializers.ModelSerializer):
    persona = AdminPersonaDTO()
    parqueadero_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Cuenta
        fields = [
            "id",
            "correo",
            "persona",
            "is_active",
            "correo_verificado",
            "onboarding_estado",
            "parqueadero_nombre",
            "date_joined",
        ]

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_parqueadero_nombre(self, obj):
        parqueadero = getattr(obj, "parqueadero", None)
        return parqueadero.nombre if parqueadero else None


class AdminCuentaPaginaDTO(serializers.Serializer):
    count = serializers.IntegerField()
    next = serializers.URLField(allow_null=True)
    previous = serializers.URLField(allow_null=True)
    results = AdminCuentaResumenDTO(many=True)


class AdminCuentaDetalleDTO(serializers.ModelSerializer):
    persona = AdminPersonaDTO()
    parqueadero = serializers.SerializerMethodField()
    documento = serializers.SerializerMethodField()

    class Meta:
        model = Cuenta
        fields = [
            "id",
            "correo",
            "persona",
            "is_active",
            "correo_verificado",
            "onboarding_estado",
            "date_joined",
            "parqueadero",
            "documento",
        ]

    @extend_schema_field(AdminParqueaderoDTO(allow_null=True))
    def get_parqueadero(self, obj):
        parqueadero = getattr(obj, "parqueadero", None)
        return AdminParqueaderoDTO(parqueadero).data if parqueadero else None

    @extend_schema_field(AdminDocumentoDTO(allow_null=True))
    def get_documento(self, obj):
        documento = getattr(obj, "documento_habilitacion", None)
        return AdminDocumentoDTO(documento).data if documento else None


class AdminAccionResponseDTO(serializers.Serializer):
    detail = serializers.CharField()
    cuenta_id = serializers.IntegerField()
    onboarding_estado = serializers.CharField()
    email_enviado = serializers.BooleanField(required=False)


class AdminDocumentoAccesoDTO(serializers.Serializer):
    url = serializers.URLField()
