from datetime import datetime, time
from types import SimpleNamespace
from zoneinfo import ZoneInfo

from apps.parqueaderos.models import EstadoOperativo
from apps.parqueaderos.operational_status import calcular_estado_actual, horario_abierto


def parqueadero(**overrides):
    data = {
        "configuracion_completa": True,
        "total_espacios": 4,
        "espacios_disponibles": 2,
        "estado_operativo": EstadoOperativo.ABIERTO,
        "estado_operativo_manual": None,
    }
    data.update(overrides)
    return SimpleNamespace(**data)


def test_estado_automatico_respeta_horario_de_guayaquil():
    horarios = [SimpleNamespace(dia="LUNES", hora_apertura=time(8), hora_cierre=time(18))]
    antes = datetime(2026, 7, 20, 7, 30, tzinfo=ZoneInfo("America/Guayaquil"))
    durante = datetime(2026, 7, 20, 10, 30, tzinfo=ZoneInfo("America/Guayaquil"))

    assert horario_abierto(horarios, antes) is False
    assert calcular_estado_actual(parqueadero(), horario_abierto(horarios, antes)) == EstadoOperativo.CERRADO
    assert horario_abierto(horarios, durante) is True
    assert calcular_estado_actual(parqueadero(), horario_abierto(horarios, durante)) == EstadoOperativo.ABIERTO


def test_lleno_se_calcula_dentro_del_horario_y_manual_abierto_ignora_horario():
    lleno = parqueadero(espacios_disponibles=0, estado_operativo=EstadoOperativo.LLENO)
    assert calcular_estado_actual(lleno, True) == EstadoOperativo.LLENO

    manual = parqueadero(estado_operativo_manual=EstadoOperativo.ABIERTO)
    assert calcular_estado_actual(manual, False) == EstadoOperativo.ABIERTO
