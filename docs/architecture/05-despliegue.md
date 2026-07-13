# Despliegue objetivo

## Web: Cloudflare Pages

- Raíz `frontend-web`.
- Build `npm ci && npm run build`.
- Salida `dist`.
- Configurar fallback SPA, CSP y `VITE_API_BASE_URL`.

## API: Render

- Raíz `backend`.
- Instalar requirements productivos.
- Ejecutar migraciones controladas.
- Iniciar Gunicorn en `0.0.0.0:$PORT`.
- Health check `/health/`.
- Filesystem efímero: ningún documento se guarda localmente.
- El free tier puede dormir; UI debe manejar cold start.

## DB: Supabase PostgreSQL

- Django usa connection string secreta.
- Ningún cliente usa Data API o keys Supabase.
- Evaluar pooler de sesión si Render requiere IPv4.
- Monitorear conexiones y límite del tier.
- Definir backup externo; free tier no es producción crítica.

## Servicios

- Google Drive privado mediante cuenta de servicio.
- Carpeta Drive exclusiva; solo administradores autorizados reciben acceso.
- Correo mediante Gmail/Google Workspace SMTP con App Password.
- Proveedor de tiles pendiente DP-12.

## Restriccion de costo

- El prototipo academico debe operar con costo monetario inicial de `$0`.
- Se aceptan cold starts, cuotas, suspension por inactividad y demas limites
  de los planes gratuitos.
- No se implementaran mecanismos artificiales para evadir esos limites.
- Antes de desplegar se deben volver a verificar condiciones y cuotas, porque
  los planes de terceros pueden cambiar.

## Variables

Documentar solo nombres, nunca valores: secret/settings Django, database URL, CORS/CSRF/hosts, Drive, correo, frontend URL, API URL y tile config.

Las credenciales, App Password, IDs de carpeta y valores reales se cargan al
final en los gestores de variables de Render/Cloudflare y entornos locales
ignorados. La fase 010 valida Gmail, Drive, cookies HTTPS y el despliegue
integrado; no se versionan ni se documentan valores.

Antes de implementar despliegue, verificar documentación oficial vigente; límites gratuitos cambian.
