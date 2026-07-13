from django.conf import settings
from django.db import models


class EstadoDocumento(models.TextChoices):
    PENDIENTE = "PENDIENTE", "Pendiente"
    APROBADO = "APROBADO", "Aprobado"
    RECHAZADO = "RECHAZADO", "Rechazado"


class DocumentoHabilitacion(models.Model):
    cuenta = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="documento_habilitacion",
    )
    drive_file_id = models.CharField(max_length=255, unique=True)
    drive_web_view_link = models.URLField(max_length=500)
    nombre_archivo = models.CharField(max_length=255)
    nombre_original = models.CharField(max_length=255)
    mime_type = models.CharField(max_length=100)
    size_bytes = models.PositiveBigIntegerField()
    estado = models.CharField(max_length=20, choices=EstadoDocumento.choices, default=EstadoDocumento.PENDIENTE)
    motivo_rechazo = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="documentos_revisados",
        null=True,
        blank=True,
    )

    class Meta:
        indexes = [models.Index(fields=["estado", "uploaded_at"])]

    def __str__(self):
        return f"Documento de {self.cuenta} ({self.get_estado_display()})"


Documento = DocumentoHabilitacion
