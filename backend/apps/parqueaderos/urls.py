"""Rutas de parqueaderos y espacios."""

from rest_framework.routers import DefaultRouter

from apps.parqueaderos.controllers import EspacioViewSet, ParqueaderoViewSet

router = DefaultRouter()

# /api/parqueaderos/ -> CRUD + /api/parqueaderos/{id}/validar/
router.register(r"parqueaderos", ParqueaderoViewSet, basename="parqueadero")

# /api/espacios/ -> CRUD de espacios dentro de un parqueadero
router.register(r"espacios", EspacioViewSet, basename="espacio")

urlpatterns = router.urls
