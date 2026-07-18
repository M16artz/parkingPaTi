from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.parqueaderos.configuration_serializers_dto import (
    ConfiguracionFinalDTO,
    ConfiguracionFinalResponseDTO,
    EspacioConfiguracionResponseDTO,
    EspacioEditarDTO,
    EspaciosLoteDTO,
    EstadoOperativoPropietarioDTO,
)
from apps.parqueaderos.configuration_services import (
    ConfiguracionFinalService,
    GestionEspacioService,
    EstadoOperativoPropietarioService,
)
from core.permissions import EsPropietario


class ConfiguracionFinalAPIView(APIView):
    permission_classes = [EsPropietario]
    serializer_class = ConfiguracionFinalDTO

    @extend_schema(
        operation_id="owner_configuration_retrieve",
        responses=ConfiguracionFinalResponseDTO,
    )
    def get(self, request):
        return Response(ConfiguracionFinalResponseDTO(ConfiguracionFinalService.obtener(request.user)).data)

    @extend_schema(
        operation_id="owner_configuration_update",
        request=ConfiguracionFinalDTO,
        responses=ConfiguracionFinalResponseDTO,
    )
    def put(self, request):
        dto = ConfiguracionFinalDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        resultado = ConfiguracionFinalService.configurar(request.user, **dto.validated_data)
        return Response(ConfiguracionFinalResponseDTO(resultado).data)


class EstadoOperativoPropietarioAPIView(APIView):
    permission_classes = [EsPropietario]
    serializer_class = EstadoOperativoPropietarioDTO

    @extend_schema(
        operation_id="owner_operational_status_update",
        request=EstadoOperativoPropietarioDTO,
        responses=ConfiguracionFinalResponseDTO,
    )
    def patch(self, request):
        dto = EstadoOperativoPropietarioDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        resultado = EstadoOperativoPropietarioService.cambiar(
            request.user,
            dto.validated_data["estado"],
        )
        return Response(ConfiguracionFinalResponseDTO(resultado).data)


class EspaciosLoteAPIView(APIView):
    permission_classes = [EsPropietario]
    serializer_class = EspaciosLoteDTO

    @extend_schema(
        operation_id="owner_spaces_bulk_create",
        request=EspaciosLoteDTO,
        responses={201: EspacioConfiguracionResponseDTO(many=True)},
    )
    def post(self, request):
        dto = EspaciosLoteDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        espacios = GestionEspacioService.crear_lote(request.user, dto.validated_data["cantidad"])
        return Response(
            EspacioConfiguracionResponseDTO(espacios, many=True).data,
            status=status.HTTP_201_CREATED,
        )


class EspacioConfiguracionAPIView(APIView):
    permission_classes = [EsPropietario]
    serializer_class = EspacioEditarDTO

    @extend_schema(
        operation_id="owner_spaces_partial_update",
        request=EspacioEditarDTO,
        responses=EspacioConfiguracionResponseDTO,
    )
    def patch(self, request, espacio_id):
        dto = EspacioEditarDTO(data=request.data, partial=True)
        dto.is_valid(raise_exception=True)
        espacio = GestionEspacioService.editar(request.user, espacio_id, **dto.validated_data)
        return Response(EspacioConfiguracionResponseDTO(espacio).data)

    @extend_schema(operation_id="owner_spaces_destroy", responses={204: None})
    def delete(self, request, espacio_id):
        GestionEspacioService.eliminar(request.user, espacio_id)
        return Response(status=status.HTTP_204_NO_CONTENT)


class EspacioReactivarAPIView(APIView):
    permission_classes = [EsPropietario]
    serializer_class = EspacioConfiguracionResponseDTO

    @extend_schema(
        operation_id="owner_spaces_reactivate",
        request=None,
        responses=EspacioConfiguracionResponseDTO,
    )
    def post(self, request, espacio_id):
        espacio = GestionEspacioService.reactivar(request.user, espacio_id)
        return Response(EspacioConfiguracionResponseDTO(espacio).data)
