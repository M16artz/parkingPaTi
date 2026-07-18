from django.db import models
from django.db.models import Q


class EstadoEstancia(models.TextChoices):
    ACTIVA = "ACTIVA", "Activa"
    FINALIZADA = "FINALIZADA", "Finalizada"
    CANCELADA = "CANCELADA", "Cancelada"


class Estancia(models.Model):
    espacio = models.ForeignKey("parqueaderos.Espacio", on_delete=models.PROTECT, related_name="estancias")
    tarifa = models.ForeignKey("tarifas.CategoriaTarifa", on_delete=models.PROTECT, related_name="estancias")
    tarifa_tipo_snapshot = models.CharField(max_length=20)
    precio_hora_snapshot = models.DecimalField(max_digits=8, decimal_places=2)
    inicio = models.DateTimeField()
    fin = models.DateTimeField(null=True, blank=True)
    minutos_reales = models.PositiveIntegerField(null=True, blank=True)
    horas_cobradas = models.PositiveIntegerField(null=True, blank=True)
    costo_total = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    estado = models.CharField(max_length=20, choices=EstadoEstancia.choices, default=EstadoEstancia.ACTIVA)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["espacio", "estado"]),
            models.Index(fields=["estado", "fin"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["espacio"],
                condition=Q(estado=EstadoEstancia.ACTIVA),
                name="stay_one_active_per_space",
            ),
            models.CheckConstraint(condition=Q(precio_hora_snapshot__gte=0), name="stay_nonnegative_rate"),
            models.CheckConstraint(condition=Q(costo_total__isnull=True) | Q(costo_total__gte=0), name="stay_nonnegative_total"),
            models.CheckConstraint(
                condition=~Q(estado=EstadoEstancia.ACTIVA) | Q(fin__isnull=True),
                name="stay_active_without_end",
            ),
            models.CheckConstraint(
                condition=(
                    ~Q(estado=EstadoEstancia.FINALIZADA)
                    | (
                        Q(fin__isnull=False)
                        & Q(minutos_reales__isnull=False)
                        & Q(horas_cobradas__isnull=False)
                        & Q(costo_total__isnull=False)
                    )
                ),
                name="stay_finished_has_summary",
            ),
        ]
