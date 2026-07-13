"""Patron Repository para horarios de atencion."""

from apps.horarios.models import HorarioAtencion
from core.repositories import actualizar_generico


class HorarioAtencionRepository:
    @staticmethod
    def listar_por_parqueadero(parqueadero_id):
        return HorarioAtencion.objects.filter(parqueadero_id=parqueadero_id).select_related('parqueadero').order_by("dia")

    @staticmethod
    def obtener_por_id(horario_id):
        return HorarioAtencion.objects.select_related("parqueadero").filter(id=horario_id).first()

    @staticmethod
    def crear(parqueadero, dia, hora_apertura, hora_cierre):
        # BUG CORREGIDO: el modelo HorarioAtencion define el campo como
        # "dia", no "dia_semana" - el kwarg de abajo debe llamarse igual
        # o Django lanza TypeError al crear.
        return HorarioAtencion.objects.create(
            parqueadero=parqueadero,
            dia=dia,
            hora_apertura=hora_apertura,
            hora_cierre=hora_cierre,
        )

    @staticmethod
    def actualizar(horario, **datos):
        return actualizar_generico(
            horario, campos_permitidos={"dia", "hora_apertura", "hora_cierre"}, **datos
        )

    @staticmethod
    def eliminar(horario):
        horario.delete()

    @staticmethod
    def reemplazar_lote(parqueadero, horarios):
        HorarioAtencion.objects.filter(parqueadero=parqueadero).delete()
        return HorarioAtencion.objects.bulk_create(
            [HorarioAtencion(parqueadero=parqueadero, **datos) for datos in horarios]
        )
