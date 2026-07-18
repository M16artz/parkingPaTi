from django.conf import settings
from django.db import models
from django.db.models import Q


class EstadoHabilitacion(models.TextChoices):
    BORRADOR = "BORRADOR", "Borrador"
    PENDIENTE = "PENDIENTE", "Pendiente"
    APROBADO = "APROBADO", "Aprobado"
    RECHAZADO = "RECHAZADO", "Rechazado"


class EstadoOperativo(models.TextChoices):
    ABIERTO = "ABIERTO", "Abierto"
    LLENO = "LLENO", "Lleno"
    CERRADO = "CERRADO", "Cerrado"
    INACTIVO = "INACTIVO", "Inactivo"
    FUERA_DE_SERVICIO = "FUERA_DE_SERVICIO", "Fuera de servicio"


class EstadoOperativoManual(models.TextChoices):
    CERRADO = "CERRADO", "Cerrado"
    FUERA_DE_SERVICIO = "FUERA_DE_SERVICIO", "Fuera de servicio"


class EstadoEspacio(models.TextChoices):
    OCUPADO = "OCUPADO", "Ocupado"
    LIBRE = "LIBRE", "Libre"
    INHABILITADO = "INHABILITADO", "Inhabilitado"


class Parqueadero(models.Model):
    propietario = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="parqueadero",
    )
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True)
    habilitacion_estado = models.CharField(
        max_length=20,
        choices=EstadoHabilitacion.choices,
        default=EstadoHabilitacion.BORRADOR,
    )
    motivo_rechazo = models.TextField(blank=True)
    estado_operativo = models.CharField(
        max_length=30,
        choices=EstadoOperativo.choices,
        default=EstadoOperativo.INACTIVO,
    )
    estado_operativo_manual = models.CharField(
        max_length=30,
        choices=EstadoOperativoManual.choices,
        null=True,
        blank=True,
    )
    total_espacios = models.PositiveIntegerField(default=0)
    espacios_disponibles = models.PositiveIntegerField(default=0)
    configuracion_completa = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["nombre"]),
            models.Index(
                fields=["habilitacion_estado", "configuracion_completa", "estado_operativo"]
            ),
        ]
        constraints = [
            models.CheckConstraint(
                condition=Q(espacios_disponibles__lte=models.F("total_espacios")),
                name="park_available_lte_total",
            ),
        ]

    def __str__(self):
        return self.nombre


class Direccion(models.Model):
    parqueadero = models.OneToOneField(Parqueadero, on_delete=models.CASCADE, related_name="direccion")
    calle_principal = models.CharField(max_length=200)
    calle_secundaria = models.CharField(max_length=200, blank=True)
    numero_lote = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return f"{self.calle_principal} - {self.parqueadero.nombre}"


class Ubicacion(models.Model):
    parqueadero = models.OneToOneField(Parqueadero, on_delete=models.CASCADE, related_name="ubicacion")
    latitud = models.DecimalField(max_digits=9, decimal_places=6)
    longitud = models.DecimalField(max_digits=9, decimal_places=6)

    class Meta:
        indexes = [models.Index(fields=["latitud", "longitud"])]
        constraints = [
            models.CheckConstraint(
                condition=Q(latitud__gte=-90) & Q(latitud__lte=90),
                name="location_valid_latitude",
            ),
            models.CheckConstraint(
                condition=Q(longitud__gte=-180) & Q(longitud__lte=180),
                name="location_valid_longitude",
            ),
        ]

    def __str__(self):
        return f"({self.latitud}, {self.longitud})"


class Espacio(models.Model):
    parqueadero = models.ForeignKey(Parqueadero, on_delete=models.CASCADE, related_name="espacios")
    nombre = models.CharField(max_length=50)
    estado = models.CharField(max_length=20, choices=EstadoEspacio.choices, default=EstadoEspacio.LIBRE)
    tarifa_predeterminada = models.ForeignKey(
        "tarifas.CategoriaTarifa",
        on_delete=models.PROTECT,
        related_name="espacios_predeterminados",
        null=True,
        blank=True,
    )
    is_active = models.BooleanField(default=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["parqueadero", "estado"]),
            models.Index(fields=["parqueadero", "is_active"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["parqueadero", "nombre"],
                condition=Q(is_active=True),
                name="space_unique_active_name_per_park",
            ),
        ]

    def __str__(self):
        return f"{self.nombre} - {self.get_estado_display()}"


Disponibilidad = EstadoOperativo
TipoEstado = EstadoEspacio
