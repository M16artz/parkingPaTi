from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from apps.horarios.serializers_dto import (
    HorarioAtencionActualizarDTO,
    HorarioAtencionCrearDTO,
    HorarioAtencionDTO,
)
from apps.parqueaderos.services import ParqueaderoService
from apps.horarios.services import HorarioAtencionService


class HorarioAtencionViewSet(viewsets.ViewSet):
    """
    Se usa un viewsets.ViewSet "plano" (no ModelViewSet) porque, igual que
    en el resto del proyecto, toda la logica de negocio y de permisos vive
    en HorarioAtencionService, no en el viewset. Mezclar ModelViewSet
    (queryset/serializer_class implicitos) con overrides manuales de todos
    los metodos, como estaba antes, era codigo redundante y confuso.
    """

    serializer_class = HorarioAtencionDTO
    lookup_value_regex = r"\d+"

    def get_permissions(self):
        if self.action == "list":
            # Un conductor debe poder ver los horarios sin autenticarse (RNF02)
            return [AllowAny()]
        return [IsAuthenticated()]

    def list(self, request):
        parqueadero_id = request.query_params.get("parqueadero")
        if not parqueadero_id:
            return Response(
                {"detail": "Debes indicar ?parqueadero=<id>."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # Verificar existencia
        try:
            ParqueaderoService.obtener(parqueadero_id)
        except ValidationError:
            return Response({"detail": "Parqueadero no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        
        horarios = HorarioAtencionService.listar_por_parqueadero(parqueadero_id)
        return Response(HorarioAtencionDTO(horarios, many=True).data)

    def create(self, request):
        dto = HorarioAtencionCrearDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        horario = HorarioAtencionService.crear(
            dto.validated_data["parqueadero"],
            dto.validated_data["dia"],
            dto.validated_data["hora_apertura"],
            dto.validated_data["hora_cierre"],
            request.user,
        )
        return Response(HorarioAtencionDTO(horario).data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        horario = HorarioAtencionService.obtener_verificado(pk, request.user)
        return Response(HorarioAtencionDTO(horario).data)

    def update(self, request, pk=None):
        dto = HorarioAtencionActualizarDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        horario = HorarioAtencionService.actualizar(pk, request.user, **dto.validated_data)
        return Response(HorarioAtencionDTO(horario).data)

    def partial_update(self, request, pk=None):
        dto = HorarioAtencionActualizarDTO(data=request.data, partial=True)
        dto.is_valid(raise_exception=True)
        horario = HorarioAtencionService.actualizar(pk, request.user, **dto.validated_data)
        return Response(HorarioAtencionDTO(horario).data)

    def destroy(self, request, pk=None):
        HorarioAtencionService.eliminar(pk, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)
