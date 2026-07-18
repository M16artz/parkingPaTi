# Contratos API

OpenAPI versionado: `docs/openapi.yaml`. Endpoint runtime: `GET /api/v1/schema/`.

## Convenciones

- Base: `/api/v1/`.
- Colecciones paginadas: `{count, next, previous, results}`.
- Errores: `{error, code, detail, fields}`.
- Codigos HTTP: 400 validacion, 401 autenticacion, 403 permiso, 404 ausencia,
  409 conflicto y 429 limite.

## Autenticacion y registro

- `POST auth/register/`: crea Persona/Cuenta propietaria y solicita correo de verificacion; no crea sesion.
- `POST auth/verify-email/`: consume un token expirable y de un solo uso.
- `POST auth/resend-verification/`: respuesta generica `202`, incluso si el correo no existe.
- `POST auth/token/`: exige cuenta activa y correo verificado; devuelve access, rol y estado.
- `POST auth/token/refresh/`: lee el refresh exclusivamente desde cookie HttpOnly.
- `POST auth/logout/`: invalida y elimina la cookie refresh.
- `GET auth/me/`: devuelve cuenta, rol y estado de onboarding.

El refresh nunca forma parte del JSON ni se almacena en JavaScript. La cookie
usa `HttpOnly`, `Secure`, `SameSite` y path restringido; los valores de
despliegue no sensibles se configuran por entorno.

## Onboarding propietario

- `GET owner/onboarding-status/`: paso actual y datos ya persistidos.
- `PUT owner/parking/initial-data/`: crea o actualiza el borrador inicial.
- `PUT owner/document/`: carga o reemplaza el documento privado multipart.
- `POST owner/application/submit/`: valida correo, parqueadero y documento, y envia a revision.

El estado es reanudable. El documento de propietario expone metadatos, pero
no `drive_file_id` ni `drive_web_view_link`.

## Contratos base adicionales

- Cuentas: `cuentas/` y `cuentas/{id}/`.
- Parqueaderos: `parqueaderos/`, `parqueaderos/{id}/`, `validar/` y `mios/`. El propietario puede actualizar por `PATCH parqueaderos/{id}/` únicamente `nombre` y `descripcion`; dirección y coordenadas aprobadas son de solo lectura.
- Espacios: `espacios/` y `espacios/{id}/`.
- Tarifas: `tarifas/` y `tarifas/{id}/`; un solo recurso con codigo
  `NORMAL`, `DESCUENTO` o `INCREMENTO`.
- Horarios: `horarios/` y `horarios/{id}/`.
- Documentos: `documentos/`, `documentos/{id}/` y `validar/`.

## Administracion

Todas las rutas exigen JWT de una cuenta `ADMINISTRADOR` activa. Las listas
aceptan `page`, `page_size`, `q` y filtros indicados, y usan el envelope
paginado comun.

- `GET admin/applications/`: solicitudes con filtro `onboarding_estado`.
- `GET admin/applications/{cuenta_id}/`: identidad, parqueadero, ubicacion y
  metadatos del documento; no expone `drive_file_id` ni URL privada.
- `GET admin/applications/{cuenta_id}/document/`: entrega la URL privada solo
  al administrador autenticado; Drive conserva el control de acceso final.
- `POST admin/applications/{cuenta_id}/approve/`: pasa la cuenta a
  `CONFIGURACION_PENDIENTE` y aprueba parqueadero/documento.
- `POST admin/applications/{cuenta_id}/reject/`: exige `{motivo}` y pasa los
  tres recursos a rechazo; DP-05 permite reeditar todo el onboarding.
- `GET admin/accounts/`: propietarios con filtros `onboarding_estado` y
  `activo`.
- `GET admin/accounts/{cuenta_id}/`: detalle administrativo de cuenta.
- `POST admin/accounts/{cuenta_id}/disable/`: fija `is_active=false`, estado
  `DESHABILITADO`, parqueadero `INACTIVO` y revoca refresh tokens conocidos.

Aprobar, rechazar o deshabilitar nuevamente responde `409 state_conflict`.
El fallo del correo de aprobación/rechazo se informa con `email_enviado=false`
sin revertir la decisión persistida. DP-06 excluye rehabilitación.

La consulta publica pertenece a la fase 007.

## Configuracion final y espacios del propietario

Todas las rutas exigen una cuenta `PROPIETARIO` activa y verifican propiedad
tambien en service.

- `GET owner/configuration/`: devuelve configuracion, horarios, tarifas y
  espacios activos/eliminados para reanudar el flujo.
- `PUT owner/configuration/`: recibe `{horarios, tarifas, cantidad_espacios}`;
  `cantidad_espacios` es un entero entre 1 y 500, cada precio activo debe ser
  mayor o igual a `0.01`, y cada apertura debe ser anterior a su cierre;
  reemplaza horarios, consolida tarifas y crea el lote inicial en una sola
  transaccion. `NORMAL` es obligatoria.
- `POST owner/spaces/bulk/`: recibe `{cantidad}` entre 1 y 100 y crea un lote
  adicional con nombres generados y tarifa `NORMAL`.
- `PATCH owner/spaces/{espacio_id}/`: permite nombre, tarifa predeterminada y
  estado `LIBRE`/`INHABILITADO`. `OCUPADO` queda reservado a estancias.
- `DELETE owner/spaces/{espacio_id}/`: borrado logico; responde 409 si existe
  una estancia activa.
- `POST owner/spaces/{espacio_id}/reactivate/`: restaura como `LIBRE` solo si
  no existe otro espacio activo con el mismo nombre.

Completar la configuracion cambia cuenta a `ACTIVO`, parqueadero a
`configuracion_completa=true` y recalcula totales/estado. Repetir el mismo PUT
es idempotente y no duplica espacios. Cambiar la cantidad despues exige el
endpoint batch; el frontend no ejecuta bucles de requests.

## Estancias y valor informativo

Las acciones exigen propietario activo y validan propiedad tambien en service.
Los conflictos de estado o tarifa responden `409 stay_conflict`.

- `POST owner/spaces/{espacio_id}/stays/start/`: recibe `tarifa_id` opcional;
  sin valor usa `NORMAL`. Exige espacio activo/libre y tarifa activa del mismo
  parqueadero. Crea snapshot y responde `201`.
- `GET owner/spaces/{espacio_id}/stays/current/`: calcula un preview con UTC y
  Decimal sin modificar la estancia.
- `POST owner/spaces/{espacio_id}/stays/finish/`: finaliza, calcula y libera el
  espacio atomicamente.
- `GET owner/stays/`: registro minimo paginado del parqueadero propio dentro de
  los ultimos 12 meses.
- `GET admin/stays/`: registro minimo paginado de todos los parqueaderos dentro
  de los ultimos 12 meses; exige administrador.

La respuesta contiene identificadores/nombres de espacio y parqueadero,
snapshot de tarifa/precio, `inicio`, `fin`, `calculado_hasta`, minutos, horas,
costo y estado. No contiene placa, conductor, pago, recibo ni eventos. En una
estancia activa `fin` permanece `null`; `calculado_hasta` identifica el instante
del preview.

La retencion aprobada se ejecuta mediante:

```powershell
backend/venv/Scripts/python.exe backend/manage.py purge_expired_stays
```

El comando elimina fisicamente registros finalizados/cancelados vencidos. La
programacion operativa se configura en la fase 010 sin secretos en el repo.

## Consulta publica de parqueaderos

No requiere autenticacion. Los datos proceden de Django/PostgreSQL y solo
incluyen parqueaderos aprobados, configurados, con cuenta activa y estado
`OPEN`, `FULL` o `CLOSED`.

- `GET public/parkings/?bbox=minLng,minLat,maxLng,maxLat`: marcadores dentro
  del viewport. Valida cuatro numeros, orden min/max y limites de Loja con la
  tolerancia DP-01. Responde `{updated_at, results}`.
- `GET public/parkings/{id}/`: detalle publico con descripcion, direccion,
  disponibilidad, tarifas activas y horarios.

El resumen usa nombres compartidos web/movil: `name`, `latitude`, `longitude`,
`address`, `total_spaces`, `available_spaces`, `status` y `updated_at`. El
detalle no expone propietario, cuentas, documentos ni espacios internos.

La consulta bbox usa indices de ubicacion y visibilidad. El test de carga base
verifica una consulta ORM constante para 40 marcadores.

## Reglas compartidas

- Web y movil consumen el mismo JSON/OpenAPI.
- Los clientes no acceden a PostgreSQL/Supabase directamente.
- No existen rutas WebSocket ni endpoints que usen OSM como datos de negocio.
- OpenAPI se regenera con:

```powershell
backend/venv/Scripts/python.exe backend/manage.py spectacular --file docs/openapi.yaml --validate
```
