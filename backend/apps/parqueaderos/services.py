"""
Capa de servicio para parqueaderos y espacios.

Punto clave (ADR 5 corregido + ADR 8): cuando EspacioService.cambiar_estado()
se ejecuta, se publica un evento al channel layer de Django Channels para que
todos los clientes WebSocket suscritos a ese parqueadero reciban la
actualizacion de inmediato (push real), cumpliendo el RNF06 (<= 5 segundos).
"""

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework.exceptions import PermissionDenied, ValidationError, NotFound

from apps.parqueaderos.models import Disponibilidad, TipoEstado
from apps.parqueaderos.repositories import EspacioRepository, ParqueaderoRepository
from core.permissions import es_administrador


class ParqueaderoService:
    @staticmethod
    def listar_disponibles():
        return ParqueaderoRepository.listar(solo_validados=True)

    @staticmethod
    def obtener(parqueadero_id):
        parqueadero = ParqueaderoRepository.obtener_por_id(parqueadero_id)
        if parqueadero is None:
            raise NotFound("El parqueadero solicitado no existe.")
        return parqueadero

    @staticmethod
    def crear(parqueadero_id, numero_espacio, cuenta_solicitante, estado="LIBRE"):
        parqueadero = ParqueaderoService.obtener(parqueadero_id)
        ParqueaderoService._verificar_propietario(parqueadero, cuenta_solicitante)
        
        espacio = EspacioRepository.crear(parqueadero, numero_espacio=numero_espacio, estado=estado)
        
        # Sincronizar estado global
        parqueadero.disponibilidad = EspacioService._recalcular_disponibilidad(parqueadero)
        parqueadero.save(update_fields=['disponibilidad'])
        EspacioService._notificar_cambio(espacio)
        
        return espacio

    @staticmethod
    def actualizar(parqueadero_id, cuenta_solicitante, **datos):
        parqueadero = ParqueaderoService.obtener(parqueadero_id)
        ParqueaderoService._verificar_propietario(parqueadero, cuenta_solicitante)
        # "validado" nunca puede llegar por esta via: solo ParqueaderoService.validar()
        # (invocado desde el endpoint /validar/, protegido con EsAdministrador) puede
        # cambiarlo. Se descarta explicitamente aunque el DTO de arriba ya lo excluya,
        # como defensa en profundidad.
        datos.pop("validado", None)
        datos.pop("propietario", None)
        return ParqueaderoRepository.actualizar(parqueadero, **datos)

    @staticmethod
    def validar(parqueadero_id):
        """Solo un administrador deberia poder llamar a este metodo (controlado via permisos en la vista)."""
        parqueadero = ParqueaderoService.obtener(parqueadero_id)
        return ParqueaderoRepository.actualizar(parqueadero, validado=True)

    @staticmethod
    def eliminar(espacio_id, cuenta_solicitante):
        espacio = EspacioRepository.obtener_por_id(espacio_id)
        if espacio is None:
            raise ValidationError("El espacio solicitado no existe.")
        ParqueaderoService._verificar_propietario(espacio.parqueadero, cuenta_solicitante)
        
        parqueadero = espacio.parqueadero
        EspacioRepository.eliminar(espacio)
        
        # Sincronizar estado global tras eliminar
        parqueadero.disponibilidad = EspacioService._recalcular_disponibilidad(parqueadero)
        parqueadero.save(update_fields=['disponibilidad'])
        # Nota: Aquí no podemos notificar el espacio porque ya fue eliminado, 
        # pero el parqueadero ya tiene su estado actualizado.

    @staticmethod
    def _verificar_propietario(parqueadero, cuenta_solicitante):
        # Cambiado 'parqueadero.cuenta_id' por 'parqueadero.propietario_id'.
        # Bug corregido: antes se comparaba getattr(rol, "nombre", None), pero
        # `rol` es un CharField (un string), no un objeto - esa comparacion
        # siempre daba False y ningun administrador pasaba este chequeo.
        if not es_administrador(cuenta_solicitante) and parqueadero.propietario_id != cuenta_solicitante.id:
            raise PermissionDenied("No tienes permiso para modificar este parqueadero.")
    
    @staticmethod
    def listar_propios(cuenta_solicitante):
        """Parqueaderos del propietario autenticado, validados o no."""
        return ParqueaderoRepository.por_propietario(cuenta_solicitante.id)


class EspacioService:
    @staticmethod
    def listar_por_parqueadero(parqueadero_id):
        return EspacioRepository.listar_por_parqueadero(parqueadero_id)

    @staticmethod
    def crear(parqueadero_id, numero_espacio, cuenta_solicitante, estado="LIBRE"):
        parqueadero = ParqueaderoService.obtener(parqueadero_id)
        ParqueaderoService._verificar_propietario(parqueadero, cuenta_solicitante)
        return EspacioRepository.crear(parqueadero, numero_espacio=numero_espacio, estado=estado)

    @staticmethod
    def _recalcular_disponibilidad(parqueadero):
        total_espacios = parqueadero.espacios.count()
        libres = parqueadero.espacios.filter(estado=TipoEstado.LIBRE).count()
        inhabilitados = parqueadero.espacios.filter(estado=TipoEstado.INHABILITADO).count()

        if libres == 0:
            return Disponibilidad.LLENO
        elif inhabilitados == total_espacios:
            return Disponibilidad.FUERA_DE_SERVICIO
        return Disponibilidad.ABIERTO

    @staticmethod
    def cambiar_estado(espacio_id, nuevo_estado, cuenta_solicitante):
        espacio = EspacioRepository.obtener_por_id(espacio_id)
        if espacio is None:
            raise ValidationError("El espacio solicitado no existe.")
        ParqueaderoService._verificar_propietario(espacio.parqueadero, cuenta_solicitante)

        espacio = EspacioRepository.actualizar_estado(espacio, nuevo_estado)

        # Recalcular disponibilidad del parqueadero
        parqueadero = espacio.parqueadero
        nueva_disponibilidad = EspacioService._recalcular_disponibilidad(parqueadero)

        # Actualizar disponibilidad del parqueadero (sin disparar notificaciones en bucle)
        parqueadero.disponibilidad = nueva_disponibilidad
        parqueadero.save(update_fields=['disponibilidad'])

        # Notificar cambio de espacio (ya existente)
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