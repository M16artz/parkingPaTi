import os
from .base import *

DEBUG = False

ALLOWED_HOSTS = env_list('DJANGO_ALLOWED_HOSTS')

DATABASES = {
    'default': postgres_database_config()
}

# Configuración de seguridad adicional
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
