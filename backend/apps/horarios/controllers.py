from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import HorarioAtencion

from .serializers_dto import HorarioAtencionDTO, HorarioAtencionCrearDTO
from apps.horarios.services import HorarioAtencionService

class HorarioAtencionViewSet(viewsets.ModelViewSet):
    queryset = HorarioAtencion.objects.all()
    serializer_class = HorarioAtencionDTO
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action == "list":
            # Un conductor debe poder ver los horarios sin autenticarse (RNF02)
            return [AllowAny()]
        return [IsAuthenticated()]    

    def get_queryset(self):
        queryset = super().get_queryset()
        parqueadero_id = self.request.query_params.get('parqueadero')
        
        if parqueadero_id:
            queryset = queryset.filter(parqueadero_id=parqueadero_id)
            
        return queryset

    def list(self, request):
        parqueadero_id = request.query_params.get("parqueadero")
        if not parqueadero_id:
            return Response(
                {"detail": "Debes indicar ?parqueadero=<id>."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        horarios = HorarioAtencionService.listar_por_parqueadero(parqueadero_id)
        return Response(HorarioAtencionDTO(horarios, many=True).data)

    def create(self, request):
        dto = HorarioAtencionCrearDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        horario = HorarioAtencionService.crear(
            dto.validated_data["parqueadero"],
            dto.validated_data["dia_semana"],
            dto.validated_data["hora_apertura"],
            dto.validated_data["hora_cierre"],
            request.user,
        )
        return Response(HorarioAtencionDTO(horario).data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        horario = HorarioAtencionService.obtener_verificado(pk, request.user)
        return Response(HorarioAtencionDTO(horario).data)

    def update(self, request, pk=None):
        horario = HorarioAtencionService.actualizar(pk, request.user, **request.data)
        return Response(HorarioAtencionDTO(horario).data)

    def partial_update(self, request, pk=None):
        horario = HorarioAtencionService.actualizar(pk, request.user, **request.data)
        return Response(HorarioAtencionDTO(horario).data)

    def destroy(self, request, pk=None):
        HorarioAtencionService.eliminar(pk, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)
