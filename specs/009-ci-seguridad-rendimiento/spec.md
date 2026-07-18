# Fase 009: CI, seguridad y rendimiento

## Objetivo

Consolidar verificaciones automáticas, hardening y capacidad de polling antes del despliegue final.

## Incluye

- Workflows backend/web/móvil.
- Lint/typecheck/build/tests y migraciones check.
- Scanning de secretos/dependencias.
- Matriz de permisos, throttling y headers.
- Pruebas de carga/queries para polling.

## No incluye

- Nuevas funcionalidades de producto.
- Promoción final a producción.

## Criterios de aceptación

- PR no integra con checks fallidos.
- Permisos críticos están automatizados.
- Polling cumple objetivo sin queries N+1 evidentes.
- No aparecen secretos o dependencias críticas sin tratamiento.
