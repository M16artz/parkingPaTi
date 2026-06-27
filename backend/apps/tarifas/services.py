"""
Capa de servicio para tarifas. Reglas de negocio sobre tarifas normales, incrementos y descuentos.
"""

from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.parqueaderos.services import ParqueaderoService
from apps.tarifas.repositories import (
    DescuentoTarifaRepository,
    EstrategiaTarifaRepository,
    IncrementoTarifaRepository,
)


def _verificar_permiso(tarifa, cuenta_solicitante):
    es_admin = getattr(cuenta_solicitante, "rol", None) == "ADMINISTRADOR"
    if not es_admin and tarifa.parqueadero.propietario_id != cuenta_solicitante.id:
        raise PermissionDenied("No tienes permiso para modificar esta tarifa.")


class EstrategiaTarifaService:
    @staticmethod
    def listar(parqueadero_id=None):
        return EstrategiaTarifaRepository.listar(parqueadero_id)

    @staticmethod
    def obtener(estrategia_id):
        estrategia = EstrategiaTarifaRepository.obtener_por_id(estrategia_id)
        if not estrategia:
            raise ValidationError("La tarifa solicitada no existe.")
        return estrategia

    @staticmethod
    def crear(parqueadero_id, precio_hora, cuenta_solicitante):
        parqueadero = ParqueaderoService.obtener(parqueadero_id)
        ParqueaderoService._verificar_propietario(parqueadero, cuenta_solicitante)

        if EstrategiaTarifaRepository.obtener_por_parqueadero(parqueadero_id):
            raise ValidationError("Este parqueadero ya tiene una tarifa configurada.")

        return EstrategiaTarifaRepository.crear(parqueadero, precio_hora)

    @staticmethod
    def actualizar(estrategia_id, cuenta_solicitante, **datos):
        estrategia = EstrategiaTarifaService.obtener(estrategia_id)
        _verificar_permiso(estrategia, cuenta_solicitante)
        datos.pop("parqueadero", None)
        return EstrategiaTarifaRepository.actualizar(estrategia, **datos)

    @staticmethod
    def eliminar(estrategia_id, cuenta_solicitante):
        estrategia = EstrategiaTarifaService.obtener(estrategia_id)
        _verificar_permiso(estrategia, cuenta_solicitante)
        EstrategiaTarifaRepository.eliminar(estrategia)


class IncrementoTarifaService:
    @staticmethod
    def listar(parqueadero_id=None):
        return IncrementoTarifaRepository.listar(parqueadero_id)

    @staticmethod
    def obtener(incremento_id):
        incremento = IncrementoTarifaRepository.obtener_por_id(incremento_id)
        if not incremento:
            raise ValidationError("El incremento de tarifa solicitado no existe.")
        return incremento

    @staticmethod
    def crear(parqueadero_id, precio_hora, porcentaje, cuenta_solicitante):
        parqueadero = ParqueaderoService.obtener(parqueadero_id)
        ParqueaderoService._verificar_propietario(parqueadero, cuenta_solicitante)

        if EstrategiaTarifaRepository.obtener_por_parqueadero(parqueadero_id):
            raise ValidationError("Este parqueadero ya tiene una tarifa o estrategia configurada.")

        return IncrementoTarifaRepository.crear(parqueadero, precio_hora, porcentaje)

    @staticmethod
    def actualizar(incremento_id, cuenta_solicitante, **datos):
        incremento = IncrementoTarifaService.obtener(incremento_id)
        _verificar_permiso(incremento, cuenta_solicitante)
        datos.pop("parqueadero", None)
        return IncrementoTarifaRepository.actualizar(incremento, **datos)

    @staticmethod
    def eliminar(incremento_id, cuenta_solicitante):
        incremento = IncrementoTarifaService.obtener(incremento_id)
        _verificar_permiso(incremento, cuenta_solicitante)
        IncrementoTarifaRepository.eliminar(incremento)


class DescuentoTarifaService:
    @staticmethod
    def listar(parqueadero_id=None):
        return DescuentoTarifaRepository.listar(parqueadero_id)

    @staticmethod
    def obtener(descuento_id):
        descuento = DescuentoTarifaRepository.obtener_por_id(descuento_id)
        if not descuento:
            raise ValidationError("El descuento de tarifa solicitado no existe.")
        return descuento

    @staticmethod
    def crear(parqueadero_id, precio_hora, porcentaje, cuenta_solicitante):
        parqueadero = ParqueaderoService.obtener(parqueadero_id)
        ParqueaderoService._verificar_propietario(parqueadero, cuenta_solicitante)

        if EstrategiaTarifaRepository.obtener_por_parqueadero(parqueadero_id):
            raise ValidationError("Este parqueadero ya tiene una tarifa o estrategia configurada.")

        return DescuentoTarifaRepository.crear(parqueadero, precio_hora, porcentaje)

    @staticmethod
    def actualizar(descuento_id, cuenta_solicitante, **datos):
        descuento = DescuentoTarifaService.obtener(descuento_id)
        _verificar_permiso(descuento, cuenta_solicitante)
        datos.pop("parqueadero", None)
        return DescuentoTarifaRepository.actualizar(descuento, **datos)

    @staticmethod
    def eliminar(descuento_id, cuenta_solicitante):
        descuento = DescuentoTarifaService.obtener(descuento_id)
        _verificar_permiso(descuento, cuenta_solicitante)
        DescuentoTarifaRepository.eliminar(descuento)