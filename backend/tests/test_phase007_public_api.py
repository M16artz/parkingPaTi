import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from apps.estancias.models import Estancia
from apps.horarios.models import HorarioAtencion
from apps.parqueaderos.models import (
    Direccion,
    Espacio,
    EstadoEspacio,
    EstadoHabilitacion,
    EstadoOperativo,
    Parqueadero,
    Ubicacion,
)
from apps.tarifas.models import CategoriaTarifa, TipoCategoriaTarifa
from apps.usuarios.models import Cuenta, EstadoOnboarding, Persona, TipoIdentificacion


pytestmark = pytest.mark.django_db

PUBLIC_URL = "/api/v1/public/parkings/"
LOJA_BBOX = "-79.2770,-4.0800,-79.1300,-3.8950"


def crear_parqueadero(
    sufijo,
    *,
    latitud="-3.990000",
    longitud="-79.200000",
    habilitacion=EstadoHabilitacion.APROBADO,
    configurado=True,
    estado=EstadoOperativo.ABIERTO,
    cuenta_activa=True,
):
    persona = Persona.objects.create(
        nombre=f"Publico {sufijo}",
        apellido="Pruebas",
        tipo_identificacion=TipoIdentificacion.CI,
        identificacion=f"1170000{sufijo:03d}",
    )
    cuenta = Cuenta.objects.create_user(
        username=f"public{sufijo}@example.invalid",
        correo=f"public{sufijo}@example.invalid",
        password="Prueba-segura-123",
        persona=persona,
        correo_verificado=True,
        onboarding_estado=EstadoOnboarding.ACTIVO,
        is_active=cuenta_activa,
    )
    parqueadero = Parqueadero.objects.create(
        propietario=cuenta,
        nombre=f"Parking Publico {sufijo}",
        descripcion="Parqueadero visible para consulta anonima.",
        habilitacion_estado=habilitacion,
        configuracion_completa=configurado,
        estado_operativo=estado,
        total_espacios=10,
        espacios_disponibles=4,
    )
    Direccion.objects.create(
        parqueadero=parqueadero,
        calle_principal="Bolivar",
        calle_secundaria="Rocafuerte",
        numero_lote=str(sufijo),
    )
    Ubicacion.objects.create(parqueadero=parqueadero, latitud=latitud, longitud=longitud)
    return parqueadero


@pytest.mark.parametrize(
    "bbox",
    [
        None,
        "-79.2,-4.0,-79.1",
        "texto,-4.0,-79.1,-3.9",
        "-79.1,-4.0,-79.2,-3.9",
        "-79.5000,-4.0800,-79.1300,-3.8950",
    ],
)
def test_bbox_invalido_responde_400(bbox):
    api = APIClient()
    params = {} if bbox is None else {"bbox": bbox}
    respuesta = api.get(PUBLIC_URL, params)
    assert respuesta.status_code == 400
    assert respuesta.data["error"] is True


def test_listado_anonimo_filtra_bbox_y_visibilidad():
    visible = crear_parqueadero(701)
    cerrado = crear_parqueadero(702, estado=EstadoOperativo.CERRADO)
    crear_parqueadero(703, latitud="-3.700000", longitud="-79.200000")
    crear_parqueadero(704, habilitacion=EstadoHabilitacion.PENDIENTE)
    crear_parqueadero(705, configurado=False)
    crear_parqueadero(706, estado=EstadoOperativo.INACTIVO)
    fuera_servicio = crear_parqueadero(707, estado=EstadoOperativo.FUERA_DE_SERVICIO)
    crear_parqueadero(708, cuenta_activa=False)

    respuesta = APIClient().get(PUBLIC_URL, {"bbox": LOJA_BBOX})
    assert respuesta.status_code == 200
    assert {item["id"] for item in respuesta.data["results"]} == {
        visible.id,
        cerrado.id,
        fuera_servicio.id,
    }
    assert {item["status"] for item in respuesta.data["results"]} == {
        "OPEN",
        "CLOSED",
        "OUT_OF_SERVICE",
    }
    item = next(item for item in respuesta.data["results"] if item["id"] == visible.id)
    assert item["latitude"] == pytest.approx(-3.99)
    assert item["longitude"] == pytest.approx(-79.2)
    assert item["address"] == "Bolivar, Rocafuerte, Lote 701"
    assert "propietario" not in item


def test_bbox_acepta_la_tolerancia_aprobada():
    respuesta = APIClient().get(
        PUBLIC_URL,
        {"bbox": "-79.2870,-4.0900,-79.1200,-3.8850"},
    )
    assert respuesta.status_code == 200


def test_consulta_repite_disponibilidad_actual_sin_cache_backend():
    parqueadero = crear_parqueadero(751)
    api = APIClient()
    primera = api.get(PUBLIC_URL, {"bbox": LOJA_BBOX})
    assert primera.data["results"][0]["available_spaces"] == 4

    parqueadero.espacios_disponibles = 2
    parqueadero.save(update_fields=["espacios_disponibles", "updated_at"])
    segunda = api.get(PUBLIC_URL, {"bbox": LOJA_BBOX})
    assert segunda.data["results"][0]["available_spaces"] == 2


def test_detalle_publico_expone_horarios_tarifas_y_espacios_solo_lectura():
    parqueadero = crear_parqueadero(709, estado=EstadoOperativo.LLENO)
    normal = CategoriaTarifa.objects.create(
        parqueadero=parqueadero,
        codigo=TipoCategoriaTarifa.NORMAL,
        nombre_visible="Normal",
        precio_hora="1.25",
    )
    CategoriaTarifa.objects.create(
        parqueadero=parqueadero,
        codigo=TipoCategoriaTarifa.DESCUENTO,
        nombre_visible="Inactiva",
        precio_hora="0.50",
        activa=False,
    )
    HorarioAtencion.objects.create(
        parqueadero=parqueadero,
        dia="LUNES",
        hora_apertura="08:00",
        hora_cierre="18:00",
    )
    libre = Espacio.objects.create(
        parqueadero=parqueadero,
        nombre="E001",
        estado=EstadoEspacio.LIBRE,
        tarifa_predeterminada=normal,
    )
    ocupado = Espacio.objects.create(
        parqueadero=parqueadero,
        nombre="E002",
        estado=EstadoEspacio.OCUPADO,
        tarifa_predeterminada=normal,
    )
    Espacio.objects.create(
        parqueadero=parqueadero,
        nombre="ELIMINADO",
        estado=EstadoEspacio.INHABILITADO,
        tarifa_predeterminada=normal,
        is_active=False,
    )
    Estancia.objects.create(
        espacio=ocupado,
        tarifa=normal,
        tarifa_tipo_snapshot=TipoCategoriaTarifa.DESCUENTO,
        precio_hora_snapshot="0.75",
        inicio=timezone.now(),
    )

    respuesta = APIClient().get(f"{PUBLIC_URL}{parqueadero.id}/")
    assert respuesta.status_code == 200
    assert respuesta.data["status"] == "FULL"
    assert respuesta.data["normal_rate"] == "1.25"
    assert [rate["code"] for rate in respuesta.data["rates"]] == ["NORMAL"]
    assert respuesta.data["schedules"][0]["day"] == "LUNES"
    assert [space["name"] for space in respuesta.data["spaces"]] == [libre.nombre, ocupado.nombre]
    assert respuesta.data["spaces"][0]["status"] == "FREE"
    assert respuesta.data["spaces"][1]["status"] == "OCCUPIED"
    assert respuesta.data["spaces"][1]["rate_code"] == "DESCUENTO"
    assert respuesta.data["spaces"][1]["price_per_hour"] == "0.75"
    assert "propietario" not in respuesta.data


def test_detalle_oculta_parqueadero_no_publico():
    pendiente = crear_parqueadero(710, habilitacion=EstadoHabilitacion.PENDIENTE)
    respuesta = APIClient().get(f"{PUBLIC_URL}{pendiente.id}/")
    assert respuesta.status_code == 404


def test_carga_basica_mantiene_una_consulta_para_marcadores(django_assert_num_queries):
    for sufijo in range(711, 751):
        crear_parqueadero(sufijo)
    api = APIClient()
    with django_assert_num_queries(1):
        respuesta = api.get(PUBLIC_URL, {"bbox": LOJA_BBOX})
    assert respuesta.status_code == 200
    assert len(respuesta.data["results"]) == 40
