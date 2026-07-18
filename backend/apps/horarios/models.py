from django.db import models
from django.db.models import F, Q


class DiasSemana(models.TextChoices):
    LUNES = "LUNES", "Lunes"
    MARTES = "MARTES", "Martes"
    MIERCOLES = "MIERCOLES", "Miercoles"
    JUEVES = "JUEVES", "Jueves"
    VIERNES = "VIERNES", "Viernes"
    SABADO = "SABADO", "Sabado"
    DOMINGO = "DOMINGO", "Domingo"


class HorarioAtencion(models.Model):
    parqueadero = models.ForeignKey(
        "parqueaderos.Parqueadero",
        on_delete=models.CASCADE,
        related_name="horarios",
    )
    dia = models.CharField(max_length=20, choices=DiasSemana.choices)
    hora_apertura = models.TimeField()
    hora_cierre = models.TimeField()

    class Meta:
        indexes = [models.Index(fields=["parqueadero", "dia"])]
        constraints = [
            models.UniqueConstraint(fields=["parqueadero", "dia"], name="schedule_unique_day_per_park"),
            models.CheckConstraint(condition=Q(hora_apertura__lt=F("hora_cierre")), name="schedule_open_before_close"),
        ]

    def __str__(self):
        return f"{self.parqueadero.nombre} - {self.dia}: {self.hora_apertura} a {self.hora_cierre}"
