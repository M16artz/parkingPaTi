import re
from datetime import timedelta

import pytest
from django.core import mail
from django.core.cache import cache
from django.test import override_settings
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.usuarios.models import EstadoOnboarding, TipoIdentificacion, VerificacionCorreo
from apps.usuarios.services import RegistroService, VerificacionCorreoService


pytestmark = pytest.mark.django_db


def datos_registro(sufijo="1"):
    return (
        {
            "nombre": "Ana",
            "apellido": "Paredes",
            "tipo_identificacion": TipoIdentificacion.CI,
            "identificacion": f"110000000{sufijo}",
        },
        {
            "username": f"ana{sufijo}@example.invalid",
            "correo": f"ana{sufijo}@example.invalid",
            "password": "Prueba-segura-123",
        },
    )


@override_settings(FRONTEND_BASE_URL="https://web.example.invalid")
def test_registro_envia_token_hash_expirable_y_de_un_solo_uso():
    persona, cuenta_data = datos_registro()
    cuenta, enviado = RegistroService.registrar_cuenta(persona, cuenta_data)
    assert enviado is True
    assert len(mail.outbox) == 1

    token = re.search(r"token=([^\s]+)", mail.outbox[0].body).group(1)
    verificacion = VerificacionCorreo.objects.get(cuenta=cuenta)
    assert token != verificacion.token_hash
    assert verificacion.expires_at > timezone.now()

    verificada = VerificacionCorreoService.verificar(token)
    assert verificada.correo_verificado is True
    assert verificada.onboarding_estado == EstadoOnboarding.DATOS_INICIALES_PENDIENTES
    with pytest.raises(ValidationError):
        VerificacionCorreoService.verificar(token)


def test_token_expirado_es_rechazado():
    persona, cuenta_data = datos_registro("2")

    class EmailFake:
        token = None

        def enviar_verificacion(self, cuenta, token):
            self.token = token

    adapter = EmailFake()
    cuenta, _ = RegistroService.registrar_cuenta(persona, cuenta_data, email_adapter=adapter)
    VerificacionCorreo.objects.filter(cuenta=cuenta).update(expires_at=timezone.now() - timedelta(seconds=1))
    with pytest.raises(ValidationError):
        VerificacionCorreoService.verificar(adapter.token)


def test_fallo_de_correo_conserva_la_cuenta():
    persona, cuenta_data = datos_registro("3")

    class EmailConFallo:
        def enviar_verificacion(self, cuenta, token):
            raise RuntimeError("fallo controlado")

    cuenta, enviado = RegistroService.registrar_cuenta(persona, cuenta_data, email_adapter=EmailConFallo())
    assert cuenta.pk is not None
    assert enviado is False
    assert VerificacionCorreo.objects.filter(cuenta=cuenta).exists()


@override_settings(FRONTEND_BASE_URL="https://web.example.invalid")
def test_login_no_expone_refresh_y_refresh_usa_cookie(client):
    persona, cuenta_data = datos_registro("4")
    cuenta, _ = RegistroService.registrar_cuenta(persona, cuenta_data)
    cuenta.correo_verificado = True
    cuenta.onboarding_estado = EstadoOnboarding.DATOS_INICIALES_PENDIENTES
    cuenta.save(update_fields=["correo_verificado", "onboarding_estado"])

    response = client.post("/api/v1/auth/token/", {"username": cuenta.correo, "password": cuenta_data["password"]})
    assert response.status_code == 200
    assert "refresh" not in response.json()
    cookie = response.cookies["parkingpati_refresh"]
    assert cookie["httponly"] is True
    assert cookie["secure"] is True
    assert cookie["samesite"] == "Lax"

    refreshed = client.post("/api/v1/auth/token/refresh/")
    assert refreshed.status_code == 200
    assert "access" in refreshed.json()
    assert "refresh" not in refreshed.json()

    cuenta.is_active = False
    cuenta.save(update_fields=["is_active"])
    assert client.post("/api/v1/auth/token/refresh/").status_code == 401


@override_settings(FRONTEND_BASE_URL="https://web.example.invalid")
def test_reenvio_no_enumera_y_aplica_throttling(client):
    cache.clear()
    persona, cuenta_data = datos_registro("5")
    RegistroService.registrar_cuenta(persona, cuenta_data)
    existente = client.post("/api/v1/auth/resend-verification/", {"correo": cuenta_data["correo"]})
    inexistente = client.post("/api/v1/auth/resend-verification/", {"correo": "nadie@example.invalid"})
    assert existente.status_code == inexistente.status_code == 202
    assert existente.json()["detail"] == inexistente.json()["detail"]
    client.post("/api/v1/auth/resend-verification/", {"correo": "otro@example.invalid"})
    limitado = client.post("/api/v1/auth/resend-verification/", {"correo": "mas@example.invalid"})
    assert limitado.status_code == 429
