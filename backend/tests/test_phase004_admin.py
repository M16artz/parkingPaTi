from concurrent.futures import ThreadPoolExecutor
from threading import Barrier

import pytest
from django.db import close_old_connections
from rest_framework.test import APIClient

from apps.documentos.models import DocumentoHabilitacion, EstadoDocumento
from apps.parqueaderos.models import (
    Direccion,
    EstadoHabilitacion,
    EstadoOperativo,
    Parqueadero,
    Ubicacion,
)
from apps.usuarios.admin_services import AdminService, ConflictoEstado
from apps.usuarios.models import Cuenta, EstadoOnboarding, Persona, TipoIdentificacion, TipoRol


pytestmark = pytest.mark.django_db


class EmailResultadoFake:
    def __init__(self, falla=False):
        self.falla = falla
        self.envios = []

    def enviar_resultado_solicitud(self, cuenta, aprobado, motivo=""):
        if self.falla:
            raise RuntimeError("fallo de correo controlado")
        self.envios.append((cuenta.id, aprobado, motivo))


def crear_cuenta(sufijo, rol=TipoRol.PROPIETARIO, estado=EstadoOnboarding.REVISION_PENDIENTE):
    persona = Persona.objects.create(
        nombre=f"Nombre {sufijo}",
        apellido=f"Apellido {sufijo}",
        tipo_identificacion=TipoIdentificacion.CI,
        identificacion=f"1100000{sufijo:03d}",
    )
    return Cuenta.objects.create_user(
        username=f"usuario{sufijo}@example.invalid",
        correo=f"usuario{sufijo}@example.invalid",
        password="Prueba-segura-123",
        persona=persona,
        rol=rol,
        correo_verificado=True,
        onboarding_estado=estado,
    )


def crear_solicitud(sufijo=1):
    cuenta = crear_cuenta(sufijo)
    parqueadero = Parqueadero.objects.create(
        propietario=cuenta,
        nombre=f"Parqueadero {sufijo}",
        habilitacion_estado=EstadoHabilitacion.PENDIENTE,
    )
    Direccion.objects.create(parqueadero=parqueadero, calle_principal="Bolivar")
    Ubicacion.objects.create(parqueadero=parqueadero, latitud="-3.990000", longitud="-79.200000")
    DocumentoHabilitacion.objects.create(
        cuenta=cuenta,
        drive_file_id=f"private-{sufijo}",
        drive_web_view_link=f"https://drive.example.invalid/private-{sufijo}",
        nombre_archivo=f"archivo-{sufijo}.pdf",
        nombre_original="permiso.pdf",
        mime_type="application/pdf",
        size_bytes=128,
    )
    return cuenta


def test_endpoints_admin_rechazan_anonimo_y_propietario_y_paginan():
    admin = crear_cuenta(900, rol=TipoRol.ADMINISTRADOR, estado=EstadoOnboarding.ACTIVO)
    propietario = crear_solicitud(1)

    anonimo = APIClient()
    assert anonimo.get("/api/v1/admin/applications/").status_code == 401

    cliente_propietario = APIClient()
    cliente_propietario.force_authenticate(propietario)
    assert cliente_propietario.get("/api/v1/admin/applications/").status_code == 403

    cliente_admin = APIClient()
    cliente_admin.force_authenticate(admin)
    listado = cliente_admin.get("/api/v1/admin/applications/?q=Parqueadero")
    assert listado.status_code == 200
    assert listado.json()["count"] == 1
    assert len(listado.json()["results"]) == 1
    assert "drive_file_id" not in str(listado.json())

    detalle = cliente_admin.get(f"/api/v1/admin/applications/{propietario.id}/")
    assert detalle.status_code == 200
    assert detalle.json()["parqueadero"]["latitud"] == "-3.990000"
    assert "drive_file_id" not in str(detalle.json())


def test_listado_cuentas_sin_filtro_incluye_habilitadas_y_deshabilitadas():
    admin = crear_cuenta(906, rol=TipoRol.ADMINISTRADOR, estado=EstadoOnboarding.ACTIVO)
    habilitada = crear_cuenta(7, estado=EstadoOnboarding.ACTIVO)
    deshabilitada = crear_cuenta(8, estado=EstadoOnboarding.DESHABILITADO)
    deshabilitada.is_active = False
    deshabilitada.save(update_fields=["is_active"])

    cliente = APIClient()
    cliente.force_authenticate(admin)

    todas = cliente.get("/api/v1/admin/accounts/?page_size=100")
    habilitadas = cliente.get("/api/v1/admin/accounts/?activo=true&page_size=100")
    deshabilitadas = cliente.get("/api/v1/admin/accounts/?activo=false&page_size=100")

    assert todas.status_code == 200
    assert {item["id"] for item in todas.json()["results"]} == {habilitada.id, deshabilitada.id}
    assert [item["id"] for item in habilitadas.json()["results"]] == [habilitada.id]
    assert [item["id"] for item in deshabilitadas.json()["results"]] == [deshabilitada.id]


def test_aprobar_es_atomico_y_repetir_devuelve_409(monkeypatch):
    admin = crear_cuenta(901, rol=TipoRol.ADMINISTRADOR, estado=EstadoOnboarding.ACTIVO)
    propietario = crear_solicitud(2)
    monkeypatch.setattr(
        "apps.usuarios.email_adapters.GmailSmtpEmailAdapter.enviar_resultado_solicitud",
        lambda self, cuenta, aprobado, motivo="": None,
    )
    cliente = APIClient()
    cliente.force_authenticate(admin)

    aprobado = cliente.post(f"/api/v1/admin/applications/{propietario.id}/approve/")
    assert aprobado.status_code == 200
    assert aprobado.json()["email_enviado"] is True

    propietario.refresh_from_db()
    parqueadero = Parqueadero.objects.get(propietario=propietario)
    documento = DocumentoHabilitacion.objects.get(cuenta=propietario)
    assert propietario.onboarding_estado == EstadoOnboarding.CONFIGURACION_PENDIENTE
    assert parqueadero.habilitacion_estado == EstadoHabilitacion.APROBADO
    assert documento.estado == EstadoDocumento.APROBADO
    assert documento.reviewed_by == admin

    repetido = cliente.post(f"/api/v1/admin/applications/{propietario.id}/approve/")
    assert repetido.status_code == 409
    assert repetido.json()["code"] == "state_conflict"


def test_aprobar_normaliza_solicitud_legacy_en_revision_con_parqueadero_borrador():
    admin = crear_cuenta(908, rol=TipoRol.ADMINISTRADOR, estado=EstadoOnboarding.ACTIVO)
    propietario = crear_solicitud(10)
    parqueadero = Parqueadero.objects.get(propietario=propietario)
    parqueadero.habilitacion_estado = EstadoHabilitacion.BORRADOR
    parqueadero.save(update_fields=["habilitacion_estado"])

    cuenta, _ = AdminService.aprobar(
        admin,
        propietario.id,
        email_adapter=EmailResultadoFake(),
    )

    cuenta.refresh_from_db()
    parqueadero.refresh_from_db()
    assert cuenta.onboarding_estado == EstadoOnboarding.CONFIGURACION_PENDIENTE
    assert parqueadero.habilitacion_estado == EstadoHabilitacion.APROBADO


def test_rechazo_exige_motivo_y_permite_reeditar_todo_onboarding():
    admin = crear_cuenta(902, rol=TipoRol.ADMINISTRADOR, estado=EstadoOnboarding.ACTIVO)
    propietario = crear_solicitud(3)
    cliente = APIClient()
    cliente.force_authenticate(admin)

    invalido = cliente.post(
        f"/api/v1/admin/applications/{propietario.id}/reject/",
        {"motivo": ""},
        format="json",
    )
    assert invalido.status_code == 400

    rechazado = AdminService.rechazar(
        admin,
        propietario.id,
        "Documento ilegible",
        email_adapter=EmailResultadoFake(),
    )[0]
    assert rechazado.onboarding_estado == EstadoOnboarding.RECHAZADO
    parqueadero = Parqueadero.objects.get(propietario=propietario)
    documento = DocumentoHabilitacion.objects.get(cuenta=propietario)
    assert parqueadero.motivo_rechazo == "Documento ilegible"
    assert documento.motivo_rechazo == "Documento ilegible"

    propietario.refresh_from_db()
    propietario_api = APIClient()
    propietario_api.force_authenticate(propietario)
    editado = propietario_api.put(
        "/api/v1/owner/parking/initial-data/",
        {
            "nombre": "Nombre corregido",
            "descripcion": "Descripcion corregida",
            "calle_principal": "Sucre",
            "calle_secundaria": "Quito",
            "numero_lote": "20",
            "latitud": "-3.991000",
            "longitud": "-79.201000",
        },
        format="json",
    )
    assert editado.status_code == 200
    parqueadero.refresh_from_db()
    assert parqueadero.nombre == "Nombre corregido"
    assert parqueadero.motivo_rechazo == ""


def test_fallo_de_correo_no_revierte_decision():
    admin = crear_cuenta(903, rol=TipoRol.ADMINISTRADOR, estado=EstadoOnboarding.ACTIVO)
    propietario = crear_solicitud(4)
    cuenta, email_enviado = AdminService.aprobar(
        admin,
        propietario.id,
        email_adapter=EmailResultadoFake(falla=True),
    )
    assert email_enviado is False
    cuenta.refresh_from_db()
    assert cuenta.onboarding_estado == EstadoOnboarding.CONFIGURACION_PENDIENTE


def test_deshabilitar_oculta_parqueadero_y_bloquea_login_refresh():
    admin = crear_cuenta(904, rol=TipoRol.ADMINISTRADOR, estado=EstadoOnboarding.ACTIVO)
    propietario = crear_solicitud(5)
    parqueadero = Parqueadero.objects.get(propietario=propietario)
    parqueadero.habilitacion_estado = EstadoHabilitacion.APROBADO
    parqueadero.estado_operativo = EstadoOperativo.ABIERTO
    parqueadero.save(update_fields=["habilitacion_estado", "estado_operativo"])

    sesion = APIClient()
    login = sesion.post(
        "/api/v1/auth/token/",
        {"correo": propietario.correo, "password": "Prueba-segura-123"},
        format="json",
    )
    assert login.status_code == 200

    cliente_admin = APIClient()
    cliente_admin.force_authenticate(admin)
    deshabilitada = cliente_admin.post(f"/api/v1/admin/accounts/{propietario.id}/disable/")
    assert deshabilitada.status_code == 200

    propietario.refresh_from_db()
    parqueadero.refresh_from_db()
    assert propietario.is_active is False
    assert propietario.persona.estado is False
    assert propietario.onboarding_estado == EstadoOnboarding.DESHABILITADO
    assert parqueadero.estado_operativo == EstadoOperativo.INACTIVO
    assert sesion.post("/api/v1/auth/token/refresh/").status_code == 401
    assert APIClient().post(
        "/api/v1/auth/token/",
        {"correo": propietario.correo, "password": "Prueba-segura-123"},
        format="json",
    ).status_code == 401
    assert cliente_admin.post(f"/api/v1/admin/accounts/{propietario.id}/disable/").status_code == 409


def test_rehabilitar_restaura_acceso_y_estado_de_revision():
    admin = crear_cuenta(907, rol=TipoRol.ADMINISTRADOR, estado=EstadoOnboarding.ACTIVO)
    propietario = crear_solicitud(9)
    cliente = APIClient()
    cliente.force_authenticate(admin)

    assert cliente.post(f"/api/v1/admin/accounts/{propietario.id}/disable/").status_code == 200
    respuesta = cliente.post(f"/api/v1/admin/accounts/{propietario.id}/enable/")

    assert respuesta.status_code == 200
    assert respuesta.json()["onboarding_estado"] == EstadoOnboarding.REVISION_PENDIENTE
    propietario.refresh_from_db()
    propietario.persona.refresh_from_db()
    assert propietario.is_active is True
    assert propietario.persona.estado is True
    assert propietario.onboarding_estado == EstadoOnboarding.REVISION_PENDIENTE
    assert cliente.post(f"/api/v1/admin/accounts/{propietario.id}/enable/").status_code == 409
    assert APIClient().post(
        "/api/v1/auth/token/",
        {"correo": propietario.correo, "password": "Prueba-segura-123"},
        format="json",
    ).status_code == 200


@pytest.mark.django_db(transaction=True)
def test_aprobaciones_concurrentes_producen_una_sola_transicion():
    admin = crear_cuenta(905, rol=TipoRol.ADMINISTRADOR, estado=EstadoOnboarding.ACTIVO)
    propietario = crear_solicitud(6)
    barrera = Barrier(2)

    def aprobar_en_hilo():
        close_old_connections()
        try:
            administrador = Cuenta.objects.get(id=admin.id)
            barrera.wait(timeout=5)
            AdminService.aprobar(
                administrador,
                propietario.id,
                email_adapter=EmailResultadoFake(),
            )
            return "aprobada"
        except ConflictoEstado:
            return "conflicto"
        finally:
            close_old_connections()

    with ThreadPoolExecutor(max_workers=2) as executor:
        resultados = list(executor.map(lambda _: aprobar_en_hilo(), range(2)))

    assert sorted(resultados) == ["aprobada", "conflicto"]
