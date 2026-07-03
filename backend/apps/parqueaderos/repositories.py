"""
Patron Repository para parqueaderos y espacios.
"""

from django.db import transaction
from django.db.models import Count, Q

from apps.parqueaderos.models import Direccion, Espacio, Parqueadero, TipoEstado, Ubicacion
from core.repositories import actualizar_generico


class ParqueaderoRepository:
    @staticmethod
    def listar(solo_validados=True):
        # Cambiado "cuenta" por "propietario"
        # `annotate` evita el N+1 que tenia ParqueaderoResumenDTO
        # (antes: 1 query COUNT extra por cada parqueadero de la lista).
        qs = (
            Parqueadero.objects.select_related("direccion", "ubicacion", "propietario")
            .annotate(
                espacios_disponibles_count=Count(
                    "espacios", filter=Q(espacios__estado=TipoEstado.LIBRE)
                )
            )
        )
        if solo_validados:
            qs = qs.filter(estado=True, validado=True)
        return qs.order_by("id")

    @staticmethod
    def obtener_por_id(parqueadero_id):
        # Cambiado "cuenta" por "propietario"
        return Parqueadero.objects.select_related(
            "direccion", "ubicacion", "propietario"
        ).filter(id=parqueadero_id).first()

    @staticmethod
    def crear(propietario, direccion_datos, ubicacion_datos, **datos_parqueadero):
        # EL ORDEN CAMBIÓ: El modelo exige que Parqueadero exista primero.
        # Se envuelve en una transaccion: si Direccion o Ubicacion fallan
        # (p. ej. datos invalidos), no debe quedar un Parqueadero huerfano
        # sin direccion/ubicacion en la base de datos.
        with transaction.atomic():
            parqueadero = Parqueadero.objects.create(
                propietario=propietario,
                **datos_parqueadero
            )
            Direccion.objects.create(parqueadero=parqueadero, **direccion_datos)
            Ubicacion.objects.create(parqueadero=parqueadero, **ubicacion_datos)

        return parqueadero

    @staticmethod
    def actualizar(parqueadero, **datos):
        return actualizar_generico(
            parqueadero,
            campos_permitidos={"nombre", "estado", "tarifa", "disponibilidad", "validado"},
            **datos,
        )

    @staticmethod
    def eliminar(parqueadero):
        parqueadero.delete()

    @staticmethod
    def por_propietario(propietario_id):
        # Actualizado para filtrar por propietario_id
        return Parqueadero.objects.filter(propietario_id=propietario_id)


class EspacioRepository:
    @staticmethod
    def listar_por_parqueadero(parqueadero_id):
        return Espacio.objects.filter(parqueadero_id=parqueadero_id)

    @staticmethod
    def obtener_por_id(espacio_id):
        return Espacio.objects.select_related("parqueadero").filter(id=espacio_id).first()

    @staticmethod
    def crear(parqueadero, numero_espacio, estado=TipoEstado.LIBRE):
        # Se requiere inyectar el nuevo campo "numero_espacio"
        return Espacio.objects.create(
            parqueadero=parqueadero, 
            numero_espacio=numero_espacio, 
            estado=estado
        )

    @staticmethod
    def actualizar_estado(espacio, nuevo_estado):
        espacio.estado = nuevo_estado
        espacio.save(update_fields=["estado"])
        return espacio

    @staticmethod
    def actualizar(espacio, **datos):
        return actualizar_generico(espacio, campos_permitidos={"estado"}, **datos)

    @staticmethod
    def eliminar(espacio):
        espacio.delete()

    @staticmethod
    def contar_disponibles(parqueadero_id):
        return Espacio.objects.filter(
            parqueadero_id=parqueadero_id, estado=TipoEstado.LIBRE
        ).count()