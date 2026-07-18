# Tareas de fase 003

> **Fase completada el 2026-07-13:** 14 tareas verificadas. Ver evidencia.

- [x] `docs` Resolver DP-01, DP-07, DP-08 y DP-09. **Evidencia:** decisiones aprobadas por Miguel Armas el 2026-07-13 y registradas en el documento canónico.
- [x] `backend` Implementar DTOs/repositories/services/controllers de registro.
- [x] `backend` Implementar tokens hash, expiración, un solo uso y reenvío.
- [x] `backend` Aplicar throttling y prevención de enumeración.
- [x] `backend` Implementar estado de onboarding y datos iniciales de parqueadero.
- [x] `backend` Validar coordenadas dentro de Loja.
- [x] `backend` Implementar adapter Drive privado y nombre sanitizado.
- [x] `backend` Implementar reemplazo/compensación y submit de solicitud.
- [x] `web` Crear wizard de cuenta, verificación, ubicación, datos y documento.
- [x] `web` Validar confirmación de correo y contraseña solo en cliente.
- [x] `web` Añadir selector Leaflet sin geocodificación OSM.
- [x] `web` Manejar reanudación, errores y doble submit.
- [x] `tests` Probar auth, tokens, fallos correo/Drive y flujo API/web. **Evidencia:** 21 pruebas backend y 3 web.
- [x] `docs` Actualizar OpenAPI y estados finales.
- [x] `backend` Ajustar registro completo para pasar de verificación de correo a revisión sin repetir datos iniciales, con migración de reconciliación para registros previos. **Ajuste aprobado por el solicitante el 2026-07-18.**
- [x] `auth` Autenticar por `correo`, sincronizar la columna heredada `email` y permitir el primer acceso en `CONFIGURACION_PENDIENTE` conservando el bloqueo real por `is_active`. **Ajuste aprobado por el solicitante el 2026-07-18.**
