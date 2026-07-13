from .base import *

DEBUG = False
ALLOWED_HOSTS = ["testserver"]

DATABASES = {
    "default": postgres_database_config(
        default_name="parkingpati_test",
        default_user="parkingpati",
        default_host="localhost",
    )
}

PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
