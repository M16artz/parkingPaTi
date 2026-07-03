"""
Patrón Repository para la app usuarios.
"""

from apps.usuarios.models import Cuenta, Persona
from core.repositories import actualizar_generico


class PersonaRepository:
    @staticmethod
    def crear(**datos):
        return Persona.objects.create(**datos)

    @staticmethod
    def obtener_por_identificacion(identificacion):
        # Cambiado de id_identificacion a identificacion
        return Persona.objects.filter(identificacion=identificacion).first()


class CuentaRepository:
    @staticmethod
    def crear(**datos):
        # Usamos create_user porque hereda de AbstractUser y hashea el password automáticamente
        return Cuenta.objects.create_user(**datos)

    @staticmethod
    def obtener_por_id(cuenta_id):
        # Eliminado "rol" del select_related
        return Cuenta.objects.select_related("persona").filter(id=cuenta_id).first()

    @staticmethod
    def obtener_por_username(username):
        return Cuenta.objects.select_related("persona").filter(username=username).first()

    @staticmethod
    def listar():
        return Cuenta.objects.select_related("persona").all()

    @staticmethod
    def existe_username_o_correo(username, correo):
        return Cuenta.objects.filter(username=username).exists() or Cuenta.objects.filter(correo=correo).exists()

    @staticmethod
    def actualizar(cuenta, **datos):
        return actualizar_generico(cuenta, campos_permitidos={"correo", "estado"}, **datos)

    @staticmethod
    def eliminar(cuenta):
        cuenta.delete()