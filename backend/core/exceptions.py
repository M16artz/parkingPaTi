import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        original = response.data
        fields = None
        detail = original
        if isinstance(original, dict):
            detail = original.get("detail", "La solicitud contiene errores.")
            fields = {key: value for key, value in original.items() if key != "detail"} or None
        response.data = {
            "error": True,
            "code": getattr(exc, "default_code", "error"),
            "detail": detail,
            "fields": fields,
        }
        return response

    request = context.get("request")
    view = context.get("view")
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
            "code": "internal_error",
            "detail": "Ocurrio un error inesperado. Intenta nuevamente mas tarde.",
            "fields": None,
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
