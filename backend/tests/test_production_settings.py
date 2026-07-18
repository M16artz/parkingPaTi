import os
import subprocess
import sys
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]


def test_production_settings_enable_proxy_https_and_database_ssl():
    env = os.environ.copy()
    env.update(
        {
            "DJANGO_SETTINGS_MODULE": "config.settings.production",
            "DJANGO_SECRET_KEY": "test-only-production-settings-key-32-bytes",
            "DJANGO_ALLOWED_HOSTS": "api.example.invalid",
            "DB_NAME": "parkingpati_test",
            "DB_USER": "parkingpati_test",
            "DB_PASSWORD": "test-only",
            "DB_HOST": "db.example.invalid",
            "DB_PORT": "5432",
            "DB_SSL_REQUIRE": "True",
        }
    )
    script = """
from django.conf import settings
assert settings.DEBUG is False
assert settings.ALLOWED_HOSTS == ['api.example.invalid']
assert settings.SECURE_SSL_REDIRECT is True
assert settings.SECURE_PROXY_SSL_HEADER == ('HTTP_X_FORWARDED_PROTO', 'https')
assert settings.DATABASES['default']['OPTIONS']['sslmode'] == 'require'
"""

    result = subprocess.run(
        [sys.executable, "-c", script],
        cwd=BACKEND_DIR,
        env=env,
        capture_output=True,
        text=True,
        check=False,
    )

    assert result.returncode == 0, result.stderr
