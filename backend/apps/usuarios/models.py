from django.contrib.auth.models import AbstractUser
from django.db import models


class TipoIdentificacion(models.TextChoices):
    CI = "CI", "Cedula"
    PASAPORTE = "PASAPORTE", "Pasaporte"
    RUC = "RUC", "RUC"


class TipoRol(models.TextChoices):
    ADMINISTRADOR = "ADMINISTRADOR", "Administrador"
    PROPIETARIO = "PROPIETARIO", "Propietario"


class EstadoOnboarding(models.TextChoices):
    CORREO_PENDIENTE = "CORREO_PENDIENTE", "Correo pendiente"
    DATOS_INICIALES_PENDIENTES = "DATOS_INICIALES_PENDIENTES", "Datos iniciales pendientes"
    REVISION_PENDIENTE = "REVISION_PENDIENTE", "Revision pendiente"
    RECHAZADO = "RECHAZADO", "Rechazado"
    CONFIGURACION_PENDIENTE = "CONFIGURACION_PENDIENTE", "Configuracion pendiente"
    ACTIVO = "ACTIVO", "Activo"
    DESHABILITADO = "DESHABILITADO", "Deshabilitado"


class Persona(models.Model):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    tipo_identificacion = models.CharField(max_length=20, choices=TipoIdentificacion.choices)
    identificacion = models.CharField(max_length=20, unique=True)
    estado = models.BooleanField(default=True)

    class Meta:
        indexes = [models.Index(fields=["identificacion"])]

    def __str__(self):
        return f"{self.nombre} {self.apellido}"


class Cuenta(AbstractUser):
    persona = models.OneToOneField(Persona, on_delete=models.CASCADE, related_name="cuenta")
    rol = models.CharField(max_length=20, choices=TipoRol.choices, default=TipoRol.PROPIETARIO)
    correo = models.EmailField(unique=True)
    correo_verificado = models.BooleanField(default=False)
    correo_verificado_en = models.DateTimeField(null=True, blank=True)
    onboarding_estado = models.CharField(
        max_length=40,
        choices=EstadoOnboarding.choices,
        default=EstadoOnboarding.CORREO_PENDIENTE,
    )
    updated_at = models.DateTimeField(auto_now=True)

    first_name = None
    last_name = None

    class Meta:
        indexes = [
            models.Index(fields=["rol"]),
            models.Index(fields=["is_active"]),
            models.Index(fields=["onboarding_estado"]),
        ]

    def __str__(self):
        return f"{self.username} ({self.get_rol_display()})"


class VerificacionCorreo(models.Model):
    cuenta = models.ForeignKey(Cuenta, on_delete=models.CASCADE, related_name="verificaciones_correo")
    token_hash = models.CharField(max_length=128, unique=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["cuenta", "expires_at"])]
