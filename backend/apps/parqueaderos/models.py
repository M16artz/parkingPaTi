from django.db import models
from apps.usuarios.models import Persona


class Parqueadero(models.Model):
    propietario = models.ForeignKey(Persona, on_delete=models.CASCADE, related_name="parqueaderos")
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True)
    
    # Dirección incrustada (Adiós tabla Direccion)
    calle_principal = models.CharField(max_length=200)
    calle_secundaria = models.CharField(max_length=200, blank=True)
    referencia = models.TextField(blank=True)
    
    # Ubicación incrustada (Adiós tabla Ubicacion)
    # Usamos DecimalField para almacenar coordenadas exactas de GPS
    latitud = models.DecimalField(max_digits=9, decimal_places=6)
    longitud = models.DecimalField(max_digits=9, decimal_places=6)

    aprobado = models.BooleanField(default=False)
    activo = models.BooleanField(default=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["nombre"]),
            models.Index(fields=["aprobado"]),
            models.Index(fields=["activo"]),
            models.Index(fields=["latitud", "longitud"]), # Indispensable para búsquedas por GPS
        ]

class EstadoEspacio(models.TextChoices):
    LIBRE = "LIBRE", "Libre"
    OCUPADO = "OCUPADO", "Ocupado"
    INHABILITADO = "INHABILITADO", "Inhabilitado"


class Espacio(models.Model):
    parqueadero = models.ForeignKey(
        Parqueadero,
        on_delete=models.CASCADE,
        related_name="espacios"
    )

    codigo = models.CharField(max_length=20)

    estado = models.CharField(
        max_length=20,
        choices=EstadoEspacio.choices,
        default=EstadoEspacio.LIBRE
    )

    class Meta:
        unique_together = ("parqueadero", "codigo")

        indexes = [
            models.Index(fields=["estado"]),
            models.Index(fields=["parqueadero"]),
        ]

    def __str__(self):
        return self.codigo

