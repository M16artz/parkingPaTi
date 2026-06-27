"""
Rutas de la app usuarios: autenticacion + CRUD de cuentas.
Se registran bajo /api/auth/... y /api/cuentas/... en config/urls.py.
"""

from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from apps.usuarios.controllers import (
    CuentaViewSet,
    CustomTokenObtainPairView,
    RegistroAPIView,
)

router = DefaultRouter()
router.register(r"cuentas", CuentaViewSet, basename="cuenta")

auth_urlpatterns = [
    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("register/", RegistroAPIView.as_view(), name="auth_register"),
]

urlpatterns = router.urls
