"""
Capa de presentacion (controladores REST) para la app usuarios.
"""

from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from apps.usuarios.serializers_dto import (
    CuentaActualizarDTO,
    CuentaDetalleDTO,
    CuentaResumenDTO,
    CustomTokenObtainPairSerializer,
    RegistroDTO,
)
from apps.usuarios.services import CuentaService, RegistroService
from core.permissions import EsAdministrador


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]


class RegistroAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        dto = RegistroDTO(data=request.data)
        dto.is_valid(raise_exception=True)

        cuenta = RegistroService.registrar_cuenta(
            datos_persona=dto.to_datos_persona(),
            datos_cuenta=dto.to_datos_cuenta(),
            nombre_rol=dto.validated_data.get("rol"),
        )

        return Response(
            CuentaDetalleDTO(cuenta).data,
            status=status.HTTP_201_CREATED,
        )


class CuentaViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ("list", "destroy"):
            return [EsAdministrador()]
        return [IsAuthenticated()]

    def list(self, request):
        cuentas = CuentaService.listar_cuentas()
        return Response(CuentaResumenDTO(cuentas, many=True).data)

    def create(self, request):
        return Response(
            {"detail": "Usa POST /api/auth/register/ para crear una cuenta."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def retrieve(self, request, pk=None):
        cuenta = CuentaService.obtener_cuenta(pk)
        return Response(CuentaDetalleDTO(cuenta).data)

    def update(self, request, pk=None):
        dto = CuentaActualizarDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        cuenta = CuentaService.actualizar_cuenta(pk, **dto.validated_data)
        return Response(CuentaDetalleDTO(cuenta).data)

    def partial_update(self, request, pk=None):
        dto = CuentaActualizarDTO(data=request.data, partial=True)
        dto.is_valid(raise_exception=True)
        cuenta = CuentaService.actualizar_cuenta(pk, **dto.validated_data)
        return Response(CuentaDetalleDTO(cuenta).data)

    def destroy(self, request, pk=None):
        CuentaService.eliminar_cuenta(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
