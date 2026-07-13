from django.utils import timezone
from rest_framework.exceptions import NotFound

from apps.parqueaderos.repositories import ParqueaderoRepository


class PublicParkingService:
    @staticmethod
    def listar_por_bbox(bbox):
        parqueaderos = list(ParqueaderoRepository.listar_publicos_bbox(*bbox))
        ultima_actualizacion = max(
            (parqueadero.updated_at for parqueadero in parqueaderos),
            default=timezone.now(),
        )
        return {"updated_at": ultima_actualizacion, "results": parqueaderos}

    @staticmethod
    def obtener_detalle(parqueadero_id):
        parqueadero = ParqueaderoRepository.obtener_publico(parqueadero_id)
        if parqueadero is None:
            raise NotFound("El parqueadero solicitado no esta disponible publicamente.")
        return parqueadero
