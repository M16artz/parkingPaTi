import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")


def env_list(name, default=""):
    return [value.strip() for value in os.getenv(name, default).split(",") if value.strip()]


def postgres_database_config(default_name="", default_user="", default_host=""):
    return {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME", default_name),
        "USER": os.getenv("DB_USER", default_user),
        "PASSWORD": os.getenv("DB_PASSWORD", ""),
        "HOST": os.getenv("DB_HOST", default_host),
        "PORT": os.getenv("DB_PORT", "5432"),
        "CONN_MAX_AGE": int(os.getenv("DB_CONN_MAX_AGE", "0")),
    }

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')
if not SECRET_KEY:
    settings_module = os.getenv("DJANGO_SETTINGS_MODULE", "")
    if settings_module.endswith(".development"):
        SECRET_KEY = "development-only-not-a-secret-key-32-bytes"
    elif settings_module.endswith(".test"):
        SECRET_KEY = "test-only-not-a-secret-key-at-least-32-bytes"
    else:
        raise ValueError("DJANGO_SECRET_KEY must be set in environment")

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Terceros
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'drf_spectacular',
    # Apps locales
    'apps.usuarios',
    'apps.parqueaderos',
    'apps.tarifas',
    'apps.horarios',
    'apps.documentos',
    'apps.estancias',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware', # CORRECCIÓN: CORS agregado
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

# CORRECCIÓN: Configuración de DRF y JWT requerida para que funcione la autenticación
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'EXCEPTION_HANDLER': 'core.exceptions.custom_exception_handler',
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"] = {
    "register": os.getenv("THROTTLE_REGISTER_RATE", "5/hour"),
    "login": os.getenv("THROTTLE_LOGIN_RATE", "10/minute"),
    "verify_email": os.getenv("THROTTLE_VERIFY_EMAIL_RATE", "10/minute"),
    "resend_verification": os.getenv("THROTTLE_RESEND_RATE", "3/hour"),
    "token_refresh": os.getenv("THROTTLE_REFRESH_RATE", "30/minute"),
}

SPECTACULAR_SETTINGS = {
    "TITLE": "ParkingPaTi API",
    "DESCRIPTION": "Contrato base de la API REST de ParkingPaTi.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "ENUM_NAME_OVERRIDES": {
        "DocumentoEstadoEnum": "apps.documentos.models.EstadoDocumento.choices",
        "EspacioEstadoEnum": "apps.parqueaderos.models.EstadoEspacio.choices",
        "EspacioConfigurableEstadoEnum": [
            ("LIBRE", "Libre"),
            ("INHABILITADO", "Inhabilitado"),
        ],
    },
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

JWT_REFRESH_COOKIE_NAME = os.getenv("JWT_REFRESH_COOKIE_NAME", "parkingpati_refresh")
JWT_COOKIE_SECURE = os.getenv("JWT_COOKIE_SECURE", "True").lower() in {"1", "true", "yes"}
JWT_COOKIE_SAMESITE = os.getenv("JWT_COOKIE_SAMESITE", "Lax")
JWT_COOKIE_PATH = "/api/v1/auth/"

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = os.getenv("EMAIL_HOST", "")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True").lower() in {"1", "true", "yes"}
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "")
FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "")
EMAIL_VERIFICATION_TTL_SECONDS = int(os.getenv("EMAIL_VERIFICATION_TTL_SECONDS", "86400"))

CORS_ALLOWED_ORIGINS = env_list('CORS_ALLOWED_ORIGINS')
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS")

LOJA_BBOX = (
    float(os.getenv("LOJA_MIN_LNG", "-79.2770")),
    float(os.getenv("LOJA_MIN_LAT", "-4.0800")),
    float(os.getenv("LOJA_MAX_LNG", "-79.1300")),
    float(os.getenv("LOJA_MAX_LAT", "-3.8950")),
)
LOJA_BBOX_TOLERANCE = float(os.getenv("LOJA_BBOX_TOLERANCE", "0.01"))

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'es-ec'
TIME_ZONE = 'America/Guayaquil'
USE_I18N = True
USE_TZ = True
STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'usuarios.Cuenta'

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "{asctime} {levelname} {name} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "standard",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": os.getenv("DJANGO_LOG_LEVEL", "INFO"),
    },
    "loggers": {
        "django.server": {
            "handlers": ["console"],
            "level": os.getenv("DJANGO_LOG_LEVEL", "INFO"),
            "propagate": False,
        },
    },
}
