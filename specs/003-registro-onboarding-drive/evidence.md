# Evidencia de fase 003

> Fecha de cierre: 2026-07-13  
> Estado: completada con proveedores externos aislados.

## Dependencias y decisiones

- Fases 000, 001 y 002: completadas.
- DP-01: bbox Loja `(-79.2770, -4.0800, -79.1300, -3.8950)` con tolerancia `0.01`.
- DP-07: SMTP Gmail/Google Workspace por entorno.
- DP-08: cuenta de servicio, carpeta exclusiva y documentos privados.
- DP-09: refresh JWT en cookie HttpOnly, Secure y SameSite.
- No se inicio la fase 004 ni una fase posterior.

## Implementacion backend

- Registro publico crea solo propietario y deriva `username` del correo.
- El registro persiste aunque falle el envio y permite reenvio posterior.
- Los tokens de correo usan entropia aleatoria, SHA-256, expiracion, invalidez
  tras reenvio y un solo uso.
- Registro, login, verificacion, reenvio y refresh tienen throttling por scope.
- Reenvio responde igual para correo existente e inexistente.
- Login exige `is_active` y correo verificado.
- Refresh rota en cookie; no se devuelve ni almacena en JSON/JavaScript.
- Refresh de una cuenta inactiva se rechaza y logout invalida el token.
- El onboarding expone estado, borrador inicial, documento y submit bajo
  `/api/v1/owner/`.
- El bbox se valida en service tanto en onboarding como en la ruta generica.
- Submit exige correo, parqueadero y documento, actualiza los tres estados en
  transaccion y es idempotente ante doble envio.

## Drive y archivos

- Adapter Google Drive usa cuenta de servicio y scope `drive.file`.
- Solo crea archivos dentro de la carpeta exclusiva configurada; no concede
  permisos `anyone/reader`.
- Nombre sanitizado: `apellido_nombre_<cuenta_id>.<extension>`.
- Se validan extension, MIME, firma binaria, tamano maximo de 5 MB y archivo no vacio.
- El API de propietario no expone `drive_file_id` ni `drive_web_view_link`.
- Reemplazo confirma primero el archivo nuevo y elimina despues el anterior.
- Si PostgreSQL falla, intenta eliminar el archivo nuevo como compensacion.

## Web

- React Query centraliza registro y estado/mutaciones del onboarding.
- Registro valida repetir correo y contrasena solo en cliente.
- Verificacion usa el token del enlace y registro no inicia sesion automaticamente.
- Login consume access en memoria y refresh en cookie HttpOnly.
- Wizard reanuda parqueadero/documento segun `onboarding-status`.
- Botones bloquean doble submit y se muestra confirmacion antes de enviar.
- React Leaflet usa el bbox aprobado, tiles configurables y no geocodifica ni
  consulta OSM como fuente de parqueaderos.

## Pruebas y comandos

| Verificacion | Resultado |
|---|---|
| `manage.py check` | 0 issues |
| `makemigrations --check --dry-run` | Sin cambios de modelo |
| `migrate --noinput` desde PostgreSQL 16 vacio | Exitoso, incluidas migraciones `token_blacklist` |
| `migrate --check` | Sin migraciones pendientes |
| `pytest -q` | 21 pruebas pasaron |
| `pip check` | Sin dependencias rotas |
| `spectacular --validate` | OpenAPI generado, 0 errores y 0 warnings |
| `node --test` | 3 pruebas web pasaron |
| `eslint . --max-warnings 0` | Exitoso |
| `vite build` | Exitoso, 1683 modulos |
| Node 22 temporal | 22.23.1; test, lint y build exitosos |
| `git diff --check` | Exitoso |

Las pruebas backend usaron `postgres:16.3-alpine` sin volumen. El contenedor
fue detenido y eliminado al finalizar.

## Cobertura relevante

- Hash, expiracion, reuso, reenvio y fallo de correo.
- Cookie HttpOnly/Secure/SameSite, rotacion y cuenta inactiva.
- Enumeration resistance y respuesta 429.
- Bbox rechazado y tolerancia aceptada.
- Reanudacion por API y rechazo de submit incompleto.
- Nombre Drive, reemplazo y compensacion ante fallo DB.
- Privacidad del contrato de documento y submit atomico/idempotente.
- Confirmaciones cliente y limites del selector web.

## Riesgos residuales

- **No confirmado:** entrega real por Gmail/Workspace y carga real a Drive;
  por decisión del 2026-07-13 se validarán en fase 010 con Gmail SMTP/App
  Password, cuenta de servicio y carpeta exclusiva. `backend/.env` no existe
  y no se introdujeron credenciales para probarlas.
- **No confirmado:** cookies refresh entre los dominios HTTPS definitivos;
  su validación CORS/CSRF/SameSite también queda asignada a fase 010.
- `npm audit` informa 1 vulnerabilidad moderada y 1 alta en Vite 5/esbuild.
  La correccion disponible exige Vite 8 (cambio mayor) y corresponde a fase 009.
- El build avisa un chunk de aproximadamente 521 kB; optimizacion queda para fase 009.
- El Node global sigue en 24.14.1; la compatibilidad aprobada se verifico con
  Node 22.23.1 temporal sin modificar la instalacion del equipo.
- El hook WebSocket heredado del frontend permanece fuera del flujo 003 y su
  retiro esta asignado expresamente a fase 007.

Estas validaciones externas se difieren deliberadamente para configurar al
final variables, credenciales e IDs fuera del repositorio. No reabren las
tareas implementadas y automatizadas de la fase 003.

## Criterios de aceptacion

- Flujo interrumpible y reanudable: cumplido.
- No enviar sin correo, parqueadero y documento: cumplido.
- IDs/enlace privados y coherentes: cumplido por adapter y pruebas de
  persistencia/compensacion; proveedor real no confirmado.
- Sin tokens, documentos ni IDs Drive en logs: cumplido por revision y contrato.
