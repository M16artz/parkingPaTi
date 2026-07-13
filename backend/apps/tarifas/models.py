from django.db import models
from django.db.models import Q


class TipoCategoriaTarifa(models.TextChoices):
    NORMAL = "NORMAL", "Normal"
    DESCUENTO = "DESCUENTO", "Descuento"
    INCREMENTO = "INCREMENTO", "Incremento"


class CategoriaTarifa(models.Model):
    parqueadero = models.ForeignKey(
        "parqueaderos.Parqueadero",
        on_delete=models.CASCADE,
        related_name="tarifas",
    )
    codigo = models.CharField(max_length=20, choices=TipoCategoriaTarifa.choices)
    nombre_visible = models.CharField(max_length=80)
    precio_hora = models.DecimalField(max_digits=8, decimal_places=2)
    activa = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=["parqueadero", "activa"])]
        constraints = [
            models.UniqueConstraint(
                fields=["parqueadero", "codigo"],
                name="rate_unique_type_per_park",
            ),
            models.CheckConstraint(condition=Q(precio_hora__gte=0), name="rate_nonnegative_price"),
        ]

    @property
    def es_normal(self):
        return self.codigo == TipoCategoriaTarifa.NORMAL

    def __str__(self):
        return f"{self.nombre_visible}: ${self.precio_hora}/hora - {self.parqueadero}"
