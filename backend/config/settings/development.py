import os
from .base import *

DEBUG = os.getenv("DJANGO_DEBUG", "True").lower() in {"1", "true", "yes"}

# El servidor de desarrollo usa http://localhost. Una cookie Secure no se
# devolvería al backend y rompería la renovación de la sesión al recargar.
JWT_COOKIE_SECURE = False

ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", "localhost")

# Configuración de Conexión a PostgreSQL 16
DATABASES = {
    "default": postgres_database_config(
        default_name="parkingpati",
        default_user="parkingpati",
        default_host="localhost",
    )
}
