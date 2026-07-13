from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.tarifas.serializers_dto import (
    CategoriaTarifaActualizarDTO,
    CategoriaTarifaCrearDTO,
    CategoriaTarifaDTO,
)
from apps.tarifas.services import CategoriaTarifaService
from core.pagination import PaginacionManualMixin


class CategoriaTarifaViewSet(PaginacionManualMixin, viewsets.ViewSet):
    serializer_class = CategoriaTarifaDTO
    lookup_value_regex = r"\d+"

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]

    def list(self, request):
        parqueadero_id = request.query_params.get("parqueadero")
        return self.paginar(request, CategoriaTarifaService.listar(parqueadero_id), CategoriaTarifaDTO)

    def create(self, request):
        dto = CategoriaTarifaCrearDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        datos = dict(dto.validated_data)
        parqueadero_id = datos.pop("parqueadero")
        tarifa = CategoriaTarifaService.crear(parqueadero_id, request.user, **datos)
        return Response(CategoriaTarifaDTO(tarifa).data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        return Response(CategoriaTarifaDTO(CategoriaTarifaService.obtener(pk)).data)

    def update(self, request, pk=None):
        dto = CategoriaTarifaActualizarDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        tarifa = CategoriaTarifaService.actualizar(pk, request.user, **dto.validated_data)
        return Response(CategoriaTarifaDTO(tarifa).data)

    def partial_update(self, request, pk=None):
        dto = CategoriaTarifaActualizarDTO(data=request.data, partial=True)
        dto.is_valid(raise_exception=True)
        tarifa = CategoriaTarifaService.actualizar(pk, request.user, **dto.validated_data)
        return Response(CategoriaTarifaDTO(tarifa).data)

    def destroy(self, request, pk=None):
        CategoriaTarifaService.eliminar(pk, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)
