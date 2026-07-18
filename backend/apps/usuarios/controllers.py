"""
Capa de presentacion (controladores REST) para la app usuarios.
"""

from django.conf import settings
from drf_spectacular.utils import extend_schema
from rest_framework import viewsets, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from apps.usuarios.serializers_dto import (
    AdminCrearCuentaDTO,
    CuentaActualizarDTO,
    CuentaDetalleDTO,
    CuentaResumenDTO,
    CookieTokenRefreshResponseDTO,
    CustomTokenObtainPairSerializer,
    EmptyDTO,
    MensajeDTO,
    ReenviarVerificacionDTO,
    RegistroDTO,
    RegistroCompletoDTO,
    RegistroResponseDTO,
    VerificarCorreoDTO,
    VerificarCorreoResponseDTO,
)
from apps.usuarios.services import CuentaService, RegistroService, SesionService, VerificacionCorreoService
from core.pagination import PaginacionManualMixin
from core.permissions import EsAdministrador, es_administrador


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        refresh = response.data.pop("refresh_cookie", None)
        if refresh:
            _set_refresh_cookie(response, refresh)
        return response


def _set_refresh_cookie(response, refresh):
    response.set_cookie(
        settings.JWT_REFRESH_COOKIE_NAME,
        refresh,
        max_age=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds(),
        httponly=True,
        secure=settings.JWT_COOKIE_SECURE,
        samesite=settings.JWT_COOKIE_SAMESITE,
        path=settings.JWT_COOKIE_PATH,
    )


class CookieTokenRefreshAPIView(APIView):
    permission_classes = [AllowAny]
    serializer_class = CookieTokenRefreshResponseDTO
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "token_refresh"

    @extend_schema(request=None, responses=CookieTokenRefreshResponseDTO)
    def post(self, request):
        refresh = request.COOKIES.get(settings.JWT_REFRESH_COOKIE_NAME)
        if not refresh:
            return Response({"detail": "La sesion no es valida."}, status=status.HTTP_401_UNAUTHORIZED)
        data = SesionService.refrescar(refresh)
        rotated = data.pop("refresh", None)
        response = Response(data)
        if rotated:
            _set_refresh_cookie(response, rotated)
        return response


class LogoutAPIView(APIView):
    permission_classes = [AllowAny]
    serializer_class = EmptyDTO

    @extend_schema(request=None, responses={204: None})
    def post(self, request):
        refresh = request.COOKIES.get(settings.JWT_REFRESH_COOKIE_NAME)
        SesionService.cerrar(refresh)
        response = Response(status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie(
            settings.JWT_REFRESH_COOKIE_NAME,
            path=settings.JWT_COOKIE_PATH,
            samesite=settings.JWT_COOKIE_SAMESITE,
        )
        return response


class RegistroAPIView(APIView):
    """POST /api/auth/register/ - registro publico. Siempre crea PROPIETARIO."""

    permission_classes = [AllowAny]
    serializer_class = RegistroDTO
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "register"

    def post(self, request):
        dto = RegistroDTO(data=request.data)
        dto.is_valid(raise_exception=True)

        cuenta, email_enviado = RegistroService.registrar_cuenta(
            datos_persona=dto.to_datos_persona(),
            datos_cuenta=dto.to_datos_cuenta(),
            # nombre_rol NO se toma del request (ver hallazgo 2.2): siempre
            # PROPIETARIO en el registro publico.
        )

        return Response(
            {
                "cuenta": CuentaDetalleDTO(cuenta).data,
                "email_enviado": email_enviado,
                "detail": "Cuenta creada. Revisa tu correo para verificarla.",
            },
            status=status.HTTP_201_CREATED,
        )


class RegistroCompletoAPIView(APIView):
    """Crea cuenta, parqueadero y documento al finalizar el stepper publico."""

    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = RegistroCompletoDTO
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "register"

    @extend_schema(request=RegistroCompletoDTO, responses={201: RegistroResponseDTO})
    def post(self, request):
        dto = RegistroCompletoDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        cuenta, email_enviado = RegistroService.registrar_completo(
            datos_persona=dto.to_datos_persona(),
            datos_cuenta=dto.to_datos_cuenta(),
            datos_parqueadero=dto.to_parqueadero_datos(),
            datos_direccion=dto.to_direccion_datos(),
            datos_ubicacion=dto.to_ubicacion_datos(),
            archivo=dto.validated_data["archivo"],
        )
        return Response(
            {
                "cuenta": CuentaDetalleDTO(cuenta).data,
                "email_enviado": email_enviado,
                "detail": "Registro completado. Revisa tu correo para verificar la cuenta.",
            },
            status=status.HTTP_201_CREATED,
        )


class VerificarCorreoAPIView(APIView):
    permission_classes = [AllowAny]
    serializer_class = VerificarCorreoDTO
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "verify_email"

    @extend_schema(request=RegistroDTO, responses={201: RegistroResponseDTO})
    @extend_schema(request=VerificarCorreoDTO, responses=VerificarCorreoResponseDTO)
    def post(self, request):
        dto = VerificarCorreoDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        cuenta = VerificacionCorreoService.verificar(dto.validated_data["token"])
        return Response({"detail": "Correo verificado.", "onboarding_estado": cuenta.onboarding_estado})


class ReenviarVerificacionAPIView(APIView):
    permission_classes = [AllowAny]
    serializer_class = ReenviarVerificacionDTO
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "resend_verification"

    @extend_schema(request=ReenviarVerificacionDTO, responses={202: MensajeDTO})
    def post(self, request):
        dto = ReenviarVerificacionDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        VerificacionCorreoService.reenviar(dto.validated_data["correo"])
        return Response(
            {"detail": "Si la cuenta requiere verificacion, se enviara un nuevo correo."},
            status=status.HTTP_202_ACCEPTED,
        )


class MeAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CuentaDetalleDTO

    def get(self, request):
        return Response(CuentaDetalleDTO(CuentaService.obtener_cuenta(request.user.id)).data)


class AdminCrearCuentaAPIView(APIView):
    """
    POST /api/auth/admin/crear-cuenta/ - unico lugar donde se puede elegir
    el rol de la cuenta nueva (incluido ADMINISTRADOR). Protegido: solo
    administradores autenticados pueden invocarlo.
    """

    permission_classes = [EsAdministrador]
    serializer_class = AdminCrearCuentaDTO

    def post(self, request):
        dto = AdminCrearCuentaDTO(data=request.data)
        dto.is_valid(raise_exception=True)

        cuenta, _ = RegistroService.registrar_cuenta(
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
    serializer_class = CuentaDetalleDTO
    lookup_value_regex = r"\d+"

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
