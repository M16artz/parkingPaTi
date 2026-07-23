from html import escape

import resend
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.core.mail import send_mail


class ResendEmailAdapter:
    def enviar_verificacion(self, cuenta, token):
        if not settings.RESEND_API_KEY:
            raise ImproperlyConfigured("RESEND_API_KEY no esta configurado.")
        if not settings.RESEND_FROM_EMAIL:
            raise ImproperlyConfigured("RESEND_FROM_EMAIL no esta configurado.")
        if not settings.RESEND_TO_EMAIL:
            raise ImproperlyConfigured("RESEND_TO_EMAIL no esta configurado.")
        if not settings.FRONTEND_BASE_URL:
            raise ImproperlyConfigured("FRONTEND_BASE_URL no esta configurado.")

        url = f"{settings.FRONTEND_BASE_URL.rstrip('/')}/verify-email?token={token}"
        nombre = escape(cuenta.persona.nombre)
        url_segura = escape(url, quote=True)
        resend.api_key = settings.RESEND_API_KEY
        resend.Emails.send(
            {
                "from": settings.RESEND_FROM_EMAIL,
                "to": settings.RESEND_TO_EMAIL,
                "subject": "Verifica tu correo en ParkingPaTi",
                "html": (
                    f"<p>Hola {nombre}.</p>"
                    "<p>Confirma tu correo para continuar con tu registro en ParkingPaTi.</p>"
                    f'<p><a href="{url_segura}">Verificar mi correo</a></p>'
                    "<p>Si no solicitaste esta cuenta, puedes ignorar este mensaje.</p>"
                ),
            }
        )


class GmailSmtpEmailAdapter:
    def enviar_verificacion(self, cuenta, token):
        if not settings.FRONTEND_BASE_URL:
            raise ImproperlyConfigured("FRONTEND_BASE_URL no esta configurado.")

        url = f"{settings.FRONTEND_BASE_URL.rstrip('/')}/verify-email?token={token}"
        send_mail(
            subject="Verifica tu correo en ParkingPaTi",
            message=(
                f"Hola {cuenta.persona.nombre}.\n\n"
                f"Verifica tu correo desde este enlace: {url}\n\n"
                "Si no solicitaste esta cuenta, ignora el mensaje."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[cuenta.correo],
            fail_silently=False,
        )

    def enviar_resultado_solicitud(self, cuenta, aprobado, motivo=""):
        if aprobado:
            subject = "Solicitud aprobada en ParkingPaTi"
            message = (
                f"Hola {cuenta.persona.nombre}.\n\n"
                "Tu solicitud fue aprobada. Ingresa para completar la configuracion "
                "de tu parqueadero."
            )
        else:
            subject = "Solicitud revisada en ParkingPaTi"
            message = (
                f"Hola {cuenta.persona.nombre}.\n\n"
                "Tu solicitud fue rechazada. Puedes corregir y reenviar todo el onboarding.\n\n"
                f"Motivo: {motivo}"
            )
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[cuenta.correo],
            fail_silently=False,
        )


def get_verification_email_adapter():
    if settings.EMAIL_VERIFICATION_PROVIDER == "resend":
        return ResendEmailAdapter()
    if settings.EMAIL_VERIFICATION_PROVIDER == "django":
        return GmailSmtpEmailAdapter()
    raise ImproperlyConfigured(
        "EMAIL_VERIFICATION_PROVIDER debe ser 'resend' o 'django'."
    )
