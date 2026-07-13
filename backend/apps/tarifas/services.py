from django.db import IntegrityError, transaction
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError

from apps.parqueaderos.repositories import ParqueaderoRepository
from apps.parqueaderos.services import ParqueaderoService
from apps.tarifas.models import TipoCategoriaTarifa
from apps.tarifas.repositories import CategoriaTarifaRepository
from core.permissions import es_administrador


class CategoriaTarifaService:
    @staticmethod
    def listar(parqueadero_id=None):
        return CategoriaTarifaRepository.listar(parqueadero_id=parqueadero_id)

    @staticmethod
    def obtener(categoria_id):
        categoria = CategoriaTarifaRepository.obtener_por_id(categoria_id)
        if categoria is None:
            raise NotFound("La tarifa solicitada no existe.")
        return categoria

    @staticmethod
    @transaction.atomic
    def crear(parqueadero_id, cuenta_solicitante, **datos):
        parqueadero = ParqueaderoRepository.bloquear_por_id(parqueadero_id)
        if parqueadero is None:
            raise NotFound("El parqueadero solicitado no existe.")
        ParqueaderoService._verificar_propietario(parqueadero, cuenta_solicitante)
        codigo = datos["codigo"]
        if codigo == TipoCategoriaTarifa.NORMAL:
            datos["activa"] = True
        try:
            return CategoriaTarifaRepository.crear(parqueadero, **datos)
        except IntegrityError as exc:
            raise ValidationError("Ya existe una tarifa de ese tipo para el parqueadero.") from exc

    @staticmethod
    def actualizar(categoria_id, cuenta_solicitante, **datos):
        categoria = CategoriaTarifaService.obtener(categoria_id)
        CategoriaTarifaService._verificar_permiso(categoria, cuenta_solicitante)
        if categoria.es_normal and datos.get("activa") is False:
            raise ValidationError("La tarifa NORMAL debe permanecer activa.")
        return CategoriaTarifaRepository.actualizar(categoria, **datos)

    @staticmethod
    def eliminar(categoria_id, cuenta_solicitante):
        categoria = CategoriaTarifaService.obtener(categoria_id)
        CategoriaTarifaService._verificar_permiso(categoria, cuenta_solicitante)
        if categoria.es_normal:
            raise ValidationError("La tarifa NORMAL no se puede eliminar.")
        CategoriaTarifaRepository.eliminar(categoria)

    @staticmethod
    def _verificar_permiso(categoria, cuenta_solicitante):
        if not es_administrador(cuenta_solicitante) and categoria.parqueadero.propietario_id != cuenta_solicitante.id:
            raise PermissionDenied("No tienes permiso para modificar esta tarifa.")
