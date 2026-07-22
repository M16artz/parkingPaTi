from calendar import monthrange
from datetime import datetime, time
from decimal import Decimal, ROUND_HALF_UP
from math import ceil

from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework.exceptions import APIException, NotFound, PermissionDenied

from apps.estancias.models import EstadoEstancia
from apps.estancias.repositories import EstanciaRepository
from apps.parqueaderos.models import EstadoEspacio
from apps.parqueaderos.repositories import EspacioRepository, ParqueaderoRepository
from apps.parqueaderos.services import EspacioService
from apps.tarifas.repositories import CategoriaTarifaRepository
from apps.usuarios.models import EstadoOnboarding, TipoRol


class ConflictoEstancia(APIException):
    status_code = 409
    default_detail = "La estancia o el espacio no admiten esta operacion."
    default_code = "stay_conflict"


class EstanciaService:
    MESES_RETENCION = 12

    @staticmethod
    def _verificar_propietario(cuenta, parqueadero):
        if (
            not cuenta.is_active
            or cuenta.rol != TipoRol.PROPIETARIO
            or cuenta.onboarding_estado != EstadoOnboarding.ACTIVO
            or parqueadero.propietario_id != cuenta.id
        ):
            raise PermissionDenied("No tienes permiso para gestionar estancias de este parqueadero.")

    @staticmethod
    def _bloquear_espacio_propietario(cuenta, espacio_id):
        espacio_inicial = EspacioRepository.obtener_por_id(espacio_id)
        if espacio_inicial is None:
            raise NotFound("El espacio no existe.")
        parqueadero = ParqueaderoRepository.bloquear_por_id(espacio_inicial.parqueadero_id)
        EstanciaService._verificar_propietario(cuenta, parqueadero)
        espacio = EspacioRepository.bloquear_por_id(espacio_id)
        return parqueadero, espacio

    @staticmethod
    def _calcular(inicio, fin, precio_hora):
        segundos = max(0, (fin - inicio).total_seconds())
        minutos = max(1, ceil(segundos / 60))
        horas = max(1, ceil(minutos / 60))
        costo = (Decimal(precio_hora) * horas).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        return minutos, horas, costo

    @staticmethod
    def _respuesta(estancia, fin_calculo=None):
        calculado_hasta = fin_calculo or estancia.fin or timezone.now()
        if estancia.estado == EstadoEstancia.ACTIVA:
            minutos, horas, costo = EstanciaService._calcular(
                estancia.inicio,
                calculado_hasta,
                estancia.precio_hora_snapshot,
            )
        else:
            minutos = estancia.minutos_reales
            horas = estancia.horas_cobradas
            costo = estancia.costo_total
        return {
            "id": estancia.id,
            "espacio_id": estancia.espacio_id,
            "espacio_nombre": estancia.espacio.nombre,
            "parqueadero_id": estancia.espacio.parqueadero_id,
            "parqueadero_nombre": estancia.espacio.parqueadero.nombre,
            "tarifa_id": estancia.tarifa_id,
            "tarifa_tipo_snapshot": estancia.tarifa_tipo_snapshot,
            "precio_hora_snapshot": estancia.precio_hora_snapshot,
            "inicio": estancia.inicio,
            "fin": estancia.fin,
            "calculado_hasta": calculado_hasta,
            "minutos_reales": minutos,
            "horas_cobradas": horas,
            "costo_total": costo,
            "estado": estancia.estado,
        }

    @staticmethod
    @transaction.atomic
    def iniciar(cuenta, espacio_id, tarifa_id=None, ahora=None):
        parqueadero, espacio = EstanciaService._bloquear_espacio_propietario(cuenta, espacio_id)
        if not espacio.is_active or espacio.estado != EstadoEspacio.LIBRE:
            raise ConflictoEstancia("El espacio debe estar activo y libre.")
        if EstanciaRepository.bloquear_activa_por_espacio(espacio.id) is not None:
            raise ConflictoEstancia("El espacio ya tiene una estancia activa.")

        tarifa = (
            CategoriaTarifaRepository.obtener_por_id(tarifa_id)
            if tarifa_id is not None
            else CategoriaTarifaRepository.obtener_normal(parqueadero.id)
        )
        if tarifa is None or tarifa.parqueadero_id != parqueadero.id or not tarifa.activa:
            raise ConflictoEstancia("La tarifa no pertenece al parqueadero o no esta activa.")
        try:
            estancia = EstanciaRepository.crear(
                espacio=espacio,
                tarifa=tarifa,
                tarifa_tipo_snapshot=tarifa.codigo,
                precio_hora_snapshot=tarifa.precio_hora,
                inicio=ahora or timezone.now(),
            )
        except IntegrityError as exc:
            raise ConflictoEstancia("El espacio ya tiene una estancia activa.") from exc
        EspacioRepository.actualizar(espacio, estado=EstadoEspacio.OCUPADO)
        EspacioService.recalcular_conteos(parqueadero)
        return EstanciaService._respuesta(estancia, fin_calculo=estancia.inicio)

    @staticmethod
    def actual(cuenta, espacio_id, ahora=None):
        espacio = EspacioRepository.obtener_por_id(espacio_id)
        if espacio is None:
            raise NotFound("El espacio no existe.")
        EstanciaService._verificar_propietario(cuenta, espacio.parqueadero)
        estancia = EstanciaRepository.obtener_activa_por_espacio(espacio_id)
        if estancia is None:
            raise NotFound("El espacio no tiene una estancia activa.")
        return EstanciaService._respuesta(estancia, fin_calculo=ahora or timezone.now())

    @staticmethod
    @transaction.atomic
    def finalizar(cuenta, espacio_id, ahora=None):
        parqueadero, espacio = EstanciaService._bloquear_espacio_propietario(cuenta, espacio_id)
        estancia = EstanciaRepository.bloquear_activa_por_espacio(espacio.id)
        if estancia is None or espacio.estado != EstadoEspacio.OCUPADO:
            raise ConflictoEstancia("El espacio no tiene una estancia activa para finalizar.")
        fin = ahora or timezone.now()
        minutos, horas, costo = EstanciaService._calcular(
            estancia.inicio,
            fin,
            estancia.precio_hora_snapshot,
        )
        estancia.fin = fin
        estancia.minutos_reales = minutos
        estancia.horas_cobradas = horas
        estancia.costo_total = costo
        estancia.estado = EstadoEstancia.FINALIZADA
        EstanciaRepository.guardar(
            estancia,
            update_fields=["fin", "minutos_reales", "horas_cobradas", "costo_total", "estado"],
        )
        EspacioRepository.actualizar(espacio, estado=EstadoEspacio.LIBRE)
        EspacioService.recalcular_conteos(parqueadero)
        return EstanciaService._respuesta(estancia)

    @staticmethod
    def _fecha_retencion(ahora):
        year = ahora.year - 1
        day = min(ahora.day, monthrange(year, ahora.month)[1])
        return ahora.replace(year=year, day=day)

    @staticmethod
    def listar_registro(cuenta, ahora=None):
        if not cuenta.is_active or cuenta.rol not in {TipoRol.PROPIETARIO, TipoRol.ADMINISTRADOR}:
            raise PermissionDenied("No tienes permiso para consultar estancias.")
        fecha_desde = EstanciaService._fecha_retencion(ahora or timezone.now())
        propietario_id = cuenta.id if cuenta.rol == TipoRol.PROPIETARIO else None
        return EstanciaRepository.listar_finalizadas_desde(fecha_desde, propietario_id=propietario_id)

    @staticmethod
    def metricas_hoy(cuenta, ahora=None):
        calculado_hasta = ahora or timezone.now()
        parqueadero = ParqueaderoRepository.obtener_por_propietario(cuenta.id)
        if parqueadero is None:
            raise NotFound("La cuenta no tiene un parqueadero.")
        EstanciaService._verificar_propietario(cuenta, parqueadero)

        fecha_local = timezone.localtime(calculado_hasta).date()
        inicio_dia = timezone.make_aware(
            datetime.combine(fecha_local, time.min),
            timezone.get_current_timezone(),
        )
        estancias = EstanciaRepository.listar_iniciadas_en_rango(
            parqueadero.id,
            inicio_dia,
            calculado_hasta,
        )

        ingresos_finalizados = Decimal("0.00")
        ingresos_en_curso = Decimal("0.00")
        estancias_activas = 0
        total = 0
        for estancia in estancias:
            total += 1
            if estancia.estado == EstadoEstancia.ACTIVA:
                estancias_activas += 1
                _, _, costo = EstanciaService._calcular(
                    estancia.inicio,
                    calculado_hasta,
                    estancia.precio_hora_snapshot,
                )
                ingresos_en_curso += costo
            elif estancia.estado == EstadoEstancia.FINALIZADA:
                ingresos_finalizados += estancia.costo_total or Decimal("0.00")

        return {
            "estancias_hoy": total,
            "ingresos_estimados": ingresos_finalizados + ingresos_en_curso,
            "ingresos_finalizados": ingresos_finalizados,
            "ingresos_en_curso": ingresos_en_curso,
            "estancias_activas": estancias_activas,
            "calculado_hasta": calculado_hasta,
            "es_estimado": True,
        }

    @staticmethod
    def serializar_registro(estancia):
        return EstanciaService._respuesta(estancia)

    @staticmethod
    @transaction.atomic
    def eliminar_vencidas(ahora=None):
        fecha_limite = EstanciaService._fecha_retencion(ahora or timezone.now())
        return EstanciaRepository.eliminar_vencidas(fecha_limite)
