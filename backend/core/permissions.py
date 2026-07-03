"""
Permisos por rol (RNF08: control de acceso basado en roles).
Cada permiso es transversal a varias apps, por eso vive en core/ y no
dentro de una app de dominio especifica.
"""

from rest_framework.permissions import BasePermission


def es_administrador(cuenta) -> bool:
    """Utilidad compartida: evita reimplementar el mismo chequeo de rol
    en cada capa de servicio (antes duplicado en usuarios/parqueaderos/
    tarifas/horarios/documentos)."""
    return bool(
        cuenta
        and getattr(cuenta, "is_authenticated", False)
        and getattr(cuenta, "rol", None) == "ADMINISTRADOR"
    )


class EsAdministrador(BasePermission):
    """Permite acceso solo a cuentas con rol ADMINISTRADOR."""

    def has_permission(self, request, view):
        return es_administrador(request.user)


class EsPropietario(BasePermission):
    """Permite acceso solo a cuentas con rol PROPIETARIO."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "rol", None) == "PROPIETARIO"
        )


class EsPropietarioDelRecurso(BasePermission):
    """
    Permite modificar un objeto solo si la cuenta autenticada es la
    propietaria de ese recurso especifico (ej. su propio Parqueadero) o
    es administrador. Se asume que el objeto expone un atributo `cuenta_id`
    o `propietario_id`.
    """

    def has_permission(self, request, view):
        # Requerido: sin esto, un usuario anonimo (request.user.id is None)
        # podria colar un objeto huerfano con propietario_id=None.
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if es_administrador(request.user):
            return True
        propietario_id = getattr(obj, "cuenta_id", None) or getattr(obj, "propietario_id", None)
        return propietario_id is not None and propietario_id == request.user.id
