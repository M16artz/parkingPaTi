"""
Capa de presentacion (controladores REST) para la app usuarios.
"""

from rest_framework import viewsets, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from apps.usuarios.serializers_dto import (
    AdminCrearCuentaDTO,
    CuentaActualizarDTO,
    CuentaDetalleDTO,
    CuentaResumenDTO,
    CustomTokenObtainPairSerializer,
    RegistroDTO,
)
from apps.usuarios.services import CuentaService, RegistroService
from core.pagination import PaginacionManualMixin
from core.permissions import EsAdministrador, es_administrador


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]


class RegistroAPIView(APIView):
    """POST /api/auth/register/ - registro publico. Siempre crea PROPIETARIO."""

    permission_classes = [AllowAny]

    def post(self, request):
        dto = RegistroDTO(data=request.data)
        dto.is_valid(raise_exception=True)

        cuenta = RegistroService.registrar_cuenta(
            datos_persona=dto.to_datos_persona(),
            datos_cuenta=dto.to_datos_cuenta(),
            # nombre_rol NO se toma del request (ver hallazgo 2.2): siempre
            # PROPIETARIO en el registro publico.
        )

        return Response(
            CuentaDetalleDTO(cuenta).data,
            status=status.HTTP_201_CREATED,
        )


class AdminCrearCuentaAPIView(APIView):
    """
    POST /api/auth/admin/crear-cuenta/ - unico lugar donde se puede elegir
    el rol de la cuenta nueva (incluido ADMINISTRADOR). Protegido: solo
    administradores autenticados pueden invocarlo.
    """

    permission_classes = [EsAdministrador]

    def post(self, request):
        dto = AdminCrearCuentaDTO(data=request.data)
        dto.is_valid(raise_exception=True)

        cuenta = RegistroService.registrar_cuenta(
            datos_persona=dto.to_datos_persona(),
            datos_cuenta=dto.to_datos_cuenta(),
            nombre_rol=dto.validated_data["rol"],
        )

        return Response(
            CuentaDetalleDTO(cuenta).data,
            status=status.HTTP_201_CREATED,
        )


class CuentaViewSet(PaginacionManualMixin, viewsets.ViewSet):
    """
    IMPORTANTE (hallazgo 2.1 de la auditoria): este es un viewsets.ViewSet
    "plano", no un GenericViewSet, por lo que DRF NO invoca automaticamente
    check_object_permissions(). Por eso cada accion que opera sobre un
    objeto especifico valida explicitamente la propiedad del recurso con
    `_verificar_acceso_propio`, ademas de exigir autenticacion.
    """

    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ("list", "destroy"):
            return [EsAdministrador()]
        return [IsAuthenticated()]

    @staticmethod
    def _verificar_acceso_propio(request, cuenta_id):
        """Un usuario solo puede ver/editar su propia cuenta; un
        administrador puede ver/editar cualquiera."""
        if es_administrador(request.user):
            return
        if str(request.user.id) != str(cuenta_id):
            raise PermissionDenied("No tienes permiso para acceder a esta cuenta.")

    def list(self, request):
        cuentas = CuentaService.listar_cuentas()
        return self.paginar(request, cuentas, CuentaResumenDTO)

    def create(self, request):
        return Response(
            {"detail": "Usa POST /api/auth/register/ para crear una cuenta."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def retrieve(self, request, pk=None):
        self._verificar_acceso_propio(request, pk)
        cuenta = CuentaService.obtener_cuenta(pk)
        return Response(CuentaDetalleDTO(cuenta).data)

    def update(self, request, pk=None):
        self._verificar_acceso_propio(request, pk)
        dto = CuentaActualizarDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        cuenta = CuentaService.actualizar_cuenta(pk, **dto.validated_data)
        return Response(CuentaDetalleDTO(cuenta).data)

    def partial_update(self, request, pk=None):
        self._verificar_acceso_propio(request, pk)
        dto = CuentaActualizarDTO(data=request.data, partial=True)
        dto.is_valid(raise_exception=True)
        cuenta = CuentaService.actualizar_cuenta(pk, **dto.validated_data)
        return Response(CuentaDetalleDTO(cuenta).data)

    def destroy(self, request, pk=None):
        if str(request.user.id) == str(pk):
            raise PermissionDenied("No puedes eliminar tu propia cuenta.")
        CuentaService.eliminar_cuenta(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
