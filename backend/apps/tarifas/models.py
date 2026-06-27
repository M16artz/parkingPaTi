from django.db import models
from apps.parqueaderos.models import Parqueadero

class EstrategiaTarifa(models.Model):
    # Movemos el parqueadero a la clase padre
    parqueadero = models.OneToOneField(
        Parqueadero,
        on_delete=models.CASCADE,
        related_name="tarifa" # Simplificamos el related_name
    )
    precio_hora = models.DecimalField(max_digits=8, decimal_places=2)

    class Meta:
        indexes = [
            models.Index(fields=["precio_hora"]),
        ]

    def __str__(self):
        return f"Tarifa Normal: ${self.precio_hora}/hora - {self.parqueadero}"


class IncrementoTarifa(EstrategiaTarifa):
    # Hereda 'parqueadero' y 'precio_hora' automáticamente
    porcentaje = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"Incremento {self.porcentaje}% - {self.parqueadero}"


class DescuentoTarifa(EstrategiaTarifa):
    # Hereda 'parqueadero' y 'precio_hora' automáticamente
    porcentaje = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"Descuento {self.porcentaje}% - {self.parqueadero}"