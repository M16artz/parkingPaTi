import os
from .base import *

DEBUG = os.getenv("DJANGO_DEBUG", "True").lower() in {"1", "true", "yes"}

# El servidor de desarrollo usa http://localhost. Una cookie Secure no se
# devolvería al backend y rompería la renovación de la sesión al recargar.
JWT_COOKIE_SECURE = False

# URL usada por los enlaces de verificacion durante el desarrollo local.
FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL") or "http://localhost:5173"

# En desarrollo se permiten iteraciones frecuentes del formulario. Estos
# valores no afectan config.settings.production.
REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"] = {
    **REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"],
    "register": "1000/hour",
    "register_email_availability": "1000/hour",
    "resend_verification": "1000/hour",
}

# En desarrollo puede incluirse explícitamente la IP LAN del equipo para que
# Expo Go acceda a Django desde un dispositivo físico.
ALLOWED_HOSTS = list(dict.fromkeys(env_list("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1")))

# Configuración de Conexión a PostgreSQL 16
DATABASES = {
    "default": postgres_database_config(
        default_name="parkingpati",
        default_user="parkingpati",
        default_host="localhost",
    )
}
