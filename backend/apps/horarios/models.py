from django.db import models
from apps.parqueaderos.models import Parqueadero


class DiaSemana(models.TextChoices):
    LUNES = "LUNES", "Lunes"
    MARTES = "MARTES", "Martes"
    MIERCOLES = "MIERCOLES", "Miércoles"
    JUEVES = "JUEVES", "Jueves"
    VIERNES = "VIERNES", "Viernes"
    SABADO = "SABADO", "Sábado"
    DOMINGO = "DOMINGO", "Domingo"


class HorarioAtencion(models.Model):
    parqueadero = models.ForeignKey(
        Parqueadero,
        on_delete=models.CASCADE,
        related_name="horarios"
    )

    dia = models.CharField(
        max_length=20,
        choices=DiaSemana.choices
    )

    hora_apertura = models.TimeField()
    hora_cierre = models.TimeField()

    class Meta:
        unique_together = ("parqueadero", "dia")

        indexes = [
            models.Index(fields=["dia"]),
        ]