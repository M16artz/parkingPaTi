"""Rutas de horarios."""

from rest_framework.routers import DefaultRouter

from apps.horarios.controllers import HorarioAtencionViewSet

router = DefaultRouter()
router.register(r"horarios", HorarioAtencionViewSet, basename="horario")

urlpatterns = router.urls
