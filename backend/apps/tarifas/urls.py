"""Rutas de tarifas, incrementos y descuentos."""

from rest_framework.routers import DefaultRouter

from apps.tarifas.controllers import (
    DescuentoTarifaViewSet,
    EstrategiaTarifaViewSet,
    IncrementoTarifaViewSet,
)

router = DefaultRouter()

# /api/tarifas/ -> Maneja la tarifa normal
router.register(r"tarifas", EstrategiaTarifaViewSet, basename="tarifa")

# /api/incrementos/ -> Maneja las tarifas con incremento
router.register(r"incrementos", IncrementoTarifaViewSet, basename="incremento")

# /api/descuentos/ -> Maneja las tarifas con descuento
router.register(r"descuentos", DescuentoTarifaViewSet, basename="descuento")

urlpatterns = router.urls