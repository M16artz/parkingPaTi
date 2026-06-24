from django.db import models
from apps.parqueaderos.models import Parqueadero


class Documento(models.Model):
    parqueadero = models.ForeignKey(
        Parqueadero,
        on_delete=models.CASCADE,
        related_name="documentos"
    )

    nombre = models.CharField(max_length=200)
    archivo_url = models.URLField()
    fecha_subida = models.DateTimeField(auto_now_add=True)

    fecha_expiracion = models.DateField(null=True, blank=True)
    
    # Por defecto es False hasta que el administrador lo apruebe formalmente
    es_valido = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=["fecha_subida"]),
            models.Index(fields=["es_valido"]), # Optimiza las búsquedas de documentos pendientes de aprobación
        ]

    def __str__(self):
        return f"{self.nombre} - {self.parqueadero.nombre} ({'Válido' if self.es_valido else 'Pendiente'})"