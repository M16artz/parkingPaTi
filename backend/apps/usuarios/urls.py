"""
Rutas de la app usuarios: autenticacion + CRUD de cuentas.
Se registran bajo /api/auth/... y /api/cuentas/... en config/urls.py.
"""

from django.urls import path
from rest_framework.routers import DefaultRouter
from apps.usuarios.controllers import (
    AdminCrearCuentaAPIView,
    CookieTokenRefreshAPIView,
    CuentaViewSet,
    CustomTokenObtainPairView,
    DisponibilidadCorreoAPIView,
    LogoutAPIView,
    MeAPIView,
    ReenviarVerificacionAPIView,
    RegistroAPIView,
    RegistroCompletoAPIView,
    VerificarCorreoAPIView,
)
from apps.usuarios.onboarding_controllers import (
    DatosInicialesParqueaderoAPIView,
    DocumentoOnboardingAPIView,
    EnviarSolicitudAPIView,
    OnboardingEstadoAPIView,
)
from apps.usuarios.admin_controllers import (
    AdminCuentaDeshabilitarAPIView,
    AdminCuentaDetalleAPIView,
    AdminCuentaListaAPIView,
    AdminCuentaRehabilitarAPIView,
    AdminSolicitudAprobarAPIView,
    AdminSolicitudDetalleAPIView,
    AdminSolicitudDocumentoAPIView,
    AdminSolicitudListaAPIView,
    AdminSolicitudRechazarAPIView,
)

router = DefaultRouter()
router.register(r"cuentas", CuentaViewSet, basename="cuenta")

auth_urlpatterns = [
    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", CookieTokenRefreshAPIView.as_view(), name="token_refresh"),
    path("logout/", LogoutAPIView.as_view(), name="auth_logout"),
    path("me/", MeAPIView.as_view(), name="auth_me"),
    path("register/", RegistroAPIView.as_view(), name="auth_register"),
    path("register/email-availability/", DisponibilidadCorreoAPIView.as_view(), name="auth_email_availability"),
    path("register/complete/", RegistroCompletoAPIView.as_view(), name="auth_register_complete"),
    path("verify-email/", VerificarCorreoAPIView.as_view(), name="auth_verify_email"),
    path("resend-verification/", ReenviarVerificacionAPIView.as_view(), name="auth_resend_verification"),
    path("admin/crear-cuenta/", AdminCrearCuentaAPIView.as_view(), name="auth_admin_crear_cuenta"),
]

urlpatterns = router.urls

owner_urlpatterns = [
    path("onboarding-status/", OnboardingEstadoAPIView.as_view(), name="owner_onboarding_status"),
    path("parking/initial-data/", DatosInicialesParqueaderoAPIView.as_view(), name="owner_parking_initial"),
    path("document/", DocumentoOnboardingAPIView.as_view(), name="owner_document"),
    path("application/submit/", EnviarSolicitudAPIView.as_view(), name="owner_application_submit"),
]

admin_urlpatterns = [
    path("applications/", AdminSolicitudListaAPIView.as_view(), name="admin_application_list"),
    path(
        "applications/<int:cuenta_id>/",
        AdminSolicitudDetalleAPIView.as_view(),
        name="admin_application_detail",
    ),
    path(
        "applications/<int:cuenta_id>/document/",
        AdminSolicitudDocumentoAPIView.as_view(),
        name="admin_application_document",
    ),
    path(
        "applications/<int:cuenta_id>/approve/",
        AdminSolicitudAprobarAPIView.as_view(),
        name="admin_application_approve",
    ),
    path(
        "applications/<int:cuenta_id>/reject/",
        AdminSolicitudRechazarAPIView.as_view(),
        name="admin_application_reject",
    ),
    path("accounts/", AdminCuentaListaAPIView.as_view(), name="admin_account_list"),
    path(
        "accounts/<int:cuenta_id>/",
        AdminCuentaDetalleAPIView.as_view(),
        name="admin_account_detail",
    ),
    path(
        "accounts/<int:cuenta_id>/disable/",
        AdminCuentaDeshabilitarAPIView.as_view(),
        name="admin_account_disable",
    ),
    path(
        "accounts/<int:cuenta_id>/enable/",
        AdminCuentaRehabilitarAPIView.as_view(),
        name="admin_account_enable",
    ),
]
