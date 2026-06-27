"""
Capa de servicio (logica de negocio) para la app usuarios.
"""

from django.db import transaction
from rest_framework.exceptions import ValidationError

from apps.usuarios.models import TipoRol
from apps.usuarios.repositories import CuentaRepository, PersonaRepository


class RegistroService:
    @staticmethod
    def registrar_cuenta(datos_persona: dict, datos_cuenta: dict, nombre_rol: str = TipoRol.PROPIETARIO):
        if CuentaRepository.existe_username_o_correo(
            datos_cuenta["username"], datos_cuenta["correo"]
        ):
            raise ValidationError("El nombre de usuario o el correo ya están registrados.")

        persona_existente = PersonaRepository.obtener_por_identificacion(
            datos_persona["identificacion"]
        )
        if persona_existente is not None:
            raise ValidationError("Ya existe una persona registrada con esa identificación.")

        with transaction.atomic():
            persona = PersonaRepository.crear(**datos_persona)
            
            cuenta = CuentaRepository.crear(
                username=datos_cuenta["username"],
                correo=datos_cuenta["correo"],
                password=datos_cuenta["password"],
                persona=persona,
                rol=nombre_rol,
            )
            
        return cuenta


class CuentaService:
    @staticmethod
    def listar_cuentas():
        return CuentaRepository.listar()

    @staticmethod
    def obtener_cuenta(cuenta_id):
        cuenta = CuentaRepository.obtener_por_id(cuenta_id)
        if cuenta is None:
            raise ValidationError("La cuenta solicitada no existe.")
        return cuenta

    @staticmethod
    def actualizar_cuenta(cuenta_id, **datos):
        cuenta = CuentaService.obtener_cuenta(cuenta_id)
        password = datos.pop("password", None)
        
        cuenta = CuentaRepository.actualizar(cuenta, **datos)
        
        # set_password hashea la contraseña correctamente
        if password:
            cuenta.set_password(password)
            cuenta.save()
            
        return cuenta

    @staticmethod
    def eliminar_cuenta(cuenta_id):
        cuenta = CuentaService.obtener_cuenta(cuenta_id)
        CuentaRepository.eliminar(cuenta)