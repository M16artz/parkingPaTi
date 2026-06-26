from django.db import models
from apps.parqueaderos.models import Parqueadero


class DiasSemana(models.TextChoices):
    LUNES = "LUNES", "Lunes"
    MARTES = "MARTES", "Martes"
    MIERCOLES = "MIERCOLES", "Miércoles"
    JUEVES = "JUEVES", "Jueves"
    VIERNES = "VIERNES", "Viernes"
    SABADO = "SABADO", "Sábado"
    DOMINGO = "DOMINGO", "Domingo"


class HorarioAtencion(models.Model):
    #Relación 1..* con Parqueadero (un parqueadero tiene uno o más horarios).
 
    parqueadero = models.ForeignKey(
        Parqueadero,
        on_delete=models.CASCADE,
        related_name="horarios"
    )
    dia = models.CharField(
        max_length=20,
        choices=DiasSemana.choices
    )
    hora_apertura = models.TimeField()
    hora_cierre = models.TimeField()

    class Meta:
        # Un parqueadero no puede tener dos horarios para el mismo día
        unique_together = ("parqueadero", "dia")
        indexes = [
            models.Index(fields=["dia"]),
        ]

    def __str__(self):
        return f"{self.parqueadero.nombre} - {self.dia}: {self.hora_apertura} a {self.hora_cierre}"