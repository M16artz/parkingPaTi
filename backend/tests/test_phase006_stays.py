from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime, timedelta
from decimal import Decimal
from threading import Barrier

import pytest
from django.db import close_old_connections
from rest_framework.test import APIClient

from apps.estancias.models import Estancia, EstadoEstancia
from apps.estancias.services import ConflictoEstancia, EstanciaService
from apps.parqueaderos.configuration_services import ConfiguracionFinalService
from apps.parqueaderos.models import (
    Direccion,
    Espacio,
    EstadoEspacio,
    EstadoHabilitacion,
    EstadoOperativo,
    Parqueadero,
    Ubicacion,
)
from apps.parqueaderos.services import EspacioService
from apps.tarifas.models import CategoriaTarifa, TipoCategoriaTarifa
from apps.usuarios.models import Cuenta, EstadoOnboarding, Persona, TipoIdentificacion, TipoRol


pytestmark = pytest.mark.django_db(transaction=True)


def crear_cuenta(sufijo, rol=TipoRol.PROPIETARIO):
    persona = Persona.objects.create(
        nombre=f"Estancia {sufijo}",
        apellido="Pruebas",
        tipo_identificacion=TipoIdentificacion.CI,
        identificacion=f"1160000{sufijo:03d}",
    )
    return Cuenta.objects.create_user(
        username=f"stay{sufijo}@example.invalid",
        correo=f"stay{sufijo}@example.invalid",
        password="Prueba-segura-123",
        persona=persona,
        rol=rol,
        correo_verificado=True,
        onboarding_estado=EstadoOnboarding.ACTIVO,
    )


def crear_parqueadero_configurado(sufijo, cantidad=1):
    cuenta = crear_cuenta(sufijo)
    cuenta.onboarding_estado = EstadoOnboarding.CONFIGURACION_PENDIENTE
    cuenta.save(update_fields=["onboarding_estado"])
    parqueadero = Parqueadero.objects.create(
        propietario=cuenta,
        nombre=f"Parking Stay {sufijo}",
        habilitacion_estado=EstadoHabilitacion.APROBADO,
        estado_operativo=EstadoOperativo.INACTIVO,
    )
    Direccion.objects.create(parqueadero=parqueadero, calle_principal="Bolivar")
    Ubicacion.objects.create(parqueadero=parqueadero, latitud="-3.990000", longitud="-79.200000")
    ConfiguracionFinalService.configurar(
        cuenta,
        horarios=[{"dia": "LUNES", "hora_apertura": "08:00", "hora_cierre": "18:00"}],
        tarifas=[
            {"codigo": "NORMAL", "nombre_visible": "Normal", "precio_hora": "1.25"},
            {"codigo": "DESCUENTO", "nombre_visible": "Descuento", "precio_hora": "0.75"},
        ],
        cantidad_espacios=cantidad,
    )
    cuenta.refresh_from_db()
    parqueadero.refresh_from_db()
    return cuenta, parqueadero, Espacio.objects.filter(parqueadero=parqueadero).order_by("id").first()


def crear_finalizada(espacio, tarifa, inicio, fin):
    minutos, horas, costo = EstanciaService._calcular(inicio, fin, tarifa.precio_hora)
    return Estancia.objects.create(
        espacio=espacio,
        tarifa=tarifa,
        tarifa_tipo_snapshot=tarifa.codigo,
        precio_hora_snapshot=tarifa.precio_hora,
        inicio=inicio,
        fin=fin,
        minutos_reales=minutos,
        horas_cobradas=horas,
        costo_total=costo,
        estado=EstadoEstancia.FINALIZADA,
    )


def test_inicio_usa_normal_por_defecto_y_actualiza_conteos():
    cuenta, parqueadero, espacio = crear_parqueadero_configurado(601)
    inicio = datetime(2026, 7, 13, 12, 0, tzinfo=UTC)
    resultado = EstanciaService.iniciar(cuenta, espacio.id, ahora=inicio)
    estancia = Estancia.objects.get(id=resultado["id"])
    espacio.refresh_from_db()
    parqueadero.refresh_from_db()

    assert estancia.tarifa_tipo_snapshot == TipoCategoriaTarifa.NORMAL
    assert estancia.precio_hora_snapshot == Decimal("1.25")
    assert estancia.inicio == inicio
    assert espacio.estado == EstadoEspacio.OCUPADO
    assert parqueadero.espacios_disponibles == 0
    assert parqueadero.estado_operativo == EstadoOperativo.LLENO


def test_configuracion_muestra_tarifa_snapshot_de_la_estancia_activa():
    cuenta, _, espacio = crear_parqueadero_configurado(610)
    descuento = CategoriaTarifa.objects.get(
        parqueadero=espacio.parqueadero,
        codigo=TipoCategoriaTarifa.DESCUENTO,
    )
    EstanciaService.iniciar(cuenta, espacio.id, tarifa_id=descuento.id)
    api = APIClient()
    api.force_authenticate(cuenta)
    response = api.get("/api/v1/owner/configuration/")
    assert response.status_code == 200
    espacio_data = response.data["espacios"][0]
    assert espacio_data["tarifa_codigo"] == TipoCategoriaTarifa.NORMAL
    assert espacio_data["estancia_tarifa_codigo"] == TipoCategoriaTarifa.DESCUENTO
    assert espacio_data["estancia_precio_hora"] == Decimal("0.75")


def test_tarifa_debe_ser_activa_y_del_mismo_parqueadero():
    cuenta, _, espacio = crear_parqueadero_configurado(602)
    _, otro_parqueadero, _ = crear_parqueadero_configurado(603)
    tarifa_ajena = CategoriaTarifa.objects.get(
        parqueadero=otro_parqueadero,
        codigo=TipoCategoriaTarifa.NORMAL,
    )
    with pytest.raises(ConflictoEstancia):
        EstanciaService.iniciar(cuenta, espacio.id, tarifa_id=tarifa_ajena.id)

    descuento = CategoriaTarifa.objects.get(
        parqueadero=espacio.parqueadero,
        codigo=TipoCategoriaTarifa.DESCUENTO,
    )
    descuento.activa = False
    descuento.save(update_fields=["activa"])
    with pytest.raises(ConflictoEstancia):
        EstanciaService.iniciar(cuenta, espacio.id, tarifa_id=descuento.id)


@pytest.mark.parametrize(
    ("minutos", "horas_esperadas"),
    [(1, 1), (60, 1), (61, 2), (181, 4)],
)
def test_redondeo_temporal(minutos, horas_esperadas):
    inicio = datetime(2026, 7, 13, 10, 0, tzinfo=UTC)
    reales, horas, costo = EstanciaService._calcular(
        inicio,
        inicio + timedelta(minutes=minutos),
        Decimal("1.25"),
    )
    assert reales == minutos
    assert horas == horas_esperadas
    assert costo == Decimal("1.25") * horas_esperadas


def test_preview_no_muta_y_fin_conserva_snapshot():
    cuenta, parqueadero, espacio = crear_parqueadero_configurado(604)
    inicio = datetime(2026, 7, 13, 10, 0, tzinfo=UTC)
    EstanciaService.iniciar(cuenta, espacio.id, ahora=inicio)
    tarifa = CategoriaTarifa.objects.get(parqueadero=parqueadero, codigo=TipoCategoriaTarifa.NORMAL)
    tarifa.precio_hora = Decimal("9.99")
    tarifa.save(update_fields=["precio_hora"])

    preview = EstanciaService.actual(cuenta, espacio.id, ahora=inicio + timedelta(minutes=61))
    estancia = Estancia.objects.get(espacio=espacio)
    assert preview["horas_cobradas"] == 2
    assert preview["costo_total"] == Decimal("2.50")
    assert preview["fin"] is None
    assert estancia.fin is None
    assert estancia.estado == EstadoEstancia.ACTIVA

    final = EstanciaService.finalizar(cuenta, espacio.id, ahora=inicio + timedelta(minutes=61))
    espacio.refresh_from_db()
    parqueadero.refresh_from_db()
    assert final["costo_total"] == Decimal("2.50")
    assert espacio.estado == EstadoEspacio.LIBRE
    assert parqueadero.espacios_disponibles == 1


def test_inicio_y_fin_hacen_rollback_completo(monkeypatch):
    cuenta, _, espacio = crear_parqueadero_configurado(605)

    def fallar(*args, **kwargs):
        raise RuntimeError("fallo controlado")

    monkeypatch.setattr(EspacioService, "recalcular_conteos", fallar)
    with pytest.raises(RuntimeError):
        EstanciaService.iniciar(cuenta, espacio.id)
    espacio.refresh_from_db()
    assert espacio.estado == EstadoEspacio.LIBRE
    assert not Estancia.objects.filter(espacio=espacio).exists()

    monkeypatch.undo()
    EstanciaService.iniciar(cuenta, espacio.id)
    monkeypatch.setattr(EspacioService, "recalcular_conteos", fallar)
    with pytest.raises(RuntimeError):
        EstanciaService.finalizar(cuenta, espacio.id)
    espacio.refresh_from_db()
    estancia = Estancia.objects.get(espacio=espacio)
    assert espacio.estado == EstadoEspacio.OCUPADO
    assert estancia.estado == EstadoEstancia.ACTIVA
    assert estancia.fin is None


def test_doble_inicio_concurrente_crea_una_sola_estancia():
    cuenta, _, espacio = crear_parqueadero_configurado(606)
    barrera = Barrier(2)

    def iniciar():
        close_old_connections()
        usuario = Cuenta.objects.get(id=cuenta.id)
        barrera.wait()
        try:
            EstanciaService.iniciar(usuario, espacio.id)
            return "creada"
        except ConflictoEstancia:
            return "conflicto"
        finally:
            close_old_connections()

    with ThreadPoolExecutor(max_workers=2) as executor:
        resultados = list(executor.map(lambda _: iniciar(), range(2)))
    assert sorted(resultados) == ["conflicto", "creada"]
    assert Estancia.objects.filter(espacio=espacio, estado=EstadoEstancia.ACTIVA).count() == 1


def test_api_propiedad_registro_por_rol_y_purga_fisica():
    cuenta, parqueadero, espacio = crear_parqueadero_configurado(607)
    otra_cuenta, otro_parqueadero, otro_espacio = crear_parqueadero_configurado(608)
    normal = CategoriaTarifa.objects.get(parqueadero=parqueadero, codigo=TipoCategoriaTarifa.NORMAL)
    normal_otra = CategoriaTarifa.objects.get(
        parqueadero=otro_parqueadero,
        codigo=TipoCategoriaTarifa.NORMAL,
    )
    ahora = datetime(2026, 7, 13, 12, 0, tzinfo=UTC)
    propia = crear_finalizada(espacio, normal, ahora - timedelta(hours=2), ahora - timedelta(hours=1))
    ajena = crear_finalizada(
        otro_espacio,
        normal_otra,
        ahora - timedelta(days=2),
        ahora - timedelta(days=1),
    )
    vencida = crear_finalizada(
        espacio,
        normal,
        ahora - timedelta(days=370, hours=1),
        ahora - timedelta(days=370),
    )
    admin = crear_cuenta(609, rol=TipoRol.ADMINISTRADOR)

    api = APIClient()
    assert api.get("/api/v1/owner/stays/").status_code == 401
    api.force_authenticate(cuenta)
    respuesta = api.get("/api/v1/owner/stays/")
    assert respuesta.status_code == 200
    assert [item["id"] for item in respuesta.data["results"]] == [propia.id]
    assert api.post(
        f"/api/v1/owner/spaces/{otro_espacio.id}/stays/start/",
        {},
        format="json",
    ).status_code == 403

    api.force_authenticate(admin)
    respuesta_admin = api.get("/api/v1/admin/stays/")
    assert respuesta_admin.status_code == 200
    assert {item["id"] for item in respuesta_admin.data["results"]} == {propia.id, ajena.id}

    assert EstanciaService.eliminar_vencidas(ahora=ahora) == 1
    assert not Estancia.objects.filter(id=vencida.id).exists()
    assert Estancia.objects.filter(id__in=[propia.id, ajena.id]).count() == 2
    assert otra_cuenta.id != cuenta.id
