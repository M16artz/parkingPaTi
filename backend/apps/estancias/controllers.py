from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.estancias.serializers_dto import (
    EstanciaInicioDTO,
    EstanciaPaginaDTO,
    EstanciaRegistroDTO,
    EstanciaResponseDTO,
)
from apps.estancias.services import EstanciaService
from core.pagination import PaginacionManualMixin
from core.permissions import EsAdministrador, EsPropietario


class EstanciaInicioAPIView(APIView):
    permission_classes = [EsPropietario]
    serializer_class = EstanciaInicioDTO

    @extend_schema(
        operation_id="owner_stays_start",
        request=EstanciaInicioDTO,
        responses={201: EstanciaResponseDTO},
    )
    def post(self, request, espacio_id):
        dto = EstanciaInicioDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        estancia = EstanciaService.iniciar(request.user, espacio_id, **dto.validated_data)
        return Response(EstanciaResponseDTO(estancia).data, status=status.HTTP_201_CREATED)


class EstanciaActualAPIView(APIView):
    permission_classes = [EsPropietario]
    serializer_class = EstanciaResponseDTO

    @extend_schema(operation_id="owner_stays_current", responses=EstanciaResponseDTO)
    def get(self, request, espacio_id):
        estancia = EstanciaService.actual(request.user, espacio_id)
        return Response(EstanciaResponseDTO(estancia).data)


class EstanciaFinalizarAPIView(APIView):
    permission_classes = [EsPropietario]
    serializer_class = EstanciaResponseDTO

    @extend_schema(
        operation_id="owner_stays_finish",
        request=None,
        responses=EstanciaResponseDTO,
    )
    def post(self, request, espacio_id):
        estancia = EstanciaService.finalizar(request.user, espacio_id)
        return Response(EstanciaResponseDTO(estancia).data)


class EstanciaRegistroBaseAPIView(PaginacionManualMixin, APIView):
    serializer_class = EstanciaRegistroDTO

    def responder(self, request):
        estancias = EstanciaService.listar_registro(request.user)
        return self.paginar(
            request,
            estancias,
            EstanciaRegistroDTO,
            many_kwargs={"context": {"request": request}},
        )


class OwnerEstanciaRegistroAPIView(EstanciaRegistroBaseAPIView):
    permission_classes = [EsPropietario]

    @extend_schema(operation_id="owner_stays_history_list", responses=EstanciaPaginaDTO)
    def get(self, request):
        return self.responder(request)


class AdminEstanciaRegistroAPIView(EstanciaRegistroBaseAPIView):
    permission_classes = [EsAdministrador]

    @extend_schema(operation_id="admin_stays_history_list", responses=EstanciaPaginaDTO)
    def get(self, request):
        return self.responder(request)
