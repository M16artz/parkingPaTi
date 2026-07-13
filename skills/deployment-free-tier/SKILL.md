---
name: deployment-free-tier
description: Planificar, implementar o revisar despliegue de ParkingPaTi en Cloudflare Pages, Render Free y Supabase PostgreSQL Free. Usar para variables, builds, migraciones, health, CORS, pooling, cold starts, backups y aceptación de staging.
---

# Despliegue en niveles gratuitos

## Cuándo usarlo

Usar en fase 010 o preparación de staging aprobada. Verificar documentación oficial vigente antes de actuar.

## Reglas obligatorias

- Web en Cloudflare Pages; API Django en Render; DB PostgreSQL en Supabase.
- Django es el único cliente DB.
- Usar secretos/variables del proveedor, no Git.
- Render escucha `0.0.0.0:$PORT` y expone health.
- Filesystem Render es efímero; Drive almacena documentos.
- Ejecutar migraciones controladas y disponer rollback/backup acordado.
- Configurar HTTPS, hosts, CORS, CSRF y CSP.
- Documentar cold starts, límites y ausencia de SLA/backups suficientes.

## Antipatrones prohibidos

- Keys Supabase en frontend/móvil.
- Guardar uploads/SQLite en Render local.
- Pings artificiales para evadir suspensión.
- Ejecutar migraciones destructivas sin backup/verificación.
- Copiar secretos a logs/manifiestos.
- Asumir que límites free históricos siguen vigentes.

## Checklist de salida

- [ ] Límites oficiales fueron verificados y fechados.
- [ ] Builds/migraciones/health pasan.
- [ ] Variables están completas y secretas.
- [ ] Smoke/UAT HTTPS pasan.
- [ ] Cold start, backup y recuperación están documentados.
- [ ] No hay acceso directo a DB ni secretos en bundles.
