from django.db import models
from apps.usuarios.models import Cuenta


class Documento(models.Model):
    #Relacion: Doc a Cuenta
    cuenta = models.OneToOneField(
        Cuenta,
        on_delete=models.CASCADE,
        related_name="documento"
    )
    es_valido = models.BooleanField(default=False)
    fecha_expiracion = models.DateField(null=True, blank=True)
    ruta = models.URLField()

    class Meta:
        indexes = [
            models.Index(fields=["es_valido"]),
        ]

    def __str__(self):
        return f"Documento de {self.cuenta} ({'Válido' if self.es_valido else 'Pendiente'})"