"""
Patrón Repository para tarifas usando Multi-Table Inheritance.
"""

from apps.tarifas.models import DescuentoTarifa, EstrategiaTarifa, IncrementoTarifa
from core.repositories import actualizar_generico


class EstrategiaTarifaRepository:
    @staticmethod
    def listar(parqueadero_id=None):
        queryset = EstrategiaTarifa.objects.select_related("parqueadero").all()
        if parqueadero_id:
            queryset = queryset.filter(parqueadero_id=parqueadero_id)
        return queryset

    @staticmethod
    def obtener_por_id(estrategia_id):
        return EstrategiaTarifa.objects.select_related("parqueadero").filter(id=estrategia_id).first()

    @staticmethod
    def obtener_por_parqueadero(parqueadero_id):
        return EstrategiaTarifa.objects.filter(parqueadero_id=parqueadero_id).first()

    @staticmethod
    def crear(parqueadero, precio_hora):
        return EstrategiaTarifa.objects.create(
            parqueadero=parqueadero,
            precio_hora=precio_hora
        )

    @staticmethod
    def actualizar(estrategia, **datos):
        return actualizar_generico(estrategia, campos_permitidos={"precio_hora"}, **datos)

    @staticmethod
    def eliminar(estrategia):
        estrategia.delete()


class IncrementoTarifaRepository:
    @staticmethod
    def listar(parqueadero_id=None):
        queryset = IncrementoTarifa.objects.select_related("parqueadero").all()
        if parqueadero_id:
            queryset = queryset.filter(parqueadero_id=parqueadero_id)
        return queryset

    @staticmethod
    def obtener_por_id(incremento_id):
        return IncrementoTarifa.objects.select_related("parqueadero").filter(id=incremento_id).first()

    @staticmethod
    def crear(parqueadero, precio_hora, porcentaje):
        return IncrementoTarifa.objects.create(
            parqueadero=parqueadero,
            precio_hora=precio_hora,
            porcentaje=porcentaje
        )

    @staticmethod
    def actualizar(incremento, **datos):
        return actualizar_generico(incremento, campos_permitidos={"precio_hora", "porcentaje"}, **datos)

    @staticmethod
    def eliminar(incremento):
        incremento.delete()


class DescuentoTarifaRepository:
    @staticmethod
    def listar(parqueadero_id=None):
        queryset = DescuentoTarifa.objects.select_related("parqueadero").all()
        if parqueadero_id:
            queryset = queryset.filter(parqueadero_id=parqueadero_id)
        return queryset

    @staticmethod
    def obtener_por_id(descuento_id):
        return DescuentoTarifa.objects.select_related("parqueadero").filter(id=descuento_id).first()

    @staticmethod
    def crear(parqueadero, precio_hora, porcentaje):
        return DescuentoTarifa.objects.create(
            parqueadero=parqueadero,
            precio_hora=precio_hora,
            porcentaje=porcentaje
        )

    @staticmethod
    def actualizar(descuento, **datos):
        return actualizar_generico(descuento, campos_permitidos={"precio_hora", "porcentaje"}, **datos)

    @staticmethod
    def eliminar(descuento):
        descuento.delete()