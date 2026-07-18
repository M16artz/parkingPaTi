from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError

from apps.parqueaderos.models import EstadoEspacio, EstadoHabilitacion, EstadoOperativo
from apps.parqueaderos.repositories import EspacioRepository, ParqueaderoRepository
from apps.estancias.repositories import EstanciaRepository
from apps.tarifas.repositories import CategoriaTarifaRepository
from apps.usuarios.models import EstadoOnboarding
from core.geo import validar_coordenadas_loja
from core.permissions import es_administrador


class ParqueaderoService:
    TRANSICIONES_HABILITACION = {
        EstadoHabilitacion.BORRADOR: {EstadoHabilitacion.PENDIENTE},
        EstadoHabilitacion.PENDIENTE: {EstadoHabilitacion.APROBADO, EstadoHabilitacion.RECHAZADO},
        EstadoHabilitacion.RECHAZADO: {EstadoHabilitacion.PENDIENTE},
        EstadoHabilitacion.APROBADO: set(),
    }

    @staticmethod
    def listar_disponibles():
        return ParqueaderoRepository.listar_publicos()

    @staticmethod
    def obtener(parqueadero_id):
        parqueadero = ParqueaderoRepository.obtener_por_id(parqueadero_id)
        if parqueadero is None:
            raise NotFound("El parqueadero solicitado no existe.")
        return parqueadero

    @staticmethod
    def crear(propietario, direccion_datos, ubicacion_datos, **datos):
        if not propietario.correo_verificado:
            raise ValidationError("Debes verificar el correo antes de crear el parqueadero.")
        if propietario.onboarding_estado not in {
            EstadoOnboarding.DATOS_INICIALES_PENDIENTES,
            EstadoOnboarding.RECHAZADO,
        }:
            raise ValidationError("El parqueadero no puede crearse en el estado actual.")
        validar_coordenadas_loja(ubicacion_datos["latitud"], ubicacion_datos["longitud"])
        if ParqueaderoRepository.obtener_por_propietario(propietario.id) is not None:
            raise ValidationError("La cuenta ya tiene un parqueadero asignado.")
        try:
            return ParqueaderoRepository.crear(propietario, direccion_datos, ubicacion_datos, **datos)
        except IntegrityError as exc:
            raise ValidationError("La cuenta ya tiene un parqueadero asignado.") from exc

    @staticmethod
    def actualizar(parqueadero_id, cuenta_solicitante, **datos):
        parqueadero = ParqueaderoService.obtener(parqueadero_id)
        ParqueaderoService._verificar_propietario(parqueadero, cuenta_solicitante)
        return ParqueaderoRepository.actualizar(parqueadero, **datos)

    @staticmethod
    def actualizar_datos_generales(
        parqueadero_id,
        cuenta_solicitante,
        parqueadero_datos,
        direccion_datos,
        ubicacion_datos,
    ):
        parqueadero = ParqueaderoService.obtener(parqueadero_id)
        ParqueaderoService._verificar_propietario(parqueadero, cuenta_solicitante)
        if ubicacion_datos:
            validar_coordenadas_loja(
                ubicacion_datos["latitud"],
                ubicacion_datos["longitud"],
            )
        return ParqueaderoRepository.actualizar_datos_generales(
            parqueadero,
            parqueadero_datos,
            direccion_datos,
            ubicacion_datos,
        )

    @staticmethod
    def cambiar_habilitacion(parqueadero_id, nuevo_estado, motivo_rechazo=""):
        parqueadero = ParqueaderoService.obtener(parqueadero_id)
        permitidos = ParqueaderoService.TRANSICIONES_HABILITACION.get(parqueadero.habilitacion_estado, set())
        if nuevo_estado not in permitidos:
            raise ValidationError("La transicion de habilitacion solicitada no es valida.")
        datos = {"habilitacion_estado": nuevo_estado, "motivo_rechazo": motivo_rechazo}
        if nuevo_estado == EstadoHabilitacion.APROBADO:
            datos["approved_at"] = timezone.now()
        return ParqueaderoRepository.actualizar(parqueadero, **datos)

    @staticmethod
    def validar(parqueadero_id):
        return ParqueaderoService.cambiar_habilitacion(parqueadero_id, EstadoHabilitacion.APROBADO)

    @staticmethod
    def eliminar(parqueadero_id, cuenta_solicitante):
        parqueadero = ParqueaderoService.obtener(parqueadero_id)
        ParqueaderoService._verificar_propietario(parqueadero, cuenta_solicitante)
        ParqueaderoRepository.eliminar(parqueadero)

    @staticmethod
    def _verificar_propietario(parqueadero, cuenta_solicitante):
        if not es_administrador(cuenta_solicitante) and parqueadero.propietario_id != cuenta_solicitante.id:
            raise PermissionDenied("No tienes permiso para modificar este parqueadero.")

    @staticmethod
    def listar_propios(cuenta_solicitante):
        return ParqueaderoRepository.por_propietario(cuenta_solicitante.id)


class EspacioService:
    @staticmethod
    def listar_por_parqueadero(parqueadero_id):
        return EspacioRepository.listar_por_parqueadero(parqueadero_id)

    @staticmethod
    def obtener(espacio_id):
        espacio = EspacioRepository.obtener_por_id(espacio_id)
        if espacio is None:
            raise NotFound("El espacio solicitado no existe.")
        return espacio

    @staticmethod
    @transaction.atomic
    def crear(parqueadero_id, nombre, cuenta_solicitante):
        parqueadero = ParqueaderoRepository.bloquear_por_id(parqueadero_id)
        if parqueadero is None:
            raise NotFound("El parqueadero solicitado no existe.")
        ParqueaderoService._verificar_propietario(parqueadero, cuenta_solicitante)
        if not parqueadero.configuracion_completa:
            raise ValidationError("Completa primero la configuracion final del parqueadero.")
        tarifa_normal = CategoriaTarifaRepository.obtener_normal(parqueadero_id)
        try:
            espacio = EspacioRepository.crear(parqueadero, nombre, tarifa_predeterminada=tarifa_normal)
        except IntegrityError as exc:
            raise ValidationError("Ya existe un espacio activo con ese nombre.") from exc
        EspacioService._actualizar_conteos(parqueadero)
        return espacio

    @staticmethod
    @transaction.atomic
    def actualizar(espacio_id, cuenta_solicitante, **datos):
        espacio_inicial = EspacioService.obtener(espacio_id)
        parqueadero = ParqueaderoRepository.bloquear_por_id(espacio_inicial.parqueadero_id)
        ParqueaderoService._verificar_propietario(parqueadero, cuenta_solicitante)
        espacio = EspacioRepository.bloquear_por_id(espacio_id)
        if not espacio.is_active:
            raise ValidationError("El espacio esta eliminado logicamente.")
        if datos.get("estado") == EstadoEspacio.OCUPADO:
            raise ValidationError("Un espacio solo se ocupa al iniciar una estancia.")
        tarifa_id = datos.pop("tarifa_predeterminada", None)
        if tarifa_id is not None:
            tarifa = CategoriaTarifaRepository.obtener_por_id(tarifa_id)
            if tarifa is None or tarifa.parqueadero_id != espacio.parqueadero_id or not tarifa.activa:
                raise ValidationError("La tarifa no pertenece al parqueadero o no esta activa.")
            datos["tarifa_predeterminada"] = tarifa
        try:
            espacio = EspacioRepository.actualizar(espacio, **datos)
        except IntegrityError as exc:
            raise ValidationError("Ya existe un espacio activo con ese nombre.") from exc
        EspacioService.recalcular_conteos(parqueadero)
        return espacio

    cambiar_estado = actualizar

    @staticmethod
    @transaction.atomic
    def eliminar(espacio_id, cuenta_solicitante):
        espacio_inicial = EspacioService.obtener(espacio_id)
        parqueadero = ParqueaderoRepository.bloquear_por_id(espacio_inicial.parqueadero_id)
        ParqueaderoService._verificar_propietario(parqueadero, cuenta_solicitante)
        espacio = EspacioRepository.bloquear_por_id(espacio_id)
        if not espacio.is_active:
            raise ValidationError("El espacio ya esta eliminado logicamente.")
        if EstanciaRepository.obtener_activa_por_espacio(espacio.id) is not None:
            raise ValidationError("No se puede eliminar un espacio con una estancia activa.")
        EspacioRepository.actualizar(
            espacio,
            is_active=False,
            deleted_at=timezone.now(),
            estado=EstadoEspacio.INHABILITADO,
        )
        EspacioService.recalcular_conteos(parqueadero)

    @staticmethod
    def _actualizar_conteos(parqueadero):
        return EspacioService.recalcular_conteos(parqueadero)

    @staticmethod
    def recalcular_conteos(parqueadero):
        conteos = EspacioRepository.contar_estados(parqueadero.id)
        if not parqueadero.configuracion_completa or conteos["total"] == 0:
            estado_operativo = EstadoOperativo.INACTIVO
        elif conteos["libres"] > 0:
            estado_operativo = EstadoOperativo.ABIERTO
        elif conteos["ocupados"] > 0:
            estado_operativo = EstadoOperativo.LLENO
        else:
            estado_operativo = EstadoOperativo.FUERA_DE_SERVICIO
        ParqueaderoRepository.actualizar(
            parqueadero,
            total_espacios=conteos["total"],
            espacios_disponibles=conteos["libres"],
            estado_operativo=estado_operativo,
        )
        return parqueadero
