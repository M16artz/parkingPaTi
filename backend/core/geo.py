from django.conf import settings
from rest_framework.exceptions import ValidationError


def validar_coordenadas_loja(latitud, longitud):
    min_lng, min_lat, max_lng, max_lat = settings.LOJA_BBOX
    tolerancia = settings.LOJA_BBOX_TOLERANCE
    if not (
        min_lat - tolerancia <= float(latitud) <= max_lat + tolerancia
        and min_lng - tolerancia <= float(longitud) <= max_lng + tolerancia
    ):
        raise ValidationError({"ubicacion": "La ubicacion debe estar dentro del limite autorizado de Loja."})
