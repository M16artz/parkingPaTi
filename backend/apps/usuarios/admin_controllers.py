from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.usuarios.admin_serializers_dto import (
    AdminAccionResponseDTO,
    AdminCuentaDetalleDTO,
    AdminCuentaPaginaDTO,
    AdminCuentaQueryDTO,
    AdminCuentaResumenDTO,
    AdminDocumentoAccesoDTO,
    AdminRechazoDTO,
    AdminSolicitudDetalleDTO,
    AdminSolicitudPaginaDTO,
    AdminSolicitudQueryDTO,
    AdminSolicitudResumenDTO,
)
from apps.usuarios.admin_services import AdminService
from core.pagination import PaginacionManualMixin
from core.permissions import EsAdministrador


def _respuesta_accion(cuenta, detail, email_enviado=None):
    data = {
        "detail": detail,
        "cuenta_id": cuenta.id,
        "onboarding_estado": cuenta.onboarding_estado,
    }
    if email_enviado is not None:
        data["email_enviado"] = email_enviado
    return data


class AdminSolicitudListaAPIView(PaginacionManualMixin, APIView):
    permission_classes = [EsAdministrador]
    serializer_class = AdminSolicitudResumenDTO

    @extend_schema(
        operation_id="admin_applications_list",
        parameters=[AdminSolicitudQueryDTO],
        responses=AdminSolicitudPaginaDTO,
    )
    def get(self, request):
        query = AdminSolicitudQueryDTO(data=request.query_params)
        query.is_valid(raise_exception=True)
        solicitudes = AdminService.listar_solicitudes(
            request.user,
            estado=query.validated_data.get("onboarding_estado"),
            busqueda=query.validated_data.get("q", ""),
        )
        return self.paginar(request, solicitudes, AdminSolicitudResumenDTO)


class AdminSolicitudDetalleAPIView(APIView):
    permission_classes = [EsAdministrador]
    serializer_class = AdminSolicitudDetalleDTO

    @extend_schema(operation_id="admin_applications_retrieve")
    def get(self, request, cuenta_id):
        cuenta = AdminService.obtener_solicitud(request.user, cuenta_id)
        return Response(AdminSolicitudDetalleDTO(cuenta).data)


class AdminSolicitudDocumentoAPIView(APIView):
    permission_classes = [EsAdministrador]
    serializer_class = AdminDocumentoAccesoDTO

    @extend_schema(operation_id="admin_applications_document_retrieve")
    def get(self, request, cuenta_id):
        url = AdminService.acceso_documento(request.user, cuenta_id)
        return Response({"url": url})


class AdminSolicitudAprobarAPIView(APIView):
    permission_classes = [EsAdministrador]
    serializer_class = AdminAccionResponseDTO

    @extend_schema(
        operation_id="admin_applications_approve",
        request=None,
        responses=AdminAccionResponseDTO,
    )
    def post(self, request, cuenta_id):
        cuenta, email_enviado = AdminService.aprobar(request.user, cuenta_id)
        return Response(
            _respuesta_accion(cuenta, "Solicitud aprobada.", email_enviado),
            status=status.HTTP_200_OK,
        )


class AdminSolicitudRechazarAPIView(APIView):
    permission_classes = [EsAdministrador]
    serializer_class = AdminRechazoDTO

    @extend_schema(
        operation_id="admin_applications_reject",
        request=AdminRechazoDTO,
        responses=AdminAccionResponseDTO,
    )
    def post(self, request, cuenta_id):
        dto = AdminRechazoDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        cuenta, email_enviado = AdminService.rechazar(
            request.user,
            cuenta_id,
            dto.validated_data["motivo"],
        )
        return Response(
            _respuesta_accion(cuenta, "Solicitud rechazada.", email_enviado),
            status=status.HTTP_200_OK,
        )


class AdminCuentaListaAPIView(PaginacionManualMixin, APIView):
    permission_classes = [EsAdministrador]
    serializer_class = AdminCuentaResumenDTO

    @extend_schema(
        operation_id="admin_accounts_list",
        parameters=[AdminCuentaQueryDTO],
        responses=AdminCuentaPaginaDTO,
    )
    def get(self, request):
        query = AdminCuentaQueryDTO(data=request.query_params)
        query.is_valid(raise_exception=True)
        cuentas = AdminService.listar_cuentas(
            request.user,
            estado=query.validated_data.get("onboarding_estado"),
            activo=query.validated_data.get("activo"),
            busqueda=query.validated_data.get("q", ""),
        )
        return self.paginar(request, cuentas, AdminCuentaResumenDTO)


class AdminCuentaDetalleAPIView(APIView):
    permission_classes = [EsAdministrador]
    serializer_class = AdminCuentaDetalleDTO

    @extend_schema(operation_id="admin_accounts_retrieve")
    def get(self, request, cuenta_id):
        cuenta = AdminService.obtener_cuenta(request.user, cuenta_id)
        return Response(AdminCuentaDetalleDTO(cuenta).data)


class AdminCuentaDeshabilitarAPIView(APIView):
    permission_classes = [EsAdministrador]
    serializer_class = AdminAccionResponseDTO

    @extend_schema(
        operation_id="admin_accounts_disable",
        request=None,
        responses=AdminAccionResponseDTO,
    )
    def post(self, request, cuenta_id):
        cuenta = AdminService.deshabilitar(request.user, cuenta_id)
        return Response(_respuesta_accion(cuenta, "Cuenta deshabilitada."))
