from datetime import time
from decimal import Decimal

import pytest
from django.db import IntegrityError, transaction
from django.utils import timezone

from apps.estancias.models import Estancia, EstadoEstancia
from apps.horarios.models import DiasSemana, HorarioAtencion
from apps.parqueaderos.models import Direccion, Espacio, Parqueadero, Ubicacion
from apps.tarifas.models import CategoriaTarifa, TipoCategoriaTarifa
from apps.usuarios.models import Cuenta, Persona, TipoIdentificacion, TipoRol


pytestmark = pytest.mark.django_db


def crear_cuenta(sufijo="1"):
    persona = Persona.objects.create(
        nombre="Ana",
        apellido="Prueba",
        tipo_identificacion=TipoIdentificacion.CI,
        identificacion=f"ID-{sufijo}",
    )
    return Cuenta.objects.create_user(
        username=f"owner-{sufijo}",
        correo=f"owner-{sufijo}@example.invalid",
        password="test-only-password",
        persona=persona,
        rol=TipoRol.PROPIETARIO,
    )


def crear_parqueadero(sufijo="1"):
    parqueadero = Parqueadero.objects.create(propietario=crear_cuenta(sufijo), nombre=f"Parking {sufijo}")
    Direccion.objects.create(parqueadero=parqueadero, calle_principal="Calle de prueba")
    Ubicacion.objects.create(parqueadero=parqueadero, latitud=Decimal("-3.99"), longitud=Decimal("-79.20"))
    return parqueadero


def test_persona_y_cuenta_son_one_to_one():
    cuenta = crear_cuenta()
    with pytest.raises(IntegrityError), transaction.atomic():
        Cuenta.objects.create_user(
            username="owner-2",
            correo="owner-2@example.invalid",
            password="test-only-password",
            persona=cuenta.persona,
            rol=TipoRol.PROPIETARIO,
        )


def test_cuenta_tiene_cero_o_un_parqueadero():
    parqueadero = crear_parqueadero()
    with pytest.raises(IntegrityError), transaction.atomic():
        Parqueadero.objects.create(propietario=parqueadero.propietario, nombre="Duplicado")


def test_tarifa_es_unica_por_tipo_y_no_admite_precio_negativo():
    parqueadero = crear_parqueadero()
    CategoriaTarifa.objects.create(
        parqueadero=parqueadero,
        codigo=TipoCategoriaTarifa.NORMAL,
        nombre_visible="Normal",
        precio_hora=Decimal("1.50"),
    )
    with pytest.raises(IntegrityError), transaction.atomic():
        CategoriaTarifa.objects.create(
            parqueadero=parqueadero,
            codigo=TipoCategoriaTarifa.NORMAL,
            nombre_visible="Otra",
            precio_hora=Decimal("2.00"),
        )
    with pytest.raises(IntegrityError), transaction.atomic():
        CategoriaTarifa.objects.create(
            parqueadero=parqueadero,
            codigo=TipoCategoriaTarifa.DESCUENTO,
            nombre_visible="Descuento",
            precio_hora=Decimal("-1.00"),
        )


def test_nombre_de_espacio_es_unico_solo_mientras_esta_activo():
    parqueadero = crear_parqueadero()
    Espacio.objects.create(parqueadero=parqueadero, nombre="A1", is_active=False, deleted_at=timezone.now())
    Espacio.objects.create(parqueadero=parqueadero, nombre="A1")
    with pytest.raises(IntegrityError), transaction.atomic():
        Espacio.objects.create(parqueadero=parqueadero, nombre="A1")


def test_solo_existe_una_estancia_activa_por_espacio():
    parqueadero = crear_parqueadero()
    tarifa = CategoriaTarifa.objects.create(
        parqueadero=parqueadero,
        codigo=TipoCategoriaTarifa.NORMAL,
        nombre_visible="Normal",
        precio_hora=Decimal("1.50"),
    )
    espacio = Espacio.objects.create(parqueadero=parqueadero, nombre="A1", tarifa_predeterminada=tarifa)
    datos = {
        "espacio": espacio,
        "tarifa": tarifa,
        "tarifa_tipo_snapshot": TipoCategoriaTarifa.NORMAL,
        "precio_hora_snapshot": Decimal("1.50"),
        "inicio": timezone.now(),
        "estado": EstadoEstancia.ACTIVA,
    }
    Estancia.objects.create(**datos)
    with pytest.raises(IntegrityError), transaction.atomic():
        Estancia.objects.create(**datos)


def test_horario_es_unico_por_dia_y_apertura_antecede_cierre():
    parqueadero = crear_parqueadero()
    HorarioAtencion.objects.create(
        parqueadero=parqueadero,
        dia=DiasSemana.LUNES,
        hora_apertura=time(8),
        hora_cierre=time(18),
    )
    with pytest.raises(IntegrityError), transaction.atomic():
        HorarioAtencion.objects.create(
            parqueadero=parqueadero,
            dia=DiasSemana.LUNES,
            hora_apertura=time(9),
            hora_cierre=time(17),
        )
    with pytest.raises(IntegrityError), transaction.atomic():
        HorarioAtencion.objects.create(
            parqueadero=parqueadero,
            dia=DiasSemana.MARTES,
            hora_apertura=time(18),
            hora_cierre=time(8),
        )
