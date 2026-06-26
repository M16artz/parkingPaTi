from django.db import models
from apps.parqueaderos.models import Parqueadero


class EstrategiaTarifa(models.Model):
    precio_hora = models.DecimalField(max_digits=8, decimal_places=2)

    class Meta:
        indexes = [
            models.Index(fields=["precio_hora"]),
        ]

    def __str__(self):
        return f"Estrategia base: ${self.precio_hora}/hora"


class IncrementoTarifa(EstrategiaTarifa):
    parqueadero = models.OneToOneField(
        Parqueadero,
        on_delete=models.CASCADE,
        related_name="incremento_tarifa",
        null=True,
        blank=True
    )
    porcentaje = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"Incremento {self.porcentaje}% - {self.parqueadero}"


class DescuentoTarifa(EstrategiaTarifa):
    parqueadero = models.OneToOneField(
        Parqueadero,
        on_delete=models.CASCADE,
        related_name="descuento_tarifa",
        null=True,
        blank=True
    )
    porcentaje = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"Descuento {self.porcentaje}% - {self.parqueadero}"