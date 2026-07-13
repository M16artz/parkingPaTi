from django.urls import path

from apps.estancias.controllers import (
    AdminEstanciaRegistroAPIView,
    EstanciaActualAPIView,
    EstanciaFinalizarAPIView,
    EstanciaInicioAPIView,
    OwnerEstanciaRegistroAPIView,
)


owner_urlpatterns = [
    path(
        "spaces/<int:espacio_id>/stays/start/",
        EstanciaInicioAPIView.as_view(),
        name="owner_stay_start",
    ),
    path(
        "spaces/<int:espacio_id>/stays/current/",
        EstanciaActualAPIView.as_view(),
        name="owner_stay_current",
    ),
    path(
        "spaces/<int:espacio_id>/stays/finish/",
        EstanciaFinalizarAPIView.as_view(),
        name="owner_stay_finish",
    ),
    path("stays/", OwnerEstanciaRegistroAPIView.as_view(), name="owner_stay_history"),
]

admin_urlpatterns = [
    path("stays/", AdminEstanciaRegistroAPIView.as_view(), name="admin_stay_history"),
]
