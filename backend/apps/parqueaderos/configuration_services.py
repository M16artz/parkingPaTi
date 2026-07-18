from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework.exceptions import APIException, NotFound, PermissionDenied, ValidationError

from apps.estancias.repositories import EstanciaRepository
from apps.horarios.repositories import HorarioAtencionRepository
from apps.parqueaderos.models import EstadoEspacio, EstadoHabilitacion, EstadoOperativo, EstadoOperativoManual
from apps.parqueaderos.repositories import EspacioRepository, ParqueaderoRepository
from apps.parqueaderos.services import EspacioService
from apps.tarifas.models import TipoCategoriaTarifa
from apps.tarifas.repositories import CategoriaTarifaRepository
from apps.usuarios.models import EstadoOnboarding, TipoRol
from apps.usuarios.repositories import CuentaRepository


class ConflictoEspacio(APIException):
    status_code = 409
    default_detail = "El espacio cambio de estado o no admite esta operacion."
    default_code = "space_conflict"


class ConfiguracionFinalService:
    NOMBRES_TARIFA = {
        TipoCategoriaTarifa.NORMAL: "Normal",
        TipoCategoriaTarifa.DESCUENTO: "Descuento",
        TipoCategoriaTarifa.INCREMENTO: "Incremento",
    }

    @staticmethod
    def _verificar_propietario(cuenta):
        if (
            not cuenta
            or not cuenta.is_authenticated
            or cuenta.rol != TipoRol.PROPIETARIO
            or not cuenta.is_active
        ):
            raise PermissionDenied("Se requiere una cuenta propietaria activa.")

    @staticmethod
    def obtener(cuenta):
        ConfiguracionFinalService._verificar_propietario(cuenta)
        parqueadero = ParqueaderoRepository.obtener_por_propietario(cuenta.id)
        if parqueadero is None:
            raise NotFound("La cuenta no tiene un parqueadero.")
        return ConfiguracionFinalService._respuesta(cuenta, parqueadero)

    @staticmethod
    @transaction.atomic
    def configurar(cuenta, horarios, tarifas, cantidad_espacios):
        ConfiguracionFinalService._verificar_propietario(cuenta)
        cuenta_bloqueada = CuentaRepository.bloquear_por_id(cuenta.id)
        parqueadero = ParqueaderoRepository.bloquear_por_propietario(cuenta.id)
        if cuenta_bloqueada is None or parqueadero is None:
            raise NotFound("La cuenta o su parqueadero no existen.")
        if parqueadero.habilitacion_estado != EstadoHabilitacion.APROBADO:
            raise ValidationError("El parqueadero debe estar aprobado antes de configurarse.")
        if cuenta_bloqueada.onboarding_estado not in {
            EstadoOnboarding.CONFIGURACION_PENDIENTE,
            EstadoOnboarding.ACTIVO,
        }:
            raise ValidationError("La cuenta no puede configurar el parqueadero en su estado actual.")

        HorarioAtencionRepository.reemplazar_lote(parqueadero, horarios)
        tarifa_normal = ConfiguracionFinalService._configurar_tarifas(parqueadero, tarifas)

        espacios = list(EspacioRepository.listar_por_parqueadero(parqueadero.id, incluir_inactivos=True))
        activos = [espacio for espacio in espacios if espacio.is_active]
        if not espacios:
            nombres = ConfiguracionFinalService._generar_nombres(parqueadero.id, cantidad_espacios)
            EspacioRepository.crear_lote(parqueadero, nombres, tarifa_normal)
        elif len(activos) != cantidad_espacios:
            raise ValidationError(
                "La cantidad inicial ya fue creada; usa el endpoint de lote para agregar espacios."
            )

        ParqueaderoRepository.actualizar(parqueadero, configuracion_completa=True)
        EspacioService.recalcular_conteos(parqueadero)
        CuentaRepository.actualizar(cuenta_bloqueada, onboarding_estado=EstadoOnboarding.ACTIVO)
        return ConfiguracionFinalService._respuesta(cuenta_bloqueada, parqueadero)

    @staticmethod
    def _configurar_tarifas(parqueadero, tarifas):
        existentes = {
            tarifa.codigo: tarifa
            for tarifa in CategoriaTarifaRepository.bloquear_por_parqueadero(parqueadero.id)
        }
        recibidos = set()
        for datos_entrada in tarifas:
            datos = dict(datos_entrada)
            codigo = datos.pop("codigo")
            recibidos.add(codigo)
            datos["nombre_visible"] = datos.get("nombre_visible") or ConfiguracionFinalService.NOMBRES_TARIFA[codigo]
            if codigo == TipoCategoriaTarifa.NORMAL:
                datos["activa"] = True
            existente = existentes.get(codigo)
            if existente is None:
                existentes[codigo] = CategoriaTarifaRepository.crear(
                    parqueadero,
                    codigo=codigo,
                    **datos,
                )
            else:
                CategoriaTarifaRepository.actualizar(existente, **datos)

        tarifa_normal = existentes.get(TipoCategoriaTarifa.NORMAL)
        if tarifa_normal is None:
            raise ValidationError("La tarifa NORMAL es obligatoria.")

        desactivadas = []
        for codigo, tarifa in existentes.items():
            if codigo != TipoCategoriaTarifa.NORMAL and codigo not in recibidos and tarifa.activa:
                CategoriaTarifaRepository.actualizar(tarifa, activa=False)
                desactivadas.append(tarifa.id)
        if desactivadas:
            EspacioRepository.reasignar_tarifas(parqueadero.id, desactivadas, tarifa_normal)
        return tarifa_normal

    @staticmethod
    def _generar_nombres(parqueadero_id, cantidad):
        existentes = EspacioRepository.nombres_existentes(parqueadero_id)
        nombres = []
        numero = 1
        while len(nombres) < cantidad:
            candidato = f"E{numero:03d}"
            if candidato not in existentes:
                nombres.append(candidato)
            numero += 1
        return nombres

    @staticmethod
    def _respuesta(cuenta, parqueadero):
        return {
            "parqueadero_id": parqueadero.id,
            "configuracion_completa": parqueadero.configuracion_completa,
            "onboarding_estado": cuenta.onboarding_estado,
            "estado_operativo": parqueadero.estado_operativo,
            "estado_operativo_manual": parqueadero.estado_operativo_manual,
            "total_espacios": parqueadero.total_espacios,
            "espacios_disponibles": parqueadero.espacios_disponibles,
            "horarios": HorarioAtencionRepository.listar_por_parqueadero(parqueadero.id),
            "tarifas": CategoriaTarifaRepository.listar_por_parqueadero(parqueadero.id),
            "espacios": EspacioRepository.listar_por_parqueadero(
                parqueadero.id,
                incluir_inactivos=True,
            ),
        }


class EstadoOperativoPropietarioService:
    @staticmethod
    @transaction.atomic
    def cambiar(cuenta, estado):
        ConfiguracionFinalService._verificar_propietario(cuenta)
        parqueadero = ParqueaderoRepository.bloquear_por_propietario(cuenta.id)
        if parqueadero is None:
            raise NotFound("La cuenta no tiene un parqueadero.")
        if not parqueadero.configuracion_completa:
            raise ValidationError("Completa primero la configuracion final.")

        if estado == EstadoOperativo.ABIERTO:
            ParqueaderoRepository.actualizar(parqueadero, estado_operativo_manual=None)
            EspacioService.recalcular_conteos(parqueadero)
        else:
            if estado not in EstadoOperativoManual.values:
                raise ValidationError("El estado operativo manual no es valido.")
            ParqueaderoRepository.actualizar(
                parqueadero,
                estado_operativo_manual=estado,
                estado_operativo=estado,
            )
        return ConfiguracionFinalService._respuesta(cuenta, parqueadero)


class GestionEspacioService:
    @staticmethod
    def _bloquear_propiedad(cuenta, espacio_id=None):
        ConfiguracionFinalService._verificar_propietario(cuenta)
        if espacio_id is None:
            parqueadero = ParqueaderoRepository.bloquear_por_propietario(cuenta.id)
            espacio = None
        else:
            espacio_inicial = EspacioRepository.obtener_por_id(espacio_id)
            if espacio_inicial is None:
                raise NotFound("El espacio no existe.")
            if espacio_inicial.parqueadero.propietario_id != cuenta.id:
                raise PermissionDenied("No tienes permiso para modificar este espacio.")
            parqueadero = ParqueaderoRepository.bloquear_por_id(espacio_inicial.parqueadero_id)
            espacio = EspacioRepository.bloquear_por_id(espacio_id)
        if parqueadero is None or parqueadero.propietario_id != cuenta.id:
            raise NotFound("El parqueadero no existe.")
        if not parqueadero.configuracion_completa:
            raise ValidationError("Completa primero la configuracion final.")
        return parqueadero, espacio

    @staticmethod
    @transaction.atomic
    def crear_lote(cuenta, cantidad):
        parqueadero, _ = GestionEspacioService._bloquear_propiedad(cuenta)
        tarifa_normal = CategoriaTarifaRepository.obtener_normal(parqueadero.id)
        if tarifa_normal is None or not tarifa_normal.activa:
            raise ValidationError("El parqueadero no tiene una tarifa NORMAL activa.")
        nombres = ConfiguracionFinalService._generar_nombres(parqueadero.id, cantidad)
        try:
            espacios = EspacioRepository.crear_lote(parqueadero, nombres, tarifa_normal)
        except IntegrityError as exc:
            raise ConflictoEspacio("No se pudo crear el lote por nombres duplicados.") from exc
        EspacioService.recalcular_conteos(parqueadero)
        return espacios

    @staticmethod
    @transaction.atomic
    def editar(cuenta, espacio_id, **datos):
        parqueadero, espacio = GestionEspacioService._bloquear_propiedad(cuenta, espacio_id)
        if not espacio.is_active:
            raise ConflictoEspacio("El espacio esta eliminado logicamente.")
        nombre = datos.get("nombre")
        if nombre and EspacioRepository.existe_nombre_activo(
            parqueadero.id,
            nombre,
            excluir_id=espacio.id,
        ):
            raise ConflictoEspacio("Ya existe un espacio activo con ese nombre.")
        tarifa_id = datos.pop("tarifa_predeterminada", None)
        if tarifa_id is not None:
            tarifa = CategoriaTarifaRepository.obtener_por_id(tarifa_id)
            if tarifa is None or tarifa.parqueadero_id != parqueadero.id or not tarifa.activa:
                raise ValidationError("La tarifa no pertenece al parqueadero o no esta activa.")
            datos["tarifa_predeterminada"] = tarifa
        try:
            espacio = EspacioRepository.actualizar(espacio, **datos)
        except IntegrityError as exc:
            raise ConflictoEspacio("Ya existe un espacio activo con ese nombre.") from exc
        EspacioService.recalcular_conteos(parqueadero)
        return espacio

    @staticmethod
    @transaction.atomic
    def eliminar(cuenta, espacio_id):
        parqueadero, espacio = GestionEspacioService._bloquear_propiedad(cuenta, espacio_id)
        if not espacio.is_active:
            raise ConflictoEspacio("El espacio ya esta eliminado logicamente.")
        if EstanciaRepository.obtener_activa_por_espacio(espacio.id) is not None:
            raise ConflictoEspacio("No se puede eliminar un espacio con una estancia activa.")
        EspacioRepository.actualizar(
            espacio,
            is_active=False,
            deleted_at=timezone.now(),
            estado=EstadoEspacio.INHABILITADO,
        )
        EspacioService.recalcular_conteos(parqueadero)

    @staticmethod
    @transaction.atomic
    def reactivar(cuenta, espacio_id):
        parqueadero, espacio = GestionEspacioService._bloquear_propiedad(cuenta, espacio_id)
        if espacio.is_active or espacio.deleted_at is None:
            raise ConflictoEspacio("El espacio no esta eliminado logicamente.")
        if EspacioRepository.existe_nombre_activo(parqueadero.id, espacio.nombre, excluir_id=espacio.id):
            raise ConflictoEspacio("Existe otro espacio activo con el mismo nombre.")
        tarifa = espacio.tarifa_predeterminada
        if tarifa is None or not tarifa.activa:
            tarifa = CategoriaTarifaRepository.obtener_normal(parqueadero.id)
        try:
            espacio = EspacioRepository.actualizar(
                espacio,
                is_active=True,
                deleted_at=None,
                estado=EstadoEspacio.LIBRE,
                tarifa_predeterminada=tarifa,
            )
        except IntegrityError as exc:
            raise ConflictoEspacio("Existe otro espacio activo con el mismo nombre.") from exc
        EspacioService.recalcular_conteos(parqueadero)
        return espacio
