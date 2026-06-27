"""
WebSocket consumer para notificacion en tiempo real de disponibilidad
de espacios (ADR 5 corregido + ADR 8).

Ruta: ws://<host>/ws/parqueaderos/<parqueadero_id>/

Flujo:
1. El cliente (web o movil) abre una conexion WebSocket a este endpoint
   indicando el parqueadero que le interesa.
2. El consumer lo agrega al grupo "parqueadero_<id>" del channel layer.
3. Cuando EspacioService.cambiar_estado() se ejecuta (services.py), publica
   un evento en ese mismo grupo.
4. Este consumer recibe el evento via el metodo `espacio_actualizado` y lo
   reenvia como JSON al cliente conectado - notificacion push real, sin
   que el cliente tenga que volver a preguntar (cumple RNF06: <= 5s).
"""

import json

from channels.generic.websocket import AsyncWebsocketConsumer


class DisponibilidadConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.parqueadero_id = self.scope["url_route"]["kwargs"]["parqueadero_id"]
        self.grupo = f"parqueadero_{self.parqueadero_id}"

        await self.channel_layer.group_add(self.grupo, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.grupo, self.channel_name)

    async def espacio_actualizado(self, event):
        """
        Handler invocado cuando llega un mensaje con type="espacio.actualizado"
        (Channels traduce el punto a guion bajo automaticamente).
        """
        await self.send(text_data=json.dumps({
            "espacio_id": event["espacio_id"],
            "parqueadero_id": event["parqueadero_id"],
            "estado": event["estado"],
            "disponibles": event["disponibles"],
        }))
