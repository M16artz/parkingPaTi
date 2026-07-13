from django.db import transaction
from django.db.models import Count, Prefetch, Q

from apps.parqueaderos.models import (
    Direccion,
    Espacio,
    EstadoEspacio,
    EstadoHabilitacion,
    EstadoOperativo,
    Parqueadero,
    Ubicacion,
)
from apps.tarifas.models import CategoriaTarifa
from core.repositories import actualizar_generico


class ParqueaderoRepository:
    ESTADOS_PUBLICOS = [
        EstadoOperativo.ABIERTO,
        EstadoOperativo.LLENO,
        EstadoOperativo.CERRADO,
    ]

    @staticmethod
    def listar_publicos():
        return Parqueadero.objects.select_related("direccion", "ubicacion", "propietario").filter(
            habilitacion_estado="APROBADO",
            estado_operativo__in=["ABIERTO", "LLENO"],
            propietario__is_active=True,
        ).order_by("id")

    @staticmethod
    def listar_publicos_bbox(min_lng, min_lat, max_lng, max_lat):
        return Parqueadero.objects.select_related("direccion", "ubicacion").filter(
            habilitacion_estado=EstadoHabilitacion.APROBADO,
            configuracion_completa=True,
            estado_operativo__in=ParqueaderoRepository.ESTADOS_PUBLICOS,
            propietario__is_active=True,
            ubicacion__longitud__gte=min_lng,
            ubicacion__longitud__lte=max_lng,
            ubicacion__latitud__gte=min_lat,
            ubicacion__latitud__lte=max_lat,
        ).order_by("id")

    @staticmethod
    def obtener_publico(parqueadero_id):
        return (
            Parqueadero.objects.select_related("direccion", "ubicacion")
            .prefetch_related(
                Prefetch(
                    "tarifas",
                    queryset=CategoriaTarifa.objects.filter(activa=True).order_by("codigo"),
                    to_attr="tarifas_publicas",
                ),
                "horarios",
            )
            .filter(
                id=parqueadero_id,
                habilitacion_estado=EstadoHabilitacion.APROBADO,
                configuracion_completa=True,
                estado_operativo__in=ParqueaderoRepository.ESTADOS_PUBLICOS,
                propietario__is_active=True,
            )
            .first()
        )

    @staticmethod
    def obtener_por_id(parqueadero_id):
        return Parqueadero.objects.select_related("direccion", "ubicacion", "propietario").filter(
            id=parqueadero_id
        ).first()

    @staticmethod
    def obtener_por_propietario(propietario_id):
        return Parqueadero.objects.select_related("direccion", "ubicacion").filter(
            propietario_id=propietario_id
        ).first()

    @staticmethod
    def bloquear_por_id(parqueadero_id):
        return Parqueadero.objects.select_for_update().filter(id=parqueadero_id).first()

    @staticmethod
    def bloquear_por_propietario(propietario_id):
        return Parqueadero.objects.select_for_update().filter(propietario_id=propietario_id).first()

    @staticmethod
    def crear(propietario, direccion_datos, ubicacion_datos, **datos_parqueadero):
        with transaction.atomic():
            parqueadero = Parqueadero.objects.create(propietario=propietario, **datos_parqueadero)
            Direccion.objects.create(parqueadero=parqueadero, **direccion_datos)
            Ubicacion.objects.create(parqueadero=parqueadero, **ubicacion_datos)
        return parqueadero

    @staticmethod
    def actualizar(parqueadero, **datos):
        return actualizar_generico(
            parqueadero,
            campos_permitidos={
                "nombre",
                "descripcion",
                "habilitacion_estado",
                "motivo_rechazo",
                "estado_operativo",
                "total_espacios",
                "espacios_disponibles",
                "configuracion_completa",
                "approved_at",
            },
            **datos,
        )

    @staticmethod
    def actualizar_datos_iniciales(parqueadero, direccion_datos, ubicacion_datos, **datos):
        with transaction.atomic():
            actualizar_generico(
                parqueadero,
                campos_permitidos={"nombre", "descripcion", "motivo_rechazo"},
                **datos,
            )
            actualizar_generico(
                parqueadero.direccion,
                campos_permitidos={"calle_principal", "calle_secundaria", "numero_lote"},
                **direccion_datos,
            )
            actualizar_generico(
                parqueadero.ubicacion,
                campos_permitidos={"latitud", "longitud"},
                **ubicacion_datos,
            )
        return parqueadero

    @staticmethod
    def eliminar(parqueadero):
        parqueadero.delete()

    @staticmethod
    def por_propietario(propietario_id):
        return Parqueadero.objects.select_related("direccion", "ubicacion").filter(propietario_id=propietario_id)


class EspacioRepository:
    @staticmethod
    def listar_por_parqueadero(parqueadero_id, incluir_inactivos=False):
        queryset = Espacio.objects.select_related("parqueadero", "tarifa_predeterminada").filter(
            parqueadero_id=parqueadero_id
        )
        if not incluir_inactivos:
            queryset = queryset.filter(is_active=True)
        return queryset.order_by("id")

    @staticmethod
    def obtener_por_id(espacio_id):
        return Espacio.objects.select_related("parqueadero", "tarifa_predeterminada").filter(
            id=espacio_id
        ).first()

    @staticmethod
    def bloquear_por_id(espacio_id):
        return Espacio.objects.select_for_update().select_related("parqueadero").filter(id=espacio_id).first()

    @staticmethod
    def crear(parqueadero, nombre, estado=EstadoEspacio.LIBRE, tarifa_predeterminada=None):
        return Espacio.objects.create(
            parqueadero=parqueadero,
            nombre=nombre,
            estado=estado,
            tarifa_predeterminada=tarifa_predeterminada,
        )

    @staticmethod
    def crear_lote(parqueadero, nombres, tarifa_predeterminada):
        return Espacio.objects.bulk_create(
            [
                Espacio(
                    parqueadero=parqueadero,
                    nombre=nombre,
                    estado=EstadoEspacio.LIBRE,
                    tarifa_predeterminada=tarifa_predeterminada,
                )
                for nombre in nombres
            ]
        )

    @staticmethod
    def actualizar(espacio, **datos):
        return actualizar_generico(
            espacio,
            campos_permitidos={"nombre", "estado", "tarifa_predeterminada", "is_active", "deleted_at"},
            **datos,
        )

    @staticmethod
    def contar(parqueadero_id):
        queryset = Espacio.objects.filter(parqueadero_id=parqueadero_id, is_active=True)
        return queryset.count(), queryset.filter(estado=EstadoEspacio.LIBRE).count()

    @staticmethod
    def contar_estados(parqueadero_id):
        return Espacio.objects.filter(parqueadero_id=parqueadero_id, is_active=True).aggregate(
            total=Count("id"),
            libres=Count("id", filter=Q(estado=EstadoEspacio.LIBRE)),
            ocupados=Count("id", filter=Q(estado=EstadoEspacio.OCUPADO)),
            inhabilitados=Count("id", filter=Q(estado=EstadoEspacio.INHABILITADO)),
        )

    @staticmethod
    def nombres_existentes(parqueadero_id):
        return set(Espacio.objects.filter(parqueadero_id=parqueadero_id).values_list("nombre", flat=True))

    @staticmethod
    def existe_nombre_activo(parqueadero_id, nombre, excluir_id=None):
        queryset = Espacio.objects.filter(
            parqueadero_id=parqueadero_id,
            nombre__iexact=nombre,
            is_active=True,
        )
        if excluir_id is not None:
            queryset = queryset.exclude(id=excluir_id)
        return queryset.exists()

    @staticmethod
    def reasignar_tarifas(parqueadero_id, tarifa_ids, tarifa_destino):
        return Espacio.objects.filter(
            parqueadero_id=parqueadero_id,
            tarifa_predeterminada_id__in=tarifa_ids,
        ).update(tarifa_predeterminada=tarifa_destino)
