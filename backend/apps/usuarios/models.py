from django.db import models
from django.contrib.auth.models import AbstractUser


class TipoIdentificacion(models.TextChoices):
    CI = "CI", "Cédula"
    PASAPORTE = "PASAPORTE", "Pasaporte"
    RUC = "RUC", "RUC"


class Rol(models.TextChoices):
    ADMINISTRADOR = "ADMINISTRADOR", "Administrador"
    PROPIETARIO = "PROPIETARIO", "Propietario"


class Persona(models.Model):
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    tipo_identificacion = models.CharField(max_length=20, choices=TipoIdentificacion.choices)
    identificacion = models.CharField(max_length=20, unique=True)
    telefono = models.CharField(max_length=20)
    # Eliminamos email de aquí si Cuenta ya lo maneja por defecto, o lo dejamos aquí
    # y hacemos que Cuenta use el email de Persona. Lo ideal es dejarlo en Persona:
    email = models.EmailField(unique=True) 

    class Meta:
        indexes = [
            models.Index(fields=["identificacion"]),
            models.Index(fields=["email"]),
        ]


class Cuenta(AbstractUser):
    persona = models.OneToOneField(Persona, on_delete=models.CASCADE, related_name="cuenta")
    rol = models.CharField(max_length=20, choices=Rol.choices)
    activo = models.BooleanField(default=True)

    # Buenas prácticas: Limpiar campos heredados que no usaremos directamente en Cuenta
    first_name = None
    last_name = None

    class Meta:
        indexes = [
            models.Index(fields=["rol"]),
            models.Index(fields=["activo"]),
        ]