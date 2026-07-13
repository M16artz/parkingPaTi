from io import BytesIO

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.exceptions import ValidationError
from rest_framework.test import APIClient

from apps.documentos.models import DocumentoHabilitacion
from apps.documentos.services import DocumentoService, nombre_drive_privado
from apps.documentos.storage_backends import DriveUpload
from apps.parqueaderos.models import EstadoHabilitacion, Parqueadero
from apps.usuarios.models import Cuenta, EstadoOnboarding, Persona, TipoIdentificacion
from apps.usuarios.onboarding_services import OnboardingService


pytestmark = pytest.mark.django_db


class DriveFake:
    def __init__(self):
        self.uploaded = []
        self.deleted = []

    def upload(self, name, content):
        self.uploaded.append(name)
        return DriveUpload(file_id=f"private-{len(self.uploaded)}", web_view_link="https://drive.example.invalid/private")

    def delete(self, file_id):
        self.deleted.append(file_id)


def crear_propietario():
    persona = Persona.objects.create(
        nombre="Ána María",
        apellido="Páredes López",
        tipo_identificacion=TipoIdentificacion.CI,
        identificacion="1100000099",
    )
    return Cuenta.objects.create_user(
        username="owner@example.invalid",
        correo="owner@example.invalid",
        password="Prueba-segura-123",
        persona=persona,
        correo_verificado=True,
        onboarding_estado=EstadoOnboarding.DATOS_INICIALES_PENDIENTES,
    )


def datos_parqueadero(latitud="-3.990000", longitud="-79.200000"):
    return {
        "nombre": "Parking Centro",
        "descripcion": "Cubierto",
        "calle_principal": "Bolivar",
        "calle_secundaria": "Rocafuerte",
        "numero_lote": "12",
        "latitud": latitud,
        "longitud": longitud,
    }


def archivo_pdf(nombre="permiso.pdf"):
    return SimpleUploadedFile(nombre, b"%PDF-1.4\ncontenido", content_type="application/pdf")


def test_bbox_rechaza_fuera_y_acepta_tolerancia():
    cuenta = crear_propietario()
    with pytest.raises(ValidationError):
        OnboardingService.guardar_datos_iniciales(
            cuenta,
            {"calle_principal": "A", "calle_secundaria": "", "numero_lote": ""},
            {"latitud": "-4.200000", "longitud": "-79.200000"},
            nombre="Fuera",
        )
    parqueadero = OnboardingService.guardar_datos_iniciales(
        cuenta,
        {"calle_principal": "A", "calle_secundaria": "", "numero_lote": ""},
        {"latitud": "-4.085000", "longitud": "-79.200000"},
        nombre="Tolerancia",
    )
    assert parqueadero.pk is not None


def test_documento_privado_nombre_sanitizado_y_reemplazo_compensado(monkeypatch):
    cuenta = crear_propietario()
    storage = DriveFake()
    primero = DocumentoService.subir_o_reemplazar(cuenta, archivo_pdf(), storage=storage)
    assert primero.nombre_archivo == f"paredes_lopez_ana_maria_{cuenta.id}.pdf"
    assert nombre_drive_privado(cuenta, "otro.PDF").endswith(".pdf")

    segundo = DocumentoService.subir_o_reemplazar(cuenta, archivo_pdf("nuevo.pdf"), storage=storage)
    assert segundo.drive_file_id == "private-2"
    assert storage.deleted == ["private-1"]

    def fallo(*args, **kwargs):
        raise RuntimeError("fallo DB controlado")

    monkeypatch.setattr("apps.documentos.repositories.DocumentoRepository.actualizar", fallo)
    with pytest.raises(RuntimeError):
        DocumentoService.subir_o_reemplazar(cuenta, archivo_pdf("fallo.pdf"), storage=storage)
    assert storage.deleted[-1] == "private-3"


def test_api_reanuda_y_envia_solicitud_atomica(monkeypatch):
    cuenta = crear_propietario()
    api = APIClient()
    api.force_authenticate(cuenta)

    initial = api.get("/api/v1/owner/onboarding-status/")
    assert initial.status_code == 200
    assert initial.json()["paso"] == "DATOS_INICIALES"

    parking = api.put("/api/v1/owner/parking/initial-data/", datos_parqueadero(), format="json")
    assert parking.status_code == 200
    assert api.get("/api/v1/owner/onboarding-status/").json()["paso"] == "DOCUMENTO"

    incomplete = api.post("/api/v1/owner/application/submit/")
    assert incomplete.status_code == 400
    cuenta.refresh_from_db()
    assert cuenta.onboarding_estado == EstadoOnboarding.DATOS_INICIALES_PENDIENTES

    monkeypatch.setattr(
        "apps.documentos.storage_backends.GoogleDriveStorage.upload",
        lambda self, name, content: DriveUpload("private-api", "https://drive.example.invalid/private"),
    )
    document = api.put("/api/v1/owner/document/", {"archivo": archivo_pdf()}, format="multipart")
    assert document.status_code == 200
    assert "drive_web_view_link" not in document.json()

    submitted = api.post("/api/v1/owner/application/submit/")
    assert submitted.status_code == 200
    assert submitted.json()["paso"] == "REVISION_PENDIENTE"
    cuenta.refresh_from_db()
    parqueadero = Parqueadero.objects.get(propietario=cuenta)
    documento = DocumentoHabilitacion.objects.get(cuenta=cuenta)
    assert cuenta.onboarding_estado == EstadoOnboarding.REVISION_PENDIENTE
    assert parqueadero.habilitacion_estado == EstadoHabilitacion.PENDIENTE
    assert documento.estado == "PENDIENTE"

    repeated = api.post("/api/v1/owner/application/submit/")
    assert repeated.status_code == 200
