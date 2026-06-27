"""Patron Repository para horarios de atencion."""

from apps.horarios.models import HorarioAtencion


class HorarioAtencionRepository:
    @staticmethod
    def listar_por_parqueadero(parqueadero_id):
        return HorarioAtencion.objects.filter(parqueadero_id=parqueadero_id)

    @staticmethod
    def obtener_por_id(horario_id):
        return HorarioAtencion.objects.select_related("parqueadero").filter(id=horario_id).first()

    @staticmethod
    def crear(parqueadero, dia_semana, hora_apertura, hora_cierre):
        return HorarioAtencion.objects.create(
            parqueadero=parqueadero,
            dia_semana=dia_semana,
            hora_apertura=hora_apertura,
            hora_cierre=hora_cierre,
        )

    @staticmethod
    def actualizar(horario, **datos):
        for campo, valor in datos.items():
            setattr(horario, campo, valor)
        horario.save()
        return horario

    @staticmethod
    def eliminar(horario):
        horario.delete()
