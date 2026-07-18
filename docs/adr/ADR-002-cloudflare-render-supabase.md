# ADR-002: Cloudflare Pages, Render y Supabase

- Estado: Aceptada con límites conocidos
- Fecha: 2026-07-12
- Confirmación operativa: 2026-07-13

## Contexto

El proyecto requiere una ruta de despliegue de costo inicial cero para web estática, API Django y PostgreSQL.

## Decisión

Desplegar React/Vite en Cloudflare Pages, Django/DRF en Render Free y PostgreSQL en Supabase Free. Django es el único cliente de base.

El prototipo academico conserva costo monetario inicial de `$0`. Gmail SMTP
con App Password y Google Drive con cuenta de servicio completan los
proveedores externos usando configuracion por entorno. Se aceptan sus cuotas,
cold starts y restricciones operativas.

## Consecuencias

- Cold starts y disponibilidad no productiva en Render Free.
- Límites de almacenamiento/conexión y ausencia de backups suficientes en Supabase Free.
- Secretos y variables se configuran en proveedores, nunca en Git.
- Se debe reevaluar plan/proveedor antes de uso productivo crítico.

## Alternativas descartadas

- Servir web desde Django: acopla despliegues.
- Acceso directo a Supabase desde clientes: rompe arquitectura/autorización central.
- Infraestructura propia: fuera del costo/operación actuales.
