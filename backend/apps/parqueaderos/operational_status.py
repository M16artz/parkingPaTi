from datetime import time

from django.utils import timezone

from apps.parqueaderos.models import EstadoOperativo


DIAS_SEMANA = (
    "LUNES",
    "MARTES",
    "MIERCOLES",
    "JUEVES",
    "VIERNES",
    "SABADO",
    "DOMINGO",
)


def momento_local(ahora=None):
    return timezone.localtime(ahora or timezone.now())


def horario_abierto(horarios, ahora=None):
    local = momento_local(ahora)
    dia = DIAS_SEMANA[local.weekday()]
    hora = local.time().replace(tzinfo=None)
    for horario in horarios:
        horario_dia = getattr(horario, "dia", horario.get("dia") if isinstance(horario, dict) else None)
        apertura = getattr(
            horario,
            "hora_apertura",
            horario.get("hora_apertura") if isinstance(horario, dict) else None,
        )
        cierre = getattr(
            horario,
            "hora_cierre",
            horario.get("hora_cierre") if isinstance(horario, dict) else None,
        )
        if isinstance(apertura, str):
            apertura = time.fromisoformat(apertura)
        if isinstance(cierre, str):
            cierre = time.fromisoformat(cierre)
        if horario_dia == dia and apertura <= hora < cierre:
            return True
    return False


def calcular_estado_actual(parqueadero, horario_esta_abierto):
    if not parqueadero.configuracion_completa or parqueadero.total_espacios == 0:
        return EstadoOperativo.INACTIVO

    manual = parqueadero.estado_operativo_manual
    if manual in {EstadoOperativo.CERRADO, EstadoOperativo.FUERA_DE_SERVICIO}:
        return manual
    if manual is None and not horario_esta_abierto:
        return EstadoOperativo.CERRADO
    if parqueadero.espacios_disponibles > 0:
        return EstadoOperativo.ABIERTO
    if parqueadero.estado_operativo == EstadoOperativo.FUERA_DE_SERVICIO:
        return EstadoOperativo.FUERA_DE_SERVICIO
    return EstadoOperativo.LLENO
