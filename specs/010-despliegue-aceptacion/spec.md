# Fase 010: Despliegue y aceptación

## Objetivo

Desplegar staging/producción objetivo y demostrar la aceptación final sin ampliar alcance.

## Incluye

- Cloudflare Pages, Render y Supabase PostgreSQL.
- Variables/secretos por proveedor.
- Migraciones, health, CORS/CSRF/HTTPS y smoke tests.
- UAT del flujo vertical y documentación operativa.

## No incluye

- Evadir límites de free tiers con pings artificiales.
- Backups o SLA no contratados sin decisión.
- Publicación en app stores.

## Criterios de aceptación

- Todos los criterios de `docs/qa/acceptance-final.md` pasan.
- Clientes usan HTTPS y no contienen IP/secretos.
- Limitaciones/recuperación están documentadas.
