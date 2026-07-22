"""
DTOs (serializers de DRF) para la app usuarios.
"""

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from apps.documentos.serializers_dto import DocumentoEscrituraDTO
from apps.usuarios.models import Cuenta, EstadoOnboarding, Persona, TipoIdentificacion, TipoRol


class PersonaDTO(serializers.ModelSerializer):
    class Meta:
        model = Persona
        fields = [
            "id", "nombre", "apellido",
            "tipo_identificacion", "identificacion", "estado",
        ]


class CuentaResumenDTO(serializers.ModelSerializer):
    nombre_completo = serializers.SerializerMethodField()
    # Usamos get_rol_display de Django para mostrar el texto amigable
    rol_display = serializers.CharField(source="get_rol_display", read_only=True)

    class Meta:
        model = Cuenta
        fields = ["id", "username", "nombre_completo", "rol", "rol_display", "is_active", "onboarding_estado"]

    def get_nombre_completo(self, obj):
        return f"{obj.persona.nombre} {obj.persona.apellido}"


class CuentaDetalleDTO(serializers.ModelSerializer):
    persona = PersonaDTO(read_only=True)
    rol_display = serializers.CharField(source="get_rol_display", read_only=True)

    class Meta:
        model = Cuenta
        fields = [
            "id", "username", "correo", "persona", "rol", "rol_display",
            "is_active", "correo_verificado", "onboarding_estado", "date_joined",
        ]
        read_only_fields = ["id", "date_joined", "rol"]


class CuentaActualizarDTO(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = Cuenta
        fields = ["correo", "password"]

    def validate_password(self, value):
        validate_password(value, user=self.instance)
        return value


class DisponibilidadCorreoDTO(serializers.Serializer):
    correo = serializers.EmailField(max_length=254)


class DisponibilidadCorreoResponseDTO(serializers.Serializer):
    disponible = serializers.BooleanField()


class AdminCrearCuentaDTO(serializers.Serializer):
    """
    DTO exclusivo del endpoint administrativo de creacion de cuentas
    (protegido con EsAdministrador). A diferencia de RegistroDTO (registro
    publico), este SI permite elegir el rol, porque quien lo invoca ya es
    un administrador autenticado.
    """
    nombre = serializers.CharField(max_length=100)
    apellido = serializers.CharField(max_length=100)
    tipo_identificacion = serializers.ChoiceField(choices=TipoIdentificacion.choices)
    identificacion = serializers.CharField(max_length=20)

    username = serializers.CharField(max_length=150)
    correo = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    rol = serializers.ChoiceField(choices=TipoRol.choices, default=TipoRol.PROPIETARIO)

    def validate_password(self, value):
        validate_password(value)
        return value

    def to_datos_persona(self):
        return {
            "nombre": self.validated_data["nombre"],
            "apellido": self.validated_data["apellido"],
            "tipo_identificacion": self.validated_data["tipo_identificacion"],
            "identificacion": self.validated_data["identificacion"],
        }

    def to_datos_cuenta(self):
        return {
            "username": self.validated_data["username"],
            "correo": self.validated_data["correo"],
            "password": self.validated_data["password"],
        }


class RegistroDTO(serializers.Serializer):
    nombre = serializers.CharField(max_length=100)
    apellido = serializers.CharField(max_length=100)
    tipo_identificacion = serializers.ChoiceField(choices=TipoIdentificacion.choices)
    identificacion = serializers.CharField(max_length=20)

    correo = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)

    # SEGURIDAD (hallazgo 2.2 de la auditoria): el registro publico NO debe
    # aceptar el rol desde el cliente - de lo contrario cualquiera puede
    # autoregistrarse como ADMINISTRADOR. El rol de una cuenta nueva creada
    # por este endpoint siempre es PROPIETARIO. Crear administradores es una
    # operacion separada, protegida con EsAdministrador.

    def validate_password(self, value):
        # Corre TODOS los validadores de AUTH_PASSWORD_VALIDATORS
        # (similitud con el usuario, longitud, contraseñas comunes, etc.),
        # no solo el min_length=8 declarado arriba.
        validate_password(value)
        return value

    def to_datos_persona(self):
        return {
            "nombre": self.validated_data["nombre"],
            "apellido": self.validated_data["apellido"],
            "tipo_identificacion": self.validated_data["tipo_identificacion"],
            "identificacion": self.validated_data["identificacion"],
        }

    def to_datos_cuenta(self):
        correo = self.validated_data["correo"].strip().lower()
        return {
            "username": correo,
            "correo": correo,
            "password": self.validated_data["password"],
        }


class RegistroCompletoDTO(RegistroDTO):
    nombre_parqueadero = serializers.CharField(max_length=150)
    descripcion = serializers.CharField(required=False, allow_blank=True)
    calle_principal = serializers.CharField(max_length=200)
    calle_secundaria = serializers.CharField(max_length=200, required=False, allow_blank=True)
    numero_lote = serializers.CharField(max_length=50, required=False, allow_blank=True)
    latitud = serializers.DecimalField(max_digits=9, decimal_places=6)
    longitud = serializers.DecimalField(max_digits=9, decimal_places=6)
    archivo = serializers.FileField(write_only=True)

    def validate_archivo(self, value):
        documento = DocumentoEscrituraDTO(data={"archivo": value})
        documento.is_valid(raise_exception=True)
        return documento.validated_data["archivo"]

    def to_parqueadero_datos(self):
        return {
            "nombre": self.validated_data["nombre_parqueadero"],
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


class VerificarCorreoDTO(serializers.Serializer):
    token = serializers.CharField(min_length=32, max_length=512, trim_whitespace=True)


class ReenviarVerificacionDTO(serializers.Serializer):
    correo = serializers.EmailField()


class MensajeDTO(serializers.Serializer):
    detail = serializers.CharField(read_only=True)


class VerificarCorreoResponseDTO(MensajeDTO):
    onboarding_estado = serializers.CharField(read_only=True)


class RegistroResponseDTO(MensajeDTO):
    cuenta = CuentaDetalleDTO(read_only=True)
    email_enviado = serializers.BooleanField(read_only=True)


class OnboardingEstadoDTO(serializers.Serializer):
    estado = serializers.CharField()
    paso = serializers.CharField()
    correo_verificado = serializers.BooleanField()
    parqueadero = serializers.DictField(allow_null=True)
    documento = serializers.DictField(allow_null=True)


class CookieTokenRefreshResponseDTO(serializers.Serializer):
    access = serializers.CharField(read_only=True)


class EmptyDTO(serializers.Serializer):
    pass


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    correo = serializers.EmailField(write_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields.pop(self.username_field, None)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        token["rol"] = user.rol
        return token

    def validate(self, attrs):
        from apps.usuarios.services import SesionService

        self.user = SesionService.autenticar_por_correo(
            attrs["correo"],
            attrs["password"],
            request=self.context.get("request"),
        )
        refresh = self.get_token(self.user)
        return {
            "access": str(refresh.access_token),
            "refresh_cookie": str(refresh),
            "username": self.user.username,
            "rol": self.user.rol,
            "onboarding_estado": self.user.onboarding_estado,
        }
