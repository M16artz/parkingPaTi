from django.db import models
from apps.parqueaderos.models import Parqueadero


class EstrategiaTarifa(models.Model):
    parqueadero = models.OneToOneField(
        Parqueadero,
        on_delete=models.CASCADE,
        related_name="tarifa"
    )

    tarifa_base = models.DecimalField(
        max_digits=8,
        decimal_places=2
    )

    class Meta:
        indexes = [
            models.Index(fields=["tarifa_base"])
        ]


class IncrementoTarifa(models.Model):
    estrategia = models.ForeignKey(EstrategiaTarifa, on_delete=models.CASCADE, related_name="incrementos")
    porcentaje = models.DecimalField(max_digits=5, decimal_places=2)
    motivo = models.CharField(max_length=100)
    
    # Control de tiempo añadido:
    aplica_fin_semana = models.BooleanField(default=False)
    hora_inicio = models.TimeField(null=True, blank=True)
    hora_fin = models.TimeField(null=True, blank=True)
    
class DescuentoTarifa(models.Model):
    estrategia = models.ForeignKey(
        EstrategiaTarifa,
        on_delete=models.CASCADE,
        related_name="descuentos"
    )

    porcentaje = models.DecimalField(
        max_digits=5,
        decimal_places=2
    )

    motivo = models.CharField(max_length=100)