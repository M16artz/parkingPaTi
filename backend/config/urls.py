from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from apps.usuarios.urls import admin_urlpatterns, auth_urlpatterns, owner_urlpatterns
from apps.parqueaderos.urls import owner_configuration_urlpatterns, public_urlpatterns
from apps.estancias.urls import admin_urlpatterns as estancia_admin_urlpatterns
from apps.estancias.urls import owner_urlpatterns as estancia_owner_urlpatterns
from core.views import health

urlpatterns = [
    path("health/", health, name="health"),
    path("admin/", admin.site.urls),
    path("api/v1/schema/", SpectacularAPIView.as_view(), name="openapi-schema"),
    path(
        "api/v1/docs/",
        SpectacularSwaggerView.as_view(url_name="openapi-schema"),
        name="openapi-docs",
    ),
    path("api/v1/auth/", include(auth_urlpatterns)),
    path("api/v1/owner/", include(owner_urlpatterns)),
    path("api/v1/owner/", include(owner_configuration_urlpatterns)),
    path("api/v1/owner/", include(estancia_owner_urlpatterns)),
    path("api/v1/admin/", include(admin_urlpatterns)),
    path("api/v1/admin/", include(estancia_admin_urlpatterns)),
    path("api/v1/public/", include(public_urlpatterns)),
    path("api/v1/", include("apps.usuarios.urls")),
    path("api/v1/", include("apps.parqueaderos.urls")),
    path("api/v1/", include("apps.tarifas.urls")),
    path("api/v1/", include("apps.horarios.urls")),
    path("api/v1/", include("apps.documentos.urls")),
]
