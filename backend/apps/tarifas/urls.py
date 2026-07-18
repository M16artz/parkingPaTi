from rest_framework.routers import DefaultRouter

from apps.tarifas.controllers import CategoriaTarifaViewSet

router = DefaultRouter()
router.register(r"tarifas", CategoriaTarifaViewSet, basename="tarifa")

urlpatterns = router.urls
