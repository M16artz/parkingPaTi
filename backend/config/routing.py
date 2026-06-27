"""
Enrutador WebSocket global (Channels).
Se importa desde config/asgi.py para combinarse con las rutas HTTP normales.
"""

from django.urls import re_path

from apps.parqueaderos.consumers import DisponibilidadConsumer

websocket_urlpatterns = [
    re_path(
        r"^ws/parqueaderos/(?P<parqueadero_id>\d+)/$",
        DisponibilidadConsumer.as_asgi(),
    ),
]
