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
            # Se quitó models.Index(fields=["email"]) para evitar errores de compilación
        ]

    def __str__(self):
        return f"{self.nombre} {self.apellido}"


class Cuenta(AbstractUser):
    # Se cambia OneToOneField por ForeignKey para respetar la relación 1 a 0..* del diagrama
    persona = models.ForeignKey(
        Persona,
        on_delete=models.CASCADE,
        related_name="cuentas" # Se cambia a plural por convención de uno a muchos
    )
    rol = models.CharField(max_length=20, choices=TipoRol.choices)
    estado = models.BooleanField(default=True)

    # Ocultamos para evitar duplicación con Persona.nombre / Persona.apellido
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