from django.utils import timezone
from django.db.models import Q
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken

from apps.usuarios.models import Cuenta, EstadoOnboarding, Persona, TipoRol, VerificacionCorreo
from core.repositories import actualizar_generico


class PersonaRepository:
    @staticmethod
    def crear(**datos):
        return Persona.objects.create(**datos)

    @staticmethod
    def obtener_por_identificacion(identificacion):
        return Persona.objects.filter(identificacion=identificacion).first()

    @staticmethod
    def actualizar_estado(persona, estado):
        return actualizar_generico(persona, campos_permitidos={"estado"}, estado=estado)


class CuentaRepository:
    @staticmethod
    def crear(**datos):
        return Cuenta.objects.create_user(**datos)

    @staticmethod
    def obtener_por_id(cuenta_id):
        return Cuenta.objects.select_related("persona").filter(id=cuenta_id).first()

    @staticmethod
    def obtener_por_username(username):
        return Cuenta.objects.select_related("persona").filter(username=username).first()

    @staticmethod
    def obtener_por_correo(correo):
        return Cuenta.objects.select_related("persona").filter(correo__iexact=correo).first()

    @staticmethod
    def bloquear_por_id(cuenta_id):
        return Cuenta.objects.select_for_update().select_related("persona").filter(id=cuenta_id).first()

    @staticmethod
    def listar():
        return Cuenta.objects.select_related("persona").order_by("id")

    @staticmethod
    def listar_solicitudes_admin(estado=None, busqueda=""):
        queryset = Cuenta.objects.select_related(
            "persona",
            "parqueadero__direccion",
            "parqueadero__ubicacion",
            "documento_habilitacion",
        ).filter(
            rol=TipoRol.PROPIETARIO,
            parqueadero__isnull=False,
            documento_habilitacion__isnull=False,
            onboarding_estado__in=[
                EstadoOnboarding.REVISION_PENDIENTE,
                EstadoOnboarding.RECHAZADO,
                EstadoOnboarding.CONFIGURACION_PENDIENTE,
            ],
        )
        if estado:
            queryset = queryset.filter(onboarding_estado=estado)
        if busqueda:
            queryset = queryset.filter(
                Q(persona__nombre__icontains=busqueda)
                | Q(persona__apellido__icontains=busqueda)
                | Q(persona__identificacion__icontains=busqueda)
                | Q(correo__icontains=busqueda)
                | Q(parqueadero__nombre__icontains=busqueda)
            )
        return queryset.order_by("parqueadero__updated_at", "id")

    @staticmethod
    def obtener_solicitud_admin(cuenta_id):
        return Cuenta.objects.select_related(
            "persona",
            "parqueadero__direccion",
            "parqueadero__ubicacion",
            "documento_habilitacion__reviewed_by__persona",
        ).filter(
            id=cuenta_id,
            rol=TipoRol.PROPIETARIO,
            parqueadero__isnull=False,
            documento_habilitacion__isnull=False,
        ).first()

    @staticmethod
    def listar_propietarios_admin(estado=None, activo=None, busqueda=""):
        queryset = Cuenta.objects.select_related("persona", "parqueadero").filter(
            rol=TipoRol.PROPIETARIO
        )
        if estado:
            queryset = queryset.filter(onboarding_estado=estado)
        if activo is not None:
            queryset = queryset.filter(is_active=activo)
        if busqueda:
            queryset = queryset.filter(
                Q(persona__nombre__icontains=busqueda)
                | Q(persona__apellido__icontains=busqueda)
                | Q(persona__identificacion__icontains=busqueda)
                | Q(correo__icontains=busqueda)
                | Q(parqueadero__nombre__icontains=busqueda)
            )
        return queryset.order_by("persona__apellido", "persona__nombre", "id")

    @staticmethod
    def obtener_propietario_admin(cuenta_id):
        return Cuenta.objects.select_related(
            "persona",
            "parqueadero__direccion",
            "parqueadero__ubicacion",
            "documento_habilitacion__reviewed_by__persona",
        ).filter(id=cuenta_id, rol=TipoRol.PROPIETARIO).first()

    @staticmethod
    def revocar_refresh_tokens(cuenta):
        tokens = OutstandingToken.objects.filter(user=cuenta)
        for token in tokens:
            BlacklistedToken.objects.get_or_create(token=token)

    @staticmethod
    def existe_username_o_correo(username, correo):
        return Cuenta.objects.filter(username=username).exists() or Cuenta.objects.filter(correo=correo).exists()

    @staticmethod
    def actualizar(cuenta, **datos):
        return actualizar_generico(
            cuenta,
            campos_permitidos={
                "correo",
                "is_active",
                "correo_verificado",
                "correo_verificado_en",
                "onboarding_estado",
            },
            **datos,
        )

    @staticmethod
    def eliminar(cuenta):
        cuenta.delete()


class VerificacionCorreoRepository:
    @staticmethod
    def crear(**datos):
        return VerificacionCorreo.objects.create(**datos)

    @staticmethod
    def obtener_por_hash(token_hash):
        return VerificacionCorreo.objects.select_related("cuenta").filter(token_hash=token_hash).first()

    @staticmethod
    def bloquear_por_hash(token_hash):
        return VerificacionCorreo.objects.select_for_update().select_related("cuenta").filter(
            token_hash=token_hash
        ).first()

    @staticmethod
    def invalidar_activas(cuenta_id):
        return VerificacionCorreo.objects.filter(
            cuenta_id=cuenta_id,
            used_at__isnull=True,
        ).update(used_at=timezone.now())

    @staticmethod
    def marcar_usada(verificacion):
        verificacion.used_at = timezone.now()
        verificacion.save(update_fields=["used_at"])
        return verificacion
