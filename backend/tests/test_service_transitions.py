from decimal import Decimal

import pytest
from rest_framework.exceptions import ValidationError

from apps.parqueaderos.models import EstadoHabilitacion, Parqueadero
from apps.parqueaderos.services import ParqueaderoService
from apps.tarifas.models import CategoriaTarifa, TipoCategoriaTarifa
from apps.tarifas.services import CategoriaTarifaService
from apps.usuarios.models import Cuenta, EstadoOnboarding, Persona, TipoIdentificacion, TipoRol
from apps.usuarios.services import CuentaService


pytestmark = pytest.mark.django_db


def crear_cuenta():
    persona = Persona.objects.create(
        nombre="Ana",
        apellido="Prueba",
        tipo_identificacion=TipoIdentificacion.CI,
        identificacion="TRANSITION-ID",
    )
    return Cuenta.objects.create_user(
        username="transition-owner",
        correo="transition-owner@example.invalid",
        password="test-only-password",
        persona=persona,
        rol=TipoRol.PROPIETARIO,
    )


def test_transicion_onboarding_valida_y_rechaza_saltos():
    cuenta = crear_cuenta()
    actualizada = CuentaService.cambiar_onboarding(
        cuenta.id,
        EstadoOnboarding.DATOS_INICIALES_PENDIENTES,
    )
    assert actualizada.onboarding_estado == EstadoOnboarding.DATOS_INICIALES_PENDIENTES

    with pytest.raises(ValidationError):
        CuentaService.cambiar_onboarding(cuenta.id, EstadoOnboarding.ACTIVO)


def test_correo_pendiente_admite_revision_directa_para_registro_completo():
    cuenta = crear_cuenta()
    actualizada = CuentaService.cambiar_onboarding(
        cuenta.id,
        EstadoOnboarding.REVISION_PENDIENTE,
    )
    assert actualizada.onboarding_estado == EstadoOnboarding.REVISION_PENDIENTE


def test_transicion_habilitacion_valida_y_rechaza_saltos():
    parqueadero = Parqueadero.objects.create(propietario=crear_cuenta(), nombre="Parking")
    pendiente = ParqueaderoService.cambiar_habilitacion(parqueadero.id, EstadoHabilitacion.PENDIENTE)
    assert pendiente.habilitacion_estado == EstadoHabilitacion.PENDIENTE

    with pytest.raises(ValidationError):
        ParqueaderoService.cambiar_habilitacion(parqueadero.id, EstadoHabilitacion.BORRADOR)


def test_tarifa_normal_no_se_puede_desactivar_ni_eliminar():
    cuenta = crear_cuenta()
    parqueadero = Parqueadero.objects.create(propietario=cuenta, nombre="Parking")
    tarifa = CategoriaTarifa.objects.create(
        parqueadero=parqueadero,
        codigo=TipoCategoriaTarifa.NORMAL,
        nombre_visible="Normal",
        precio_hora=Decimal("1.50"),
    )

    with pytest.raises(ValidationError):
        CategoriaTarifaService.actualizar(tarifa.id, cuenta, activa=False)
    with pytest.raises(ValidationError):
        CategoriaTarifaService.eliminar(tarifa.id, cuenta)
