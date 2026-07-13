"""Rutas de parqueaderos y espacios."""

from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.parqueaderos.configuration_controllers import (
    ConfiguracionFinalAPIView,
    EspacioConfiguracionAPIView,
    EspacioReactivarAPIView,
    EspaciosLoteAPIView,
)
from apps.parqueaderos.controllers import EspacioViewSet, ParqueaderoViewSet
from apps.parqueaderos.public_controllers import (
    PublicParkingDetailAPIView,
    PublicParkingListAPIView,
)

router = DefaultRouter()

# /api/parqueaderos/ -> CRUD + /api/parqueaderos/{id}/validar/
router.register(r"parqueaderos", ParqueaderoViewSet, basename="parqueadero")

# /api/espacios/ -> CRUD de espacios dentro de un parqueadero
router.register(r"espacios", EspacioViewSet, basename="espacio")

urlpatterns = router.urls

owner_configuration_urlpatterns = [
    path("configuration/", ConfiguracionFinalAPIView.as_view(), name="owner_configuration"),
    path("spaces/bulk/", EspaciosLoteAPIView.as_view(), name="owner_spaces_bulk"),
    path(
        "spaces/<int:espacio_id>/",
        EspacioConfiguracionAPIView.as_view(),
        name="owner_space_detail",
    ),
    path(
        "spaces/<int:espacio_id>/reactivate/",
        EspacioReactivarAPIView.as_view(),
        name="owner_space_reactivate",
    ),
]

public_urlpatterns = [
    path("parkings/", PublicParkingListAPIView.as_view(), name="public_parking_list"),
    path(
        "parkings/<int:parqueadero_id>/",
        PublicParkingDetailAPIView.as_view(),
        name="public_parking_detail",
    ),
]
