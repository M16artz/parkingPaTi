"""
Permisos por rol (RNF08: control de acceso basado en roles).
Cada permiso es transversal a varias apps, por eso vive en core/ y no
dentro de una app de dominio especifica.
"""

from rest_framework.permissions import BasePermission


class EsAdministrador(BasePermission):
    """Permite acceso solo a cuentas con rol ADMINISTRADOR."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "rol", None)
            and request.user.rol.nombre == "ADMINISTRADOR"
        )


class EsPropietario(BasePermission):
    """Permite acceso solo a cuentas con rol PROPIETARIO."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "rol", None)
            and request.user.rol.nombre == "PROPIETARIO"
        )


class EsPropietarioDelRecurso(BasePermission):
    """
    Permite modificar un objeto solo si la cuenta autenticada es la
    propietaria de ese recurso especifico (ej. su propio Parqueadero).
    Se asume que el objeto expone un atributo `cuenta` o `propietario`.
    """

    def has_object_permission(self, request, view, obj):
        propietario_id = getattr(obj, "cuenta_id", None) or getattr(obj, "propietario_id", None)
        return propietario_id == request.user.id
