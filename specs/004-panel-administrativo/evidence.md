# Evidencia de fase 004

> Fecha: 2026-07-13  
> Estado: completada sobre PostgreSQL 16 efimero.

## Dependencias y decisiones

- Fase 003: cerrada con 14 de 14 tareas.
- DP-05: Miguel Armas aprobo reeditar y reenviar todo el onboarding tras rechazo.
- DP-06: Miguel Armas excluyo la rehabilitacion de cuentas.
- El bloqueo inicial se documento antes de implementar y se levanto solo al
  recibir responsable, eleccion y fecha.

## Backend implementado

- Repositorios paginables para solicitudes y cuentas propietarias, con busqueda
  y filtros.
- DTOs separados para queries, listas, detalles, documento y acciones; ninguna
  respuesta expone `drive_file_id`.
- Servicios admin validan rol nuevamente y usan transacciones con
  `select_for_update` para aprobar, rechazar y deshabilitar.
- Una transicion repetida o concurrente devuelve `409 state_conflict`.
- Aprobar sincroniza cuenta, parqueadero y documento; rechazar exige motivo y
  habilita la reedicion completa del onboarding.
- Deshabilitar fija `is_active=false`, `DESHABILITADO`, persona inactiva,
  parqueadero `INACTIVO` y blacklista refresh tokens conocidos.
- El refresh revocado devuelve 401 y no filtra `TokenError` como error 500.
- El correo se envia despues de la transaccion; su fallo produce
  `email_enviado=false` sin rollback.
- No fue necesaria migracion: los campos y constraints requeridos ya existian.

## Web implementada

- Guarda `/admin/*` basada en `/auth/me/`, con autorizacion real conservada en
  Django.
- Listas de solicitudes y cuentas con filtros y estados loading/error/empty.
- Detalle con marcador Leaflet, metadatos y acceso al documento mediante un
  endpoint admin dedicado.
- Confirmaciones para aprobar, rechazar y deshabilitar; el rechazo requiere
  motivo y todas las mutaciones invalidan queries relacionadas.
- Login dirige por rol al panel admin o al flujo propietario.

## Contratos y documentacion

- `docs/openapi.yaml` contiene las ocho rutas admin con operation IDs unicos y
  envelopes paginados reales.
- `docs/architecture/03-api-contracts.md` documenta estados, 409, correo y
  revocacion.
- `docs/qa/panel-administrativo.md` describe el flujo operativo.

## Comandos y resultados

| Comando | Resultado |
|---|---|
| `manage.py check --settings=config.settings.test` | Exitoso; 0 issues |
| `manage.py makemigrations --check --dry-run` | Exitoso; sin cambios |
| `manage.py migrate --noinput` + `migrate --check` | Exitoso en PostgreSQL 16 vacio |
| `python -m pytest backend/tests -q` | Exitoso; 27 pruebas pasaron |
| `manage.py spectacular --validate` | Exitoso; 0 errores y 0 warnings al cierre |
| `python -m compileall -q` | Exitoso |
| `python -m pip check` | Exitoso; sin dependencias rotas |
| `npm.cmd test` | Exitoso; 5 pruebas pasaron |
| `npm.cmd run lint` | Exitoso; 0 errores/warnings de ESLint |
| `npm.cmd run build` | Exitoso; Vite genero `dist` |
| `GET http://localhost:5173/admin/applications` | HTTP 200 desde Vite |

Las pruebas PostgreSQL usaron `postgres:16.3-alpine`, contraseña aleatoria en
memoria, puerto efimero, sin volumen y con eliminacion al finalizar.

## Fallos encontrados durante la verificacion

1. La primera ejecucion sin credencial DB no inicio pruebas; no se creo `.env`.
2. La primera suite efimera detecto un lock con joins nullable; se limito el
   `FOR UPDATE` a la fila de parqueadero. Resultado: 20 pasaron, 7 fallaron.
3. La siguiente suite detecto refresh blacklisteado como 500; se normalizo a
   401. Resultado: 26 pasaron, 1 fallo.
4. La suite final paso 27 de 27. OpenAPI detecto luego dos operation IDs
   colisionados; se hicieron explicitos y la validacion final quedo limpia.

## Criterios de aceptacion

| Criterio | Evidencia | Estado |
|---|---|---|
| Solo admin accede a endpoints/vistas | Matriz API 401/403/200 y guarda web probada | Cumplido |
| Acciones repetidas/concurrentes no duplican transicion | Locks PostgreSQL y pruebas 409/carrera de dos hilos | Cumplido |
| Cuenta deshabilitada no inicia ni renueva sesion | Prueba login 401, refresh 401 y parqueadero inactivo | Cumplido |

## Riesgos pendientes

- La validacion real de SMTP, permisos Drive y cookies HTTPS permanece aprobada
  para fase 010; esta fase uso adapters y backend de correo de prueba.
- Vite advierte que el bundle principal supera 500 kB. No bloquea el flujo y su
  optimizacion corresponde a rendimiento/CI, fase 009.
- No existe rehabilitacion por DP-06; no debe realizarse mediante cambios
  manuales en PostgreSQL.

## Estado de fase

**Completada el 2026-07-13.** Las 13 tareas y los tres criterios de aceptacion
cuentan con evidencia. No se implementaron reservas, pagos, conductor con
cuenta, WebSockets, Redis, acceso directo a Supabase ni OSM como datos.
