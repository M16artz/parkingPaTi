"""
Manejo uniforme de errores para toda la API (RNF03: el sistema debe dar
retroalimentacion especificando la causa y sugiriendo una accion correctiva).

Este modulo es transversal (core/) porque ningun dominio especifico es
propietario del formato de error - aplica igual a usuarios, parqueaderos,
tarifas, horarios y documentos.
"""
import logging

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Envuelve la respuesta de error por defecto de DRF en un formato uniforme:
    {
        "error": True,
        "detail": "<mensaje legible>",
        "code": "<codigo_corto>"
    }
    """
    response = exception_handler(exc, context)

    if response is not None:
        detail = response.data.get("detail", response.data) if isinstance(response.data, dict) else response.data
        response.data = {
            "error": True,
            "detail": detail,
            "code": getattr(exc, "default_code", "error"),
        }
        return response

    # Excepcion no manejada por DRF: no exponer detalles internos al cliente,
    # pero SI dejar constancia en el log para poder depurarla.
    view = context.get("view")
    request = context.get("request")
    logger.exception(
        "Excepcion no manejada en %s %s (view=%s)",
        getattr(request, "method", "?"),
        getattr(request, "path", "?"),
        view.__class__.__name__ if view else "?",
        exc_info=exc,
    )

    return Response(
        {
            "error": True,
            "detail": "Ocurrio un error inesperado. Intenta nuevamente mas tarde.",
            "code": "internal_error",
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
