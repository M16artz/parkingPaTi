"""
ASGI config para ParkingPaTi.

Este es el punto de entrada real en produccion (servido por Uvicorn).
Combina las rutas HTTP normales de Django/DRF con las rutas WebSocket
de Channels (config/routing.py), permitiendo que un mismo proceso sirva
tanto la API REST como el canal de notificacion en tiempo real.
"""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")

# Debe inicializarse ANTES de importar nada que dependa de modelos de Django
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter  # noqa: E402
from channels.auth import AuthMiddlewareStack  # noqa: E402
from config.routing import websocket_urlpatterns  # noqa: E402

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        ),
    }
)
