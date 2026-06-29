"""
Capa de servicio para parqueaderos y espacios.

Punto clave (ADR 5 corregido + ADR 8): cuando EspacioService.cambiar_estado()
se ejecuta, se publica un evento al channel layer de Django Channels para que
todos los clientes WebSocket suscritos a ese parqueadero reciban la
actualizacion de inmediato (push real), cumpliendo el RNF06 (<= 5 segundos).
"""

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.parqueaderos.repositories import EspacioRepository, ParqueaderoRepository


class ParqueaderoService:
    @staticmethod
    def listar_disponibles():
        return ParqueaderoRepository.listar(solo_validados=True)

    @staticmethod
    def obtener(parqueadero_id):
        parqueadero = ParqueaderoRepository.obtener_por_id(parqueadero_id)
        if parqueadero is None:
            raise ValidationError("El parqueadero solicitado no existe.")
        return parqueadero

    @staticmethod
    def crear(propietario, direccion_datos, ubicacion_datos, **datos_parqueadero):
        # Cambiado 'cuenta' por 'propietario'
        # validado=False por defecto: requiere aprobacion de un administrador
        # antes de aparecer en busquedas (ver ParqueaderoRepository.listar).
        return ParqueaderoRepository.crear(
            propietario=propietario,
            direccion_datos=direccion_datos,
            ubicacion_datos=ubicacion_datos,
            validado=False,
            **datos_parqueadero,
        )

    @staticmethod
    def actualizar(parqueadero_id, cuenta_solicitante, **datos):
        parqueadero = ParqueaderoService.obtener(parqueadero_id)
        ParqueaderoService._verificar_propietario(parqueadero, cuenta_solicitante)
        return ParqueaderoRepository.actualizar(parqueadero, **datos)

    @staticmethod
    def validar(parqueadero_id):
        """Solo un administrador deberia poder llamar a este metodo (controlado via permisos en la vista)."""
        parqueadero = ParqueaderoService.obtener(parqueadero_id)
        return ParqueaderoRepository.actualizar(parqueadero, validado=True)

    @staticmethod
    def eliminar(parqueadero_id, cuenta_solicitante):
        parqueadero = ParqueaderoService.obtener(parqueadero_id)
        ParqueaderoService._verificar_propietario(parqueadero, cuenta_solicitante)
        ParqueaderoRepository.eliminar(parqueadero)

    @staticmethod
    def _verificar_propietario(parqueadero, cuenta_solicitante):
        # Cambiado 'parqueadero.cuenta_id' por 'parqueadero.propietario_id'
        es_admin = getattr(cuenta_solicitante.rol, "nombre", None) == "ADMINISTRADOR"
        if not es_admin and parqueadero.propietario_id != cuenta_solicitante.id:
            raise PermissionDenied("No tienes permiso para modificar este parqueadero.")


class EspacioService:
    @staticmethod
    def listar_por_parqueadero(parqueadero_id):
        return EspacioRepository.listar_por_parqueadero(parqueadero_id)

    @staticmethod
    def crear(parqueadero_id, numero_espacio, usuario_auth, estado="LIBRE"):
        # Se requiere inyectar numero_espacio y se renombra a usuario_auth por consistencia con tu View
        parqueadero = ParqueaderoService.obtener(parqueadero_id)
        ParqueaderoService._verificar_propietario(parqueadero, usuario_auth)
        return EspacioRepository.crear(parqueadero, numero_espacio=numero_espacio, estado=estado)

    @staticmethod
    def cambiar_estado(espacio_id, nuevo_estado, cuenta_solicitante):
        espacio = EspacioRepository.obtener_por_id(espacio_id)
        if espacio is None:
            raise ValidationError("El espacio solicitado no existe.")

        ParqueaderoService._verificar_propietario(espacio.parqueadero, cuenta_solicitante)

        espacio = EspacioRepository.actualizar_estado(espacio, nuevo_estado)

        # --- Notificacion push real (ADR 5 + ADR 8) ---
        EspacioService._notificar_cambio(espacio)

        return espacio

    @staticmethod
    def eliminar(espacio_id, cuenta_solicitante):
        espacio = EspacioRepository.obtener_por_id(espacio_id)
        if espacio is None:
            raise ValidationError("El espacio solicitado no existe.")
        ParqueaderoService._verificar_propietario(espacio.parqueadero, cuenta_solicitante)
        EspacioRepository.eliminar(espacio)

    @staticmethod
    def _notificar_cambio(espacio):
        """
        Publica el evento de cambio de estado en el grupo de Channels
        correspondiente al parqueadero. Todos los clientes WebSocket
        suscritos a ese grupo (ver consumers.py) reciben la actualizacion
        de inmediato, sin polling.
        """
        channel_layer = get_channel_layer()
        grupo = f"parqueadero_{espacio.parqueadero_id}"

        async_to_sync(channel_layer.group_send)(
            grupo,
            {
                "type": "espacio.actualizado",
                "espacio_id": espacio.id,
                "numero_espacio": espacio.numero_espacio, # Añadido para que el front sepa cuál pintar
                "parqueadero_id": espacio.parqueadero_id,
                "estado": espacio.estado,
                "disponibles": EspacioRepository.contar_disponibles(espacio.parqueadero_id),
            },
        )