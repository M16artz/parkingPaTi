"""
Controladores REST para parqueaderos y espacios.
"""

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.parqueaderos.repositories import EspacioRepository
from apps.parqueaderos.serializers_dto import (
    EspacioCambiarEstadoDTO,
    EspacioCrearDTO,
    EspacioDTO,
    ParqueaderoCrearDTO,
    ParqueaderoDetalleDTO,
    ParqueaderoResumenDTO,
)
from apps.parqueaderos.services import EspacioService, ParqueaderoService
from core.permissions import EsAdministrador


class ParqueaderoViewSet(viewsets.ViewSet):
    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]

    def list(self, request):
        parqueaderos = ParqueaderoService.listar_disponibles()
        return Response(ParqueaderoResumenDTO(parqueaderos, many=True).data)

    def create(self, request):
        dto = ParqueaderoCrearDTO(data=request.data)
        dto.is_valid(raise_exception=True)

        parqueadero = ParqueaderoService.crear(
            propietario=request.user, # Argumento actualizado a "propietario"
            direccion_datos=dto.to_direccion_datos(),
            ubicacion_datos=dto.to_ubicacion_datos(),
            **dto.to_parqueadero_datos(),
        )
        return Response(ParqueaderoDetalleDTO(parqueadero).data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        parqueadero = ParqueaderoService.obtener(pk)
        return Response(ParqueaderoDetalleDTO(parqueadero).data)

    def update(self, request, pk=None):
        parqueadero = ParqueaderoService.actualizar(pk, request.user, **request.data)
        return Response(ParqueaderoDetalleDTO(parqueadero).data)

    def partial_update(self, request, pk=None):
        parqueadero = ParqueaderoService.actualizar(pk, request.user, **request.data)
        return Response(ParqueaderoDetalleDTO(parqueadero).data)

    def destroy(self, request, pk=None):
        ParqueaderoService.eliminar(pk, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"], permission_classes=[EsAdministrador])
    def validar(self, request, pk=None):
        parqueadero = ParqueaderoService.validar(pk)
        return Response(ParqueaderoDetalleDTO(parqueadero).data)


class EspacioViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        parqueadero_id = request.query_params.get("parqueadero")
        if not parqueadero_id:
            return Response(
                {"detail": "Debes indicar ?parqueadero=<id>."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        espacios = EspacioService.listar_por_parqueadero(parqueadero_id)
        return Response(EspacioDTO(espacios, many=True).data)

    def create(self, request):
        # Utilizando el nuevo DTO para validar el numero_espacio
        dto = EspacioCrearDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        
        espacio = EspacioService.crear(
            parqueadero_id=dto.validated_data["parqueadero"],
            numero_espacio=dto.validated_data["numero_espacio"], # Pasando el nuevo parámetro
            usuario_auth=request.user
        )
        return Response(EspacioDTO(espacio).data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        espacio = EspacioRepository.obtener_por_id(pk)
        if espacio is None:
            return Response({"detail": "Espacio no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        return Response(EspacioDTO(espacio).data)

    def update(self, request, pk=None):
        dto = EspacioCambiarEstadoDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        espacio = EspacioService.cambiar_estado(pk, dto.validated_data["estado"], request.user)
        return Response(EspacioDTO(espacio).data)

    def partial_update(self, request, pk=None):
        dto = EspacioCambiarEstadoDTO(data=request.data, partial=True)
        dto.is_valid(raise_exception=True)
        espacio = EspacioService.cambiar_estado(pk, dto.validated_data["estado"], request.user)
        return Response(EspacioDTO(espacio).data)

    def destroy(self, request, pk=None):
        EspacioService.eliminar(pk, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)