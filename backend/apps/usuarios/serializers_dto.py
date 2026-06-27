"""
DTOs (serializers de DRF) para la app usuarios.
"""

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from apps.usuarios.models import Cuenta, Persona, TipoIdentificacion, TipoRol


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
        fields = ["id", "username", "nombre_completo", "rol", "rol_display", "estado"]

    def get_nombre_completo(self, obj):
        return f"{obj.persona.nombre} {obj.persona.apellido}"


class CuentaDetalleDTO(serializers.ModelSerializer):
    persona = PersonaDTO(read_only=True)
    rol_display = serializers.CharField(source="get_rol_display", read_only=True)

    class Meta:
        model = Cuenta
        fields = ["id", "username", "correo", "persona", "rol", "rol_display", "estado", "date_joined"]
        read_only_fields = ["id", "date_joined", "rol"]


class CuentaActualizarDTO(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = Cuenta
        fields = ["correo", "password", "estado"]


class RegistroDTO(serializers.Serializer):
    nombre = serializers.CharField(max_length=100)
    apellido = serializers.CharField(max_length=100)
    tipo_identificacion = serializers.ChoiceField(choices=TipoIdentificacion.choices)
    identificacion = serializers.CharField(max_length=20)

    username = serializers.CharField(max_length=150)
    correo = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)

    rol = serializers.ChoiceField(
        choices=TipoRol.choices, default=TipoRol.PROPIETARIO, required=False
    )

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


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        token["rol"] = user.rol
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        refresh = self.get_token(self.user)
        data["refresh"] = str(refresh)
        data["access"] = str(refresh.access_token)
        data["username"] = self.user.username
        data["rol"] = self.user.rol
        return data
