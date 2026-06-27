"""
Enrutador raiz del proyecto.
Solo agrega los urls.py de cada app - nunca define logica de negocio aqui.

Estructura final de endpoints:
  /api/auth/token/        POST - login (access 15 min + refresh)
  /api/auth/refresh/      POST - renovar access token
  /api/auth/register/     POST - registro de Persona + Cuenta

  /api/cuentas/           GET, POST*, PUT, PATCH, DELETE  (*POST deshabilitado)
  /api/parqueaderos/      GET, POST, PUT, PATCH, DELETE
  /api/parqueaderos/{id}/validar/   POST (solo administradores)
  /api/espacios/          GET, POST, PUT, PATCH, DELETE
  
  # --- NUEVA ESTRUCTURA DE TARIFAS ---
  /api/tarifas/           GET, POST, PUT, PATCH, DELETE (Tarifa Normal)
  /api/incrementos/       GET, POST, PUT, PATCH, DELETE (Tarifa con Incremento)
  /api/descuentos/        GET, POST, PUT, PATCH, DELETE (Tarifa con Descuento)
  
  /api/horarios/          GET, POST, PUT, PATCH, DELETE
  /api/documentos/        GET, POST, DELETE
  /api/documentos/{id}/validar/     POST (solo administradores)

  ws://<host>/ws/parqueaderos/{parqueadero_id}/  WebSocket (ver config/routing.py)
"""

from django.contrib import admin
from django.urls import include, path

from apps.usuarios.urls import auth_urlpatterns

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/auth/", include(auth_urlpatterns)),

    path("api/", include("apps.usuarios.urls")),
    path("api/", include("apps.parqueaderos.urls")),
    path("api/", include("apps.tarifas.urls")),
    path("api/", include("apps.horarios.urls")),
    path("api/", include("apps.documentos.urls")),
]