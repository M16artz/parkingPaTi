from django.urls import path

from apps.estancias.controllers import (
    AdminEstanciaRegistroAPIView,
    EstanciaActualAPIView,
    EstanciaFinalizarAPIView,
    EstanciaInicioAPIView,
    OwnerEstanciaRegistroAPIView,
    OwnerMetricasEstanciasHoyAPIView,
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
    path("stays/metrics/today/", OwnerMetricasEstanciasHoyAPIView.as_view(), name="owner_stay_metrics_today"),
]

admin_urlpatterns = [
    path("stays/", AdminEstanciaRegistroAPIView.as_view(), name="admin_stay_history"),
]
