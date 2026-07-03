"""Capa de servicio para horarios de atencion."""

from django.db import IntegrityError
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.horarios.repositories import HorarioAtencionRepository
from apps.parqueaderos.services import ParqueaderoService
from core.permissions import es_administrador


class HorarioAtencionService:
    @staticmethod
    def listar_por_parqueadero(parqueadero_id):
        return HorarioAtencionRepository.listar_por_parqueadero(parqueadero_id)

    @staticmethod
    def crear(parqueadero_id, dia, hora_apertura, hora_cierre, cuenta_solicitante):
        parqueadero = ParqueaderoService.obtener(parqueadero_id)
        ParqueaderoService._verificar_propietario(parqueadero, cuenta_solicitante)

        if hora_apertura >= hora_cierre:
            raise ValidationError("La hora de apertura debe ser anterior a la hora de cierre.")

        try:
            return HorarioAtencionRepository.crear(parqueadero, dia, hora_apertura, hora_cierre)
        except IntegrityError:
            raise ValidationError(f"Ya existe un horario configurado para {dia} en este parqueadero.")

    @staticmethod
    def actualizar(horario_id, cuenta_solicitante, **datos):
        horario = HorarioAtencionService._obtener_verificado(horario_id, cuenta_solicitante)

        hora_apertura = datos.get("hora_apertura", horario.hora_apertura)
        hora_cierre = datos.get("hora_cierre", horario.hora_cierre)
        if hora_apertura >= hora_cierre:
            raise ValidationError("La hora de apertura debe ser anterior a la hora de cierre.")

        try:
            return HorarioAtencionRepository.actualizar(horario, **datos)
        except IntegrityError:
            raise ValidationError("Ya existe un horario configurado para ese dia en este parqueadero.")

    @staticmethod
    def eliminar(horario_id, cuenta_solicitante):
        horario = HorarioAtencionService._obtener_verificado(horario_id, cuenta_solicitante)
        HorarioAtencionRepository.eliminar(horario)

    @staticmethod
    def obtener_verificado(horario_id, cuenta_solicitante):
        """Version publica de la verificacion, para uso desde los controladores."""
        return HorarioAtencionService._obtener_verificado(horario_id, cuenta_solicitante)

    @staticmethod
    def _obtener_verificado(horario_id, cuenta_solicitante):
        horario = HorarioAtencionRepository.obtener_por_id(horario_id)
        if horario is None:
            raise ValidationError("El horario solicitado no existe.")

        # BUG CORREGIDO: antes se comparaba horario.parqueadero.cuenta_id,
        # pero Parqueadero ya no tiene el campo "cuenta" (se renombro a
        # "propietario"); ademas el chequeo de rol tenia el mismo bug de
        # getattr(rol, "nombre") que en las otras apps.
        if not es_administrador(cuenta_solicitante) and horario.parqueadero.propietario_id != cuenta_solicitante.id:
            raise PermissionDenied("No tienes permiso para modificar este horario.")

        return horario
