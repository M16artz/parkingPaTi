from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.parqueaderos.models import EstadoHabilitacion
from apps.parqueaderos.serializers_dto import (
    EspacioCambiarEstadoDTO,
    EspacioCrearDTO,
    EspacioDTO,
    ParqueaderoActualizarDTO,
    ParqueaderoCrearDTO,
    ParqueaderoDetalleDTO,
    ParqueaderoResumenDTO,
)
from apps.parqueaderos.services import EspacioService, ParqueaderoService
from core.pagination import PaginacionManualMixin
from core.permissions import EsAdministrador, es_administrador


class ParqueaderoViewSet(PaginacionManualMixin, viewsets.ViewSet):
    serializer_class = ParqueaderoDetalleDTO
    lookup_value_regex = r"\d+"

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]

    def list(self, request):
        return self.paginar(request, ParqueaderoService.listar_disponibles(), ParqueaderoResumenDTO)

    def create(self, request):
        dto = ParqueaderoCrearDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        parqueadero = ParqueaderoService.crear(
            propietario=request.user,
            direccion_datos=dto.to_direccion_datos(),
            ubicacion_datos=dto.to_ubicacion_datos(),
            **dto.to_parqueadero_datos(),
        )
        return Response(ParqueaderoDetalleDTO(parqueadero).data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        parqueadero = ParqueaderoService.obtener(pk)
        es_publico = parqueadero.habilitacion_estado == EstadoHabilitacion.APROBADO
        tiene_acceso = request.user.is_authenticated and (
            es_administrador(request.user) or parqueadero.propietario_id == request.user.id
        )
        if not es_publico and not tiene_acceso:
            return Response({"detail": "No encontrado."}, status=status.HTTP_404_NOT_FOUND)
        return Response(ParqueaderoDetalleDTO(parqueadero).data)

    def update(self, request, pk=None):
        dto = ParqueaderoActualizarDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        parqueadero = ParqueaderoService.actualizar(pk, request.user, **dto.validated_data)
        return Response(ParqueaderoDetalleDTO(parqueadero).data)

    def partial_update(self, request, pk=None):
        dto = ParqueaderoActualizarDTO(data=request.data, partial=True)
        dto.is_valid(raise_exception=True)
        parqueadero = ParqueaderoService.actualizar(pk, request.user, **dto.validated_data)
        return Response(ParqueaderoDetalleDTO(parqueadero).data)

    def destroy(self, request, pk=None):
        ParqueaderoService.eliminar(pk, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"], permission_classes=[EsAdministrador])
    def validar(self, request, pk=None):
        parqueadero = ParqueaderoService.validar(pk)
        return Response(ParqueaderoDetalleDTO(parqueadero).data)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def mios(self, request):
        return Response(ParqueaderoDetalleDTO(ParqueaderoService.listar_propios(request.user), many=True).data)


class EspacioViewSet(PaginacionManualMixin, viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = EspacioDTO
    lookup_value_regex = r"\d+"

    def list(self, request):
        parqueadero_id = request.query_params.get("parqueadero")
        if not parqueadero_id:
            return Response({"detail": "Debes indicar ?parqueadero=<id>."}, status=status.HTTP_400_BAD_REQUEST)
        parqueadero = ParqueaderoService.obtener(parqueadero_id)
        ParqueaderoService._verificar_propietario(parqueadero, request.user)
        return self.paginar(request, EspacioService.listar_por_parqueadero(parqueadero_id), EspacioDTO)

    def create(self, request):
        dto = EspacioCrearDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        espacio = EspacioService.crear(
            parqueadero_id=dto.validated_data["parqueadero"],
            nombre=dto.validated_data["nombre"],
            cuenta_solicitante=request.user,
        )
        return Response(EspacioDTO(espacio).data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        espacio = EspacioService.obtener(pk)
        ParqueaderoService._verificar_propietario(espacio.parqueadero, request.user)
        return Response(EspacioDTO(espacio).data)

    def update(self, request, pk=None):
        dto = EspacioCambiarEstadoDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        espacio = EspacioService.actualizar(pk, request.user, **dto.validated_data)
        return Response(EspacioDTO(espacio).data)

    def partial_update(self, request, pk=None):
        dto = EspacioCambiarEstadoDTO(data=request.data, partial=True)
        dto.is_valid(raise_exception=True)
        espacio = EspacioService.actualizar(pk, request.user, **dto.validated_data)
        return Response(EspacioDTO(espacio).data)

    def destroy(self, request, pk=None):
        EspacioService.eliminar(pk, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)
