from decimal import Decimal

import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from apps.estancias.models import Estancia
from apps.horarios.models import HorarioAtencion
from apps.parqueaderos.configuration_services import (
    ConfiguracionFinalService,
    ConflictoEspacio,
    GestionEspacioService,
)
from apps.parqueaderos.models import (
    Direccion,
    Espacio,
    EstadoEspacio,
    EstadoHabilitacion,
    EstadoOperativo,
    Parqueadero,
    Ubicacion,
)
from apps.parqueaderos.repositories import EspacioRepository
from apps.parqueaderos.services import EspacioService
from apps.tarifas.models import CategoriaTarifa, TipoCategoriaTarifa
from apps.usuarios.models import Cuenta, EstadoOnboarding, Persona, TipoIdentificacion


pytestmark = pytest.mark.django_db


def crear_propietario(sufijo, estado=EstadoOnboarding.CONFIGURACION_PENDIENTE):
    persona = Persona.objects.create(
        nombre=f"Propietario {sufijo}",
        apellido="Pruebas",
        tipo_identificacion=TipoIdentificacion.CI,
        identificacion=f"1190000{sufijo:03d}",
    )
    cuenta = Cuenta.objects.create_user(
        username=f"config{sufijo}@example.invalid",
        correo=f"config{sufijo}@example.invalid",
        password="Prueba-segura-123",
        persona=persona,
        correo_verificado=True,
        onboarding_estado=estado,
    )
    parqueadero = Parqueadero.objects.create(
        propietario=cuenta,
        nombre=f"Parking Config {sufijo}",
        habilitacion_estado=EstadoHabilitacion.APROBADO,
        estado_operativo=EstadoOperativo.INACTIVO,
    )
    Direccion.objects.create(parqueadero=parqueadero, calle_principal="Bolivar")
    Ubicacion.objects.create(parqueadero=parqueadero, latitud="-3.990000", longitud="-79.200000")
    return cuenta, parqueadero


def payload_configuracion(cantidad=3):
    return {
        "horarios": [
            {"dia": "LUNES", "hora_apertura": "08:00", "hora_cierre": "18:00"},
            {"dia": "MARTES", "hora_apertura": "08:00", "hora_cierre": "18:00"},
        ],
        "tarifas": [
            {"codigo": "NORMAL", "nombre_visible": "Normal", "precio_hora": "1.25"},
            {"codigo": "DESCUENTO", "nombre_visible": "Descuento", "precio_hora": "0.75"},
        ],
        "cantidad_espacios": cantidad,
    }


def configurar(cuenta, cantidad=3):
    data = payload_configuracion(cantidad)
    return ConfiguracionFinalService.configurar(
        cuenta,
        horarios=data["horarios"],
        tarifas=data["tarifas"],
        cantidad_espacios=cantidad,
    )


def test_configuracion_final_es_atomica_idempotente_y_activa_cuenta():
    cuenta, parqueadero = crear_propietario(1)
    resultado = configurar(cuenta, 3)
    cuenta.refresh_from_db()
    parqueadero.refresh_from_db()

    assert resultado["configuracion_completa"] is True
    assert cuenta.onboarding_estado == EstadoOnboarding.ACTIVO
    assert parqueadero.configuracion_completa is True
    assert parqueadero.total_espacios == 3
    assert parqueadero.espacios_disponibles == 3
    assert parqueadero.estado_operativo == EstadoOperativo.ABIERTO
    assert HorarioAtencion.objects.filter(parqueadero=parqueadero).count() == 2
    assert CategoriaTarifa.objects.get(
        parqueadero=parqueadero,
        codigo=TipoCategoriaTarifa.NORMAL,
    ).activa is True
    assert list(Espacio.objects.filter(parqueadero=parqueadero).values_list("nombre", flat=True)) == [
        "E001",
        "E002",
        "E003",
    ]

    configurar(cuenta, 3)
    assert Espacio.objects.filter(parqueadero=parqueadero).count() == 3


def test_configuracion_hace_rollback_total_si_falla_lote(monkeypatch):
    cuenta, parqueadero = crear_propietario(2)

    def fallar_lote(*args, **kwargs):
        raise RuntimeError("fallo controlado")

    monkeypatch.setattr(EspacioRepository, "crear_lote", fallar_lote)
    with pytest.raises(RuntimeError):
        configurar(cuenta, 2)

    cuenta.refresh_from_db()
    parqueadero.refresh_from_db()
    assert cuenta.onboarding_estado == EstadoOnboarding.CONFIGURACION_PENDIENTE
    assert parqueadero.configuracion_completa is False
    assert HorarioAtencion.objects.filter(parqueadero=parqueadero).count() == 0
    assert CategoriaTarifa.objects.filter(parqueadero=parqueadero).count() == 0
    assert Espacio.objects.filter(parqueadero=parqueadero).count() == 0


def test_api_exige_propiedad_normal_y_datos_validos():
    cuenta, _ = crear_propietario(3)
    otra, _ = crear_propietario(4)
    api = APIClient()
    assert api.get("/api/v1/owner/configuration/").status_code == 401

    api.force_authenticate(cuenta)
    sin_normal = payload_configuracion()
    sin_normal["tarifas"] = [
        {"codigo": "DESCUENTO", "nombre_visible": "Descuento", "precio_hora": "0.50"}
    ]
    assert api.put("/api/v1/owner/configuration/", sin_normal, format="json").status_code == 400

    repetido = payload_configuracion()
    repetido["horarios"].append(repetido["horarios"][0])
    assert api.put("/api/v1/owner/configuration/", repetido, format="json").status_code == 400

    precio_cero = payload_configuracion()
    precio_cero["tarifas"][0]["precio_hora"] = "0"
    assert api.put("/api/v1/owner/configuration/", precio_cero, format="json").status_code == 400

    configurar(cuenta)
    espacio_ajeno = Espacio.objects.filter(parqueadero__propietario=cuenta).first()
    api.force_authenticate(otra)
    assert api.patch(
        f"/api/v1/owner/spaces/{espacio_ajeno.id}/",
        {"nombre": "Intrusion"},
        format="json",
    ).status_code == 403


def test_lote_adicional_y_nombres_activos_duplicados():
    cuenta, parqueadero = crear_propietario(5)
    configurar(cuenta, 2)
    nuevos = GestionEspacioService.crear_lote(cuenta, 2)
    assert [espacio.nombre for espacio in nuevos] == ["E003", "E004"]

    primero, segundo = Espacio.objects.filter(parqueadero=parqueadero).order_by("id")[:2]
    with pytest.raises(ConflictoEspacio):
        GestionEspacioService.editar(cuenta, segundo.id, nombre=primero.nombre.lower())
    assert Espacio.objects.filter(parqueadero=parqueadero, is_active=True).count() == 4


def test_borrado_logico_reactivacion_y_conflicto_de_nombre():
    cuenta, parqueadero = crear_propietario(6)
    configurar(cuenta, 2)
    primero, segundo = Espacio.objects.filter(parqueadero=parqueadero).order_by("id")

    GestionEspacioService.eliminar(cuenta, primero.id)
    primero.refresh_from_db()
    assert primero.is_active is False
    assert primero.deleted_at is not None
    assert Espacio.objects.filter(id=primero.id).exists()

    GestionEspacioService.editar(cuenta, segundo.id, nombre=primero.nombre)
    with pytest.raises(ConflictoEspacio):
        GestionEspacioService.reactivar(cuenta, primero.id)

    GestionEspacioService.editar(cuenta, segundo.id, nombre="E002-renombrado")
    reactivado = GestionEspacioService.reactivar(cuenta, primero.id)
    assert reactivado.is_active is True
    assert reactivado.deleted_at is None
    assert reactivado.estado == EstadoEspacio.LIBRE


def test_matriz_conteos_y_estado_agregado():
    cuenta, parqueadero = crear_propietario(7)
    configurar(cuenta, 3)
    espacios = list(Espacio.objects.filter(parqueadero=parqueadero).order_by("id"))

    GestionEspacioService.editar(cuenta, espacios[0].id, estado=EstadoEspacio.INHABILITADO)
    parqueadero.refresh_from_db()
    assert (parqueadero.total_espacios, parqueadero.espacios_disponibles) == (3, 2)
    assert parqueadero.estado_operativo == EstadoOperativo.ABIERTO

    EspacioRepository.actualizar(espacios[1], estado=EstadoEspacio.OCUPADO)
    GestionEspacioService.editar(cuenta, espacios[2].id, estado=EstadoEspacio.INHABILITADO)
    parqueadero.refresh_from_db()
    assert (parqueadero.total_espacios, parqueadero.espacios_disponibles) == (3, 0)
    assert parqueadero.estado_operativo == EstadoOperativo.LLENO

    EspacioRepository.actualizar(espacios[1], estado=EstadoEspacio.INHABILITADO)
    EspacioService.recalcular_conteos(parqueadero)
    parqueadero.refresh_from_db()
    assert parqueadero.estado_operativo == EstadoOperativo.FUERA_DE_SERVICIO

    for espacio in Espacio.objects.filter(parqueadero=parqueadero, is_active=True):
        GestionEspacioService.eliminar(cuenta, espacio.id)
    parqueadero.refresh_from_db()
    assert (parqueadero.total_espacios, parqueadero.espacios_disponibles) == (0, 0)
    assert parqueadero.estado_operativo == EstadoOperativo.INACTIVO


def test_propietario_controla_estados_manuales_y_retorna_a_automatico():
    cuenta, parqueadero = crear_propietario(11)
    configurar(cuenta, 2)
    api = APIClient()
    api.force_authenticate(cuenta)

    cerrado = api.patch(
        "/api/v1/owner/operational-status/",
        {"estado": "CERRADO"},
        format="json",
    )
    assert cerrado.status_code == 200
    assert cerrado.data["estado_operativo"] == EstadoOperativo.CERRADO
    assert cerrado.data["estado_operativo_manual"] == EstadoOperativo.CERRADO

    espacio = Espacio.objects.filter(parqueadero=parqueadero).first()
    GestionEspacioService.editar(cuenta, espacio.id, estado=EstadoEspacio.INHABILITADO)
    parqueadero.refresh_from_db()
    assert parqueadero.estado_operativo == EstadoOperativo.CERRADO

    abierto = api.patch(
        "/api/v1/owner/operational-status/",
        {"estado": "ABIERTO"},
        format="json",
    )
    assert abierto.status_code == 200
    assert abierto.data["estado_operativo"] == EstadoOperativo.ABIERTO
    assert abierto.data["estado_operativo_manual"] == EstadoOperativo.ABIERTO

    automatico = api.patch(
        "/api/v1/owner/operational-status/",
        {"estado": "AUTOMATICO"},
        format="json",
    )
    assert automatico.status_code == 200
    assert automatico.data["estado_operativo"] == EstadoOperativo.ABIERTO
    assert automatico.data["estado_operativo_manual"] is None
    assert api.patch(
        "/api/v1/owner/operational-status/",
        {"estado": "LLENO"},
        format="json",
    ).status_code == 400


def test_no_se_puede_ocupar_directamente_ni_borrar_con_estancia_activa():
    cuenta, parqueadero = crear_propietario(8)
    configurar(cuenta, 1)
    espacio = Espacio.objects.get(parqueadero=parqueadero)
    api = APIClient()
    api.force_authenticate(cuenta)
    assert api.patch(
        f"/api/v1/owner/spaces/{espacio.id}/",
        {"estado": "OCUPADO"},
        format="json",
    ).status_code == 400

    tarifa = CategoriaTarifa.objects.get(parqueadero=parqueadero, codigo=TipoCategoriaTarifa.NORMAL)
    Estancia.objects.create(
        espacio=espacio,
        tarifa=tarifa,
        tarifa_tipo_snapshot=tarifa.codigo,
        precio_hora_snapshot=Decimal("1.25"),
        inicio=timezone.now(),
    )
    assert api.delete(f"/api/v1/owner/spaces/{espacio.id}/").status_code == 409
    espacio.refresh_from_db()
    assert espacio.is_active is True


def test_propietario_actualiza_solo_identidad_del_parqueadero():
    cuenta, parqueadero = crear_propietario(9)
    api = APIClient()
    api.force_authenticate(cuenta)
    response = api.patch(
        f"/api/v1/parqueaderos/{parqueadero.id}/",
        {
            "nombre": "Parking Loja Centro",
            "descripcion": "Atencion segura en el centro.",
        },
        format="json",
    )
    assert response.status_code == 200
    assert response.data["nombre"] == "Parking Loja Centro"
    assert response.data["direccion"]["calle_principal"] == "Bolivar"
    assert response.data["ubicacion"]["latitud"] == "-3.990000"
    assert response.data["updated_at"] is not None


def test_actualizacion_general_rechaza_cambios_de_direccion_o_coordenadas():
    cuenta, parqueadero = crear_propietario(10)
    api = APIClient()
    api.force_authenticate(cuenta)
    assert api.patch(
        f"/api/v1/parqueaderos/{parqueadero.id}/",
        {"calle_principal": "10 de Agosto"},
        format="json",
    ).status_code == 400
    assert api.patch(
        f"/api/v1/parqueaderos/{parqueadero.id}/",
        {"latitud": "-3.995000", "longitud": "-79.201000"},
        format="json",
    ).status_code == 400
