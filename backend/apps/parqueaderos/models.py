from django.db import models
from apps.usuarios.models import Cuenta


class Disponibilidad(models.TextChoices):
    ABIERTO = "ABIERTO", "Abierto"
    CERRADO = "CERRADO", "Cerrado"
    LLENO = "LLENO", "Lleno"
    FUERA_DE_SERVICIO = "FUERA_DE_SERVICIO", "Fuera de servicio"

#Parqueadero 
class Parqueadero(models.Model):
    propietario = models.ForeignKey(
        Cuenta,
        on_delete=models.CASCADE,
        related_name="parqueaderos"
    )

    nombre = models.CharField(max_length=150)
    estado = models.BooleanField(default=True)
    validado = models.BooleanField(default=False)
    tarifa = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    disponibilidad = models.CharField(
        max_length=20,
        choices=Disponibilidad.choices,
        default=Disponibilidad.CERRADO
    )

    class Meta:
        indexes = [
            models.Index(fields=["nombre"]),
            models.Index(fields=["validado"]),
            models.Index(fields=["estado"]),
            models.Index(fields=["disponibilidad"]),
        ]

    def __str__(self):
        return self.nombre


#Para Direccion
class Direccion(models.Model):
    parqueadero = models.OneToOneField(
        Parqueadero,
        on_delete=models.CASCADE,
        related_name="direccion"
    )
    calle_principal = models.CharField(max_length=200)
    calle_secundaria = models.CharField(max_length=200, blank=True)
    numero_lote = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return f"{self.calle_principal} - {self.parqueadero.nombre}"


#Para Ubicacion
class Ubicacion(models.Model):
    parqueadero = models.OneToOneField(
        Parqueadero,
        on_delete=models.CASCADE,
        related_name="ubicacion"
    )
    latitud = models.DecimalField(max_digits=9, decimal_places=6)
    longitud = models.DecimalField(max_digits=9, decimal_places=6)

    class Meta:
        indexes = [
            models.Index(fields=["latitud", "longitud"]),
        ]

    def __str__(self):
        return f"({self.latitud}, {self.longitud})"

#Para Espacio y TipoEstado
class TipoEstado(models.TextChoices):
    OCUPADO = "OCUPADO", "Ocupado"
    LIBRE = "LIBRE", "Libre"
    INHABILITADO = "INHABILITADO", "Inhabilitado"


class Espacio(models.Model):
    parqueadero = models.ForeignKey(
        Parqueadero,
        on_delete=models.CASCADE,
        related_name="espacios"
    )
    numero_espacio = models.CharField(max_length=20) #Espacio 1, 2 etc 
    estado = models.CharField(
        max_length=20,
        choices=TipoEstado.choices,
        default=TipoEstado.LIBRE
    )

    class Meta:
        unique_together = ("parqueadero", "numero_espacio")
        indexes = [
            models.Index(fields=["estado"]),
            models.Index(fields=["parqueadero"]),
        ]

    def __str__(self):
        return f"{self.codigo} - {self.get_estado_display()}"