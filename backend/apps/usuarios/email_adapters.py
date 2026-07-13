from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.core.mail import send_mail


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
