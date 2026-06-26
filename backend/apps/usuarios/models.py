from django.db import models
from django.contrib.auth.models import AbstractUser


class TipoIdentificacion(models.TextChoices):
    CI = "CI", "Cédula"
    PASAPORTE = "PASAPORTE", "Pasaporte"
    RUC = "RUC", "RUC"


class TipoRol(models.TextChoices):
    ADMINISTRADOR = "ADMINISTRADOR", "Administrador"
    PROPIETARIO = "PROPIETARIO", "Propietario"


class Persona(models.Model):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    tipo_identificacion = models.CharField(
        max_length=20,
        choices=TipoIdentificacion.choices
    )

    identificacion = models.CharField(max_length=20, unique=True)
    estado = models.BooleanField(default=True)

    class Meta:
        indexes = [
            models.Index(fields=["identificacion"]),
            models.Index(fields=["email"]),
        ]

    def __str__(self):
        return f"{self.nombre} {self.apellido}"


class Cuenta(AbstractUser):
    persona = models.OneToOneField(
        Persona,
        on_delete=models.CASCADE,
        related_name="cuenta"
    )
    rol = models.CharField(max_length=20, choices=TipoRol.choices)
    estado = models.BooleanField(default=True)

    # Eliminamos para evitar duplicación con Persona.nombres / Persona.apellidos
    first_name = None
    last_name = None

    correo = models.EmailField(unique=True)

    class Meta:
        indexes = [
            models.Index(fields=["rol"]),
            models.Index(fields=["estado"]),
        ]

    def __str__(self):
        return f"{self.username} ({self.get_rol_display()})"