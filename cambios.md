# ParkingPaTi - Plan Integral de Correcciones y Evolución

> Fecha de planificación: 2026-07-12  
> Documento base: `parkingPaTi.md`  
> Alcance: planificación; este documento no implementa cambios funcionales.  
> Prioridad de decisión: las instrucciones de producto de esta solicitud prevalecen sobre recomendaciones generales del informe técnico cuando exista conflicto.

## 1. Objetivo

Estabilizar ParkingPaTi y completar un producto funcional para la ciudad de Loja, Ecuador, conservando Django + Django REST Framework + PostgreSQL, React/Vite para web y React Native para móvil. El sistema permitirá:

- Registro y habilitación de propietarios con cuenta, parqueadero y documento.
- Verificación de correo.
- Revisión administrativa de solicitudes y documentos.
- Configuración de espacios, tipos, tarifas y horarios por el propietario.
- Asignación operativa de vehículos a espacios y cálculo informativo de estancia.
- Consulta pública y anónima de parqueaderos desde mapas web y móvil.
- Actualización por polling cada 5 segundos mientras la vista esté activa.
- Despliegue web en Cloudflare Pages, API Django en Render Free y PostgreSQL en Supabase Free.

No se implementarán reservas, pagos, cobros, facturación ni integración bancaria. Tampoco se construirá un sistema general de auditoría o historial de ocupación.

## 2. Decisiones de alcance vinculantes

### 2.1 Funcionalidades incluidas

1. Cuenta de propietario con verificación de correo.
2. Relación Cuenta 1 a 0..1 Parqueadero.
3. Relación Cuenta 1 a 1 Documento de habilitación.
4. Relación Parqueadero 1 a N Espacios.
5. Solicitud de habilitación con aprobación o rechazo administrativo.
6. Deshabilitación de cuentas por administrador.
7. Configuración inicial y final del parqueadero en fases separadas.
8. Gestión de espacios con nombre, tipo, estado y borrado lógico.
9. Tarifas informativas configurables por parqueadero.
10. Inicio y finalización de una estancia por el propietario.
11. Cálculo de horas redondeadas al entero inmediato superior y costo informativo.
12. Registro mínimo de estancia con tiempo, tipo de tarifa, valor aplicado y total.
13. Consulta pública sin cuenta desde mapa y listado.
14. Polling REST con React Query en web y móvil.
15. Mapa limitado visual y funcionalmente a Loja.

### 2.2 Funcionalidades excluidas

- Reservar un espacio.
- Comprar, pagar o facturar una estancia.
- Capturar tarjetas o integrar pasarelas de pago.
- Registrar placa, identidad o datos del conductor, salvo que se apruebe después como requisito separado.
- Crear cuentas de conductor.
- Mantener bitácora general de cambios, auditoría administrativa o historial detallado de ocupación.
- WebSockets, Django Channels, Redis para Channels y consumers.
- Descargar mapas o tiles para uso offline.
- Usar la API de OpenStreetMap para buscar parqueaderos o como base de datos del dominio.
- Nominatim, geocodificación OSM o scraping de datos OSM en esta fase.

### 2.3 Resolución de requisitos aparentemente contradictorios

El requisito “no almacenar historial de ocupación, auditoría o trazabilidad” entra en tensión con “almacenar un registro de tiempos, tipo de tarifa y costo final para trazabilidad”. La decisión de este plan es:

- **Sí** se guarda una entidad mínima `Estancia` por operación finalizada.
- Solo contiene inicio, fin, horas cobradas, tarifa aplicada y costo calculado.
- No contiene datos del conductor, placa, pagos, factura, eventos intermedios ni historial de ediciones.
- No se implementa una bitácora de auditoría genérica.

La frase “contraseña, repetir correo” se implementará literalmente como confirmación de correo en el frontend. Además se añadirá confirmación de contraseña porque evita errores de registro; el backend nunca recibirá ni persistirá los campos de confirmación.

## 3. Principios de implementación

### 3.1 Arquitectura modular por capas obligatoria

Cada módulo backend debe conservar este flujo:

```text
HTTP request
  -> controller/view
  -> DTO/serializer de entrada
  -> service/caso de uso
  -> repository
  -> model/PostgreSQL
  -> DTO/serializer de salida
  -> HTTP response
```

Responsabilidades:

| Capa | Puede hacer | No puede hacer |
|---|---|---|
| Controller | Parsear transporte, elegir DTO, invocar servicio, responder | Consultar ORM o contener reglas de negocio |
| DTO/serializer | Validar forma, tipos y restricciones locales | Autorizar propietario o coordinar transacciones |
| Service | Reglas de negocio, permisos de recurso, transacciones, coordinación | Depender de React o detalles HTTP innecesarios |
| Repository | Consultas ORM, locks, persistencia y optimización | Decidir reglas de rol o flujos de interfaz |
| Model | Esquema, constraints, enums e invariantes simples | Orquestar APIs externas |
| Adapter/infrastructure | Drive, correo y proveedores externos | Decidir reglas del dominio |

Reglas de revisión:

- Ningún controller nuevo usa `Model.objects` directamente.
- Ningún frontend conoce modelos internos ni accede a Supabase directamente.
- Django es la única puerta de acceso a PostgreSQL.
- Todo caso de uso de escritura tiene prueba de servicio y prueba API.
- Las autorizaciones se repiten en la capa de servicio como límite de confianza.
- Las transacciones se ubican en servicios o repositorios, nunca en componentes React.

### 3.2 Arquitectura de ejecución objetivo

```text
[React/Vite en Cloudflare Pages] ─┐
                                  ├── HTTPS REST ──> [Django/DRF en Render]
[React Native] ───────────────────┘                         │
                                                           ├──> [Supabase PostgreSQL]
                                                           ├──> [Google Drive privado]
                                                           └──> [Proveedor SMTP/correo]

[Leaflet / react-native-maps] ──> [Tiles OSM o proveedor de tiles]
[Web y móvil] ─────────────────> [GET /api/public/parkings]
```

No habrá conexión web/móvil -> Supabase. No habrá conexión web/móvil -> API OSM para datos del negocio.

## 4. Arquitectura objetivo por módulo

### 4.1 `usuarios`

- Persona y Cuenta con relación uno a uno.
- Registro, verificación de correo, login, refresh y estado de cuenta.
- Roles `ADMINISTRADOR` y `PROPIETARIO`.
- No se crea rol conductor.
- `is_active` será la fuente real para bloqueo de autenticación.
- `correo_verificado` y fecha de verificación controlan acceso al onboarding.

### 4.2 `parqueaderos`

- Un propietario tiene cero o un parqueadero.
- Datos iniciales: nombre, descripción opcional, dirección y coordenadas.
- Estado de habilitación separado del estado operativo.
- Consulta pública solo para parqueaderos aprobados, activos y dentro del bbox solicitado.
- Conteos `total_spaces` y `available_spaces` se calculan de forma coherente; se decidirá si son campos denormalizados o anotaciones. Para polling frecuente se recomienda denormalizarlos y actualizarlos transaccionalmente.

### 4.3 `documentos`

- Un documento vigente por cuenta.
- Google Drive como adapter privado.
- Nombre de archivo: `apellido_nombre_<cuenta_id>.<extension>`.
- Se sanitizan espacios, tildes y caracteres inseguros. El ID evita colisiones entre homónimos.
- Se guardan `drive_file_id`, `drive_web_view_link`, nombre original, MIME, tamaño, fecha y estado.
- El enlace guardado no implica acceso público; la cuenta de servicio/admin debe tener permiso.
- Reemplazar documento invalida una aprobación previa y conserva consistencia entre Drive y DB.

### 4.4 `espacios`

- Nombre editable por propietario.
- Tipo configurable desde catálogo controlado.
- Estados operativos: `LIBRE`, `OCUPADO`, `DESHABILITADO`.
- Borrado lógico con `is_active=False` y `deleted_at`.
- No se elimina físicamente un espacio con estancia activa.
- Al crear, usa tarifa normal por defecto.
- Altas, cambios, deshabilitación y borrado recalculan conteos del parqueadero en la misma transacción.

### 4.5 `tarifas`

- Se elimina la duplicidad entre `Parqueadero.tarifa`, estrategias y categorías actuales.
- Modelo único de tarifas por parqueadero.
- Tarifa `NORMAL` obligatoria y predeterminada.
- Tarifas adicionales opcionales,`PREFERENCIAL` y `PESADOS`.
- Cada tarifa tiene valor por hora y bandera activa.
- No hay porcentajes, estrategias de incremento/descuento ni motor de cobro.
- Los valores son informativos para conductor y propietario.

### 4.6 `estancias`

- Caso de uso operativo mínimo: ocupar/liberar espacio (Tambien se Puede Inhabilitar).
- Una sola estancia activa por espacio.
- Inicio guarda tarifa seleccionada y snapshot del precio.
- Fin calcula duración y costo; no depende de cambios posteriores en tarifas.
- No se registra identidad del conductor ni pago.

### 4.7 `horarios`

- Se conserva un horario por día/parqueadero.
- La API pública entrega horarios del parqueadero aprobado.
- El propietario configura horarios en la primera configuración final y puede actualizarlos después.

### 4.8 `administracion`

- Puede ser módulo separado o controladores administrativos dentro de módulos, pero la UI tendrá servicios y rutas `/api/admin/...` coherentes.
- Lista solicitudes, muestra datos relacionados y ejecuta aprobar, rechazar y deshabilitar.
- Todas las acciones exigen rol administrador y confirmación en UI.

## 5. Modelo de datos propuesto

Los nombres finales deben acordarse antes de generar migraciones. Esta propuesta reemplaza relaciones y duplicidades actuales.

### 5.1 Cuenta y Persona

```text
Persona
- id
- nombre
- apellido
- tipo_identificacion
- identificacion (unique)
- estado

Cuenta
- id
- persona_id (OneToOne, unique)
- username
- correo (unique)
- password_hash
- rol
- is_active
- correo_verificado
- correo_verificado_en
- onboarding_estado
- created_at
- updated_at
```

Estados sugeridos de onboarding:

- `CORREO_PENDIENTE`
- `DATOS_INICIALES_PENDIENTES`
- `REVISION_PENDIENTE`
- `RECHAZADO`
- `CONFIGURACION_PENDIENTE`
- `ACTIVO`
- `DESHABILITADO`

### 5.2 Verificación de correo

```text
VerificacionCorreo
- id
- cuenta_id
- token_hash (unique)
- expires_at
- used_at (nullable)
- created_at
```

Nunca se almacena el token en texto plano. Al reenviar, se invalidan tokens anteriores activos. Vigencia propuesta: 24 horas.

### 5.3 Parqueadero

```text
Parqueadero
- id
- propietario_id (OneToOne, unique) (a la entidad cuenta)
- nombre
- direccion_id
- ubicacion_id
- habilitacion_estado: BORRADOR | PENDIENTE | APROBADO | RECHAZADO
- motivo_rechazo (nullable)
- estado_operativo: ABIERTO | LLENO | CERRADO | INACTIVO | FUERA-DE-SERVICIO
- total_espacios
- espacios_disponibles
- configuracion_completa
- approved_at
- updated_at
```
### 5.3.1
```text
Direccion
- id
- calle_principal
- calle_secundaria
- numero_lote
```
### 5.3.1
```text
Ubicacion
- id
- latitud
- longitud
```

### 5.4 Documento

```text
DocumentoHabilitacion
- id
- cuenta_id (OneToOne, unique)
- drive_file_id (unique)
- drive_web_view_link
- nombre_archivo
- nombre_original
- mime_type
- size_bytes
- estado: PENDIENTE | APROBADO | RECHAZADO
- motivo_rechazo
- uploaded_at
- reviewed_at
- reviewed_by_id (nullable)
```

### 5.5 Tarifas

```text
Tarifa
- id
- parqueadero_id
- tipo: NORMAL | PREFERENCIAL | PESADOS
- nombre_visible
- precio_hora Decimal(8,2)
- activa
- created_at
- updated_at

UNIQUE(parqueadero_id, tipo)
CHECK(precio_hora >= 0)
```

### 5.6 Espacios

```text
Espacio
- id
- parqueadero_id
- nombre
- tipo
- estado: LIBRE | OCUPADO | DESHABILITADO
- tarifa_predeterminada_id
- is_active
- deleted_at
- created_at
- updated_at

UNIQUE(parqueadero_id, nombre) WHERE is_active = true
```

El catálogo de `tipo` debe definirse con el equipo antes de migrar. No se debe asumir que tipo de espacio y tipo de tarifa son lo mismo.

### 5.7 Estancia mínima

```text
Estancia
- id
- espacio_id
- tarifa_id
- tarifa_tipo_snapshot
- precio_hora_snapshot
- inicio
- fin (nullable)
- minutos_reales (nullable)
- horas_cobradas (nullable)
- costo_total (nullable)
- estado: ACTIVA | FINALIZADA | CANCELADA
- created_at

Restricción: máximo una Estancia ACTIVA por espacio.
```

Fórmula:

```text
minutos_reales = ceil((fin - inicio) en minutos)
horas_cobradas = ceil(minutos_reales / 60)
costo_total = horas_cobradas * precio_hora_snapshot
```

Si el negocio desea cobrar una fracción mínima distinta, deberá aprobarse antes de implementar. La zona horaria será `America/Guayaquil` y los timestamps se guardarán en UTC.

## 6. Flujos funcionales objetivo

### 6.1 Registro y solicitud de habilitación

El flujo es reanudable; no debe ejecutarse como una única transacción distribuida entre DB, correo y Drive.

1. El usuario ingresa nombres, apellidos, identificación, correo, confirmación de correo, contraseña y confirmación de contraseña.
2. Web valida confirmaciones; backend valida todos los datos autoritativamente.
3. Backend crea Persona + Cuenta en transacción con rol propietario, `is_active=True`, correo no verificado y estado `CORREO_PENDIENTE`.
4. Backend crea token, envía correo de verificación y responde 201 sin tokens de sesión, o con acceso restringido de onboarding si se decide expresamente.
5. Usuario abre el enlace; backend consume token y marca correo verificado.
6. Usuario inicia sesión y entra al asistente de datos iniciales.
7. Selecciona punto en mapa limitado a Loja; el navegador devuelve latitud/longitud. No se llama a la API de OSM.
8. Ingresa nombre del parqueadero, calle principal, secundaria y número de lote.
9. Backend crea el parqueadero en `BORRADOR`, unido de forma OneToOne a la cuenta.
10. Usuario sube el documento.
11. Adapter guarda en Drive como `apellido_nombre_<id>.<ext>` y persiste ID/link privado.
12. Usuario confirma “Enviar solicitud”. Backend comprueba correo, parqueadero y documento completos y cambia a `REVISION_PENDIENTE`/`PENDIENTE`.
13. UI muestra estado pendiente; no presenta mensaje de aprobación hasta que un administrador actúe.

Fallos y recuperación:

- Correo duplicado: 409 y mensaje de campo.
- Fallo de envío de correo: cuenta se conserva y ofrece reenvío; se registra error técnico sin token.
- Cierre durante mapa/documento: al volver continúa en el paso pendiente.
- Fallo Drive antes de DB: borrar archivo si fue creado; si no se puede, registrar error técnico para limpieza.
- Fallo DB después de Drive: compensar eliminando el archivo nuevo.
- Documento reemplazado: nuevo archivo se confirma antes de retirar el anterior.

### 6.2 Revisión administrativa

1. Admin entra a `/admin/solicitudes` en la web.
2. Consulta solicitudes pendientes paginadas y filtrables.
3. Abre detalle con nombre, identificación, correo, datos del parqueadero, marcador en mapa y documento.
4. Para aceptar, pulsa acción y ve modal: “¿Confirmas habilitar esta solicitud?”.
5. Confirmar invoca endpoint de aprobación; cancelar no hace petición.
6. Para rechazar, modal exige motivo y segunda confirmación.
7. Backend usa transacción y actualiza documento, parqueadero y onboarding consistentemente.
8. Backend envía correo de resultado. Si correo falla, la decisión no se revierte; se reintenta o informa al admin.
9. Aprobación lleva al propietario a `CONFIGURACION_PENDIENTE`.
10. Rechazo permite corregir parqueadero/documento y reenviar.

### 6.3 Deshabilitación de cuenta

1. Admin abre detalle de cuenta.
2. Pulsa “Deshabilitar” y modal explica que se bloqueará login y se ocultará el parqueadero.
3. Confirmación ejecuta `POST /api/admin/cuentas/{id}/deshabilitar/`.
4. Servicio pone `Cuenta.is_active=False` y parqueadero `INACTIVO` en transacción.
5. Refresh/access tokens existentes deben quedar invalidados mediante política de versión/token o blacklist.
6. La UI muestra confirmación final.

Rehabilitación no se incluye hasta confirmar el requisito. No se borran cuenta, parqueadero ni documento.

### 6.4 Primer ingreso y configuración final

Tras aprobación, el router consulta `/api/owner/onboarding-status/` y obliga a completar:

1. Horarios de atención.
2. Tarifa normal obligatoria y tarifas adicionales deseadas.
3. Cantidad inicial de espacios.
4. Tipos de espacios que posee el parqueadero.
5. Generación de la grilla.
6. Renombrado individual seleccionando un espacio.
7. Revisión y activación.

La creación masiva de espacios debe ser un caso de uso backend atómico, no N llamadas secuenciales desde React.

### 6.5 Gestión de espacios

- Agregar uno o varios espacios.
- Renombrar con validación de unicidad dentro del parqueadero.
- Cambiar tipo.
- Deshabilitar sin borrar.
- Borrar lógicamente si no tiene estancia activa.
- Reactivar solo si no existe otro espacio activo con el mismo nombre.
- Marcar ocupado solo al iniciar una estancia.
- Marcar libre solo al finalizar/cancelar la estancia.
- Recalcular `total_espacios`, `espacios_disponibles` y estado `LLENO/ABIERTO` en transacción.

### 6.6 Inicio y fin de estancia informativa

Inicio:

1. Propietario selecciona espacio libre.
2. UI propone tarifa `NORMAL`.
3. Propietario elige una tarifa activa del parqueadero.
4. Confirma inicio.
5. Backend bloquea fila de espacio, crea estancia activa con snapshot y cambia espacio a ocupado.

Finalización:

1. Propietario selecciona espacio ocupado.
2. Backend calcula fin, minutos, techo de horas y costo.
3. UI muestra un resumen antes de confirmar.
4. Confirmar finaliza estancia y libera espacio en una transacción.
5. Respuesta muestra duración real, horas redondeadas, tarifa y total informativo.

No se genera cobro, recibo fiscal ni pago. Debe mostrarse “Valor informativo”.

### 6.7 Consulta pública anónima

1. Web/móvil abre mapa centrado y limitado a Loja.
2. Cliente obtiene bbox visible del mapa.
3. Solicita `GET /api/public/parkings?bbox=minLng,minLat,maxLng,maxLat`.
4. Backend consulta únicamente PostgreSQL y devuelve parqueaderos públicos.
5. React Query repite cada 5000 ms mientras la pantalla está activa.
6. Marcador muestra nombre, estado, disponibles, horarios y tarifas informativas.
7. Mover mapa cambia query key y bbox con debounce.

El mapa base solicita solo tiles visibles al proveedor configurado. No precarga ni descarga Loja.

## 7. Contratos API propuestos

Todos los endpoints deben versionarse bajo `/api/v1/`. El contrato final se publicará en OpenAPI.

### 7.1 Autenticación

| Método y ruta | Acceso | Propósito |
|---|---|---|
| `POST /api/v1/auth/register/` | Público | Crear Persona/Cuenta |
| `POST /api/v1/auth/verify-email/` | Público | Consumir token |
| `POST /api/v1/auth/resend-verification/` | Público con throttling | Reenviar correo |
| `POST /api/v1/auth/token/` | Público con throttling | Login propietario/admin |
| `POST /api/v1/auth/token/refresh/` | Refresh válido | Renovar access |
| `POST /api/v1/auth/logout/` | Autenticado | Invalidar refresh |
| `GET /api/v1/auth/me/` | Autenticado | Sesión, rol y onboarding |

Registro:

```json
{
  "nombre": "Ana",
  "apellido": "Paredes",
  "tipo_identificacion": "CI",
  "identificacion": "1100000000",
  "correo": "ana@example.com",
  "password": "valor-no-documentado"
}
```

La confirmación de correo/contraseña es responsabilidad UI. Nunca se registra el valor real de contraseña en logs, documentación o analytics.

### 7.2 Onboarding propietario

| Método y ruta | Propósito |
|---|---|
| `GET /api/v1/owner/onboarding-status/` | Obtener paso y datos existentes |
| `PUT /api/v1/owner/parking/initial-data/` | Crear/actualizar borrador inicial |
| `PUT /api/v1/owner/document/` | Subir/reemplazar multipart |
| `POST /api/v1/owner/application/submit/` | Enviar a revisión |
| `PUT /api/v1/owner/parking/final-configuration/` | Horarios, tarifas, tipos y espacios iniciales |

Datos iniciales:

```json
{
  "nombre": "Parking Centro",
  "descripcion": "Parqueadero cubierto",
  "calle_principal": "Bolívar",
  "calle_secundaria": "Rocafuerte",
  "numero_lote": "12",
  "latitud": "-3.997000",
  "longitud": "-79.201000"
}
```
(La longitud y la latitud se recuperan del punto seleccionado en el mapa interactivo)
El backend valida que las coordenadas estén dentro del bounding box autorizado de Loja. Los límites exactos deben definirse como configuración, no dispersos en componentes.

### 7.3 Administración

| Método y ruta | Propósito |
|---|---|
| `GET /api/v1/admin/applications/` | Solicitudes paginadas/filtradas |
| `GET /api/v1/admin/applications/{id}/` | Datos, mapa y documento |
| `POST /api/v1/admin/applications/{id}/approve/` | Aprobar |
| `POST /api/v1/admin/applications/{id}/reject/` | Rechazar con motivo |
| `GET /api/v1/admin/accounts/` | Cuentas paginadas |
| `POST /api/v1/admin/accounts/{id}/disable/` | Deshabilitar cuenta |

Ninguna acción administrativa usa GET ni acepta un cambio de rol desde el cliente.

### 7.4 Propietario operativo

| Método y ruta | Propósito |
|---|---|
| `GET/PATCH /api/v1/owner/parking/` | Consultar/actualizar parqueadero propio |
| `PATCH /api/v1/owner/parking/availability/` | Abrir/cerrar manualmente |
| `GET /api/v1/owner/spaces/` | Grilla propia |
| `POST /api/v1/owner/spaces/bulk/` | Crear cantidad inicial/adicional |
| `PATCH /api/v1/owner/spaces/{id}/` | Renombrar/tipo/deshabilitar |
| `DELETE /api/v1/owner/spaces/{id}/` | Borrado lógico |
| `GET/PUT /api/v1/owner/schedules/` | Horarios |
| `GET/PUT /api/v1/owner/rates/` | Tarifas informativas |
| `POST /api/v1/owner/spaces/{id}/stays/start/` | Iniciar estancia |
| `GET /api/v1/owner/spaces/{id}/stays/current/` | Estancia activa/resumen preliminar |
| `POST /api/v1/owner/spaces/{id}/stays/finish/` | Finalizar y calcular |

### 7.5 API pública

| Método y ruta | Propósito |
|---|---|
| `GET /api/v1/public/parkings/?bbox=...` | Marcadores del viewport |
| `GET /api/v1/public/parkings/{id}/` | Detalle, horarios y tarifas |

Respuesta de mapa propuesta:

```json
{
  "updated_at": "2026-07-12T20:00:00Z",
  "results": [
    {
      "id": 12,
      "name": "Parking Centro",
      "latitude": -3.997,
      "longitude": -79.201,
      "address": "Bolívar y Rocafuerte, lote 12",
      "total_spaces": 30,
      "available_spaces": 8,
      "status": "OPEN",
      "updated_at": "2026-07-12T19:59:58Z"
    }
  ]
}
```

El contrato público utilizará nombres consistentes para web y móvil. El backend puede conservar nombres Python en español internamente, pero OpenAPI será la fuente única.

### 7.6 Errores

```json
{
  "error": true,
  "code": "application_already_reviewed",
  "detail": "La solicitud ya fue procesada.",
  "fields": {}
}
```

Usar 400 para forma/regla, 401 autenticación, 403 autorización, 404 ausencia, 409 conflicto de estado/unicidad y 429 throttling.

## 8. Polling y React Query

### 8.1 Política común

```javascript
useQuery({
  queryKey: ['public-parkings', bbox],
  queryFn: () => publicParkingService.listByBbox(bbox),
  refetchInterval: 5000,
  refetchIntervalInBackground: false,
  staleTime: 3000,
  retry: 2,
})
```

TanStack Query soporta `refetchInterval` como número o función; 5000 significa una nueva consulta cada cinco segundos. Referencia oficial: [TanStack Query `useQuery`](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

Reglas:

- Polling solo cuando mapa/dashboard está enfocado y la app está activa.
- En web, pausar al ocultar pestaña.
- En móvil, integrar `AppState`/focus manager para pausar en background.
- Backoff ante errores y mensaje de “última actualización”.
- Cancelar consulta anterior al cambiar bbox.
- Debounce de 300-500 ms al mover mapa.
- Invalidar queries inmediatamente después de PATCH/POST del propietario.
- No mantener `setInterval` manual paralelo a React Query.

### 8.2 Retiro completo de WebSockets

Eliminar después de que polling tenga pruebas:

- `backend/apps/parqueaderos/consumers.py`.
- `backend/config/routing.py`.
- `ProtocolTypeRouter`, `AuthMiddlewareStack` y rutas WS de `asgi.py`.
- `channels`, `channels-redis` y `daphne` si ya no son requeridos por otra función.
- `CHANNEL_LAYERS` de settings.
- Hooks web `useDisponibilidadSocket` y todas sus llamadas.
- Servicio/hook WebSocket móvil.
- ADR y comentarios de WebSockets.
- Redis del diseño y despliegue si no existe otro caso de uso.

No dejar código comentado ni dependencias sin uso.

## 9. Mapas y fuente de datos

### 9.1 Web

- React Leaflet + Leaflet.
- Centro inicial en Loja.
- `maxBounds` para impedir navegación fuera del área definida.
- Selector de ubicación en onboarding y mapa público reutilizan un componente base, pero con modos diferentes.
- Mostrar atribución visible del proveedor.

### 9.2 Móvil

- `react-native-maps`.
- Región inicial y límites de cámara para Loja donde la plataforma lo permita.
- Marcadores proceden únicamente de Django.
- No requiere login para mapa/listado/detalle.

### 9.3 OpenStreetMap

OSM se usará como mapa base/tiles, no como backend de parqueaderos. La política oficial exige atribución, caché conforme a headers y prohíbe descarga masiva/prefetch/offline. El servicio estándar es best-effort y sin SLA, por lo que el URL del proveedor debe ser configurable y se debe evaluar un proveedor de tiles para producción. Referencia: [OSMF Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/).

No se implementará:

```text
Cliente -> API OSM -> buscar parqueaderos
```

Sí se implementará:

```text
Cliente -> Django -> PostgreSQL -> parqueaderos
Mapa -> proveedor de tiles -> imagen cartográfica
```

## 10. Vista administrativa web

### 10.1 Rutas

- `/admin/solicitudes`
- `/admin/solicitudes/:id`
- `/admin/cuentas`
- `/admin/cuentas/:id`

Las rutas requieren sesión y rol administrador. La protección del frontend mejora UX; el backend sigue siendo la autoridad.

### 10.2 Lista de solicitudes

- Tabla densa y paginada, no tarjetas decorativas.
- Columnas: propietario, identificación, correo, parqueadero, fecha, estado.
- Filtros: estado, fecha y búsqueda por nombre/identificación/correo.
- Acciones con iconos y tooltips: revisar.
- Estados loading, vacío, error y retry.

### 10.3 Detalle

- Datos personales de solo lectura.
- Datos del parqueadero.
- Mapa Leaflet con marcador exacto.
- Enlace/visor seguro del documento.
- Estado y motivo previo si existe.
- Botones “Aprobar” y “Rechazar”.
- Modal de aprobación con confirmación explícita.
- Modal de rechazo con motivo obligatorio y confirmación.
- Toast/alerta de resultado; doble submit bloqueado.

### 10.4 Cuentas

- Tabla paginada con estado de cuenta/onboarding/parqueadero.
- Detalle con documento y ubicación.
- “Deshabilitar” abre modal destructivo con nombre de la cuenta.
- Tras confirmar se actualizan listas con invalidación React Query.

## 11. Seguridad y privacidad

### P0 obligatorio

1. Rotar los secretos versionados.
2. Retirar `.env` del índice y evitar nuevos secretos.
3. Guardar secretos solo en Render/Cloudflare/Supabase y `.env` local ignorado.
4. Mantener Drive privado; eliminar `anyone/reader`.
5. Validar extensión, MIME real, magic bytes, tamaño y nombre.
6. No incluir links de documentos en listados públicos ni logs.
7. Usar `is_active` para bloquear login.
8. Añadir throttling a login, registro, verificación y reenvío.

### Sesión

- Access JWT corto.
- Refresh con rotación y blacklist o cookie HttpOnly según decisión de despliegue.
- En móvil, refresh en `expo-secure-store`.
- En web, preferir cookie HttpOnly para refresh; si Render/Cloudflare/CORS lo impiden inicialmente, documentar el riesgo de `localStorage` y reforzar CSP.
- Logout invalida refresh.
- Deshabilitar cuenta invalida sesiones existentes.

### Correo

- Tokens aleatorios criptográficos, hash en DB, un solo uso y expiración.
- Respuestas de reenvío que no revelen si una cuenta existe.
- URLs de verificación configuradas por entorno.
- No enviar contraseña por correo.

### Permisos

| Recurso/acción | Anónimo | Propietario | Admin |
|---|---:|---:|---:|
| Parqueaderos públicos aprobados | Lectura | Lectura | Lectura |
| Parqueadero propio no aprobado | No | Lectura/escritura limitada | Lectura |
| Espacios propios | No | CRUD lógico | Lectura administrativa si se requiere |
| Tarifas/horarios propios | Público solo detalle aprobado | Escritura | Lectura |
| Documento propio | No | Subir/reemplazar | Revisar |
| Solicitudes/cuentas | No | Solo estado propio | Gestionar |
| Estancias | No | Solo parqueadero propio | No confirmado/solo soporte |

## 12. Estrategia de migraciones

No generar migraciones definitivas hasta aprobar el modelo objetivo.

1. Respaldar cualquier base existente. Existencia/datos actuales: **No confirmado**.
2. Crear migraciones iniciales versionadas y retirar `migrations/` de `.gitignore`.
3. Si no hay datos reales, preferir reconstrucción limpia del esquema.
4. Si hay datos, crear migraciones de esquema y datos separadas.
5. Convertir `Cuenta.persona` a OneToOne tras detectar duplicados.
6. Convertir `Parqueadero.propietario` a OneToOne tras detectar propietarios con múltiples parqueaderos.
7. Consolidar tarifas, tomando una fuente prioritaria aprobada.
8. Añadir `is_active/deleted_at` a espacios antes de reemplazar deletes físicos.
9. Migrar documentos a nuevos campos `drive_file_id/link`; validar objetos Drive existentes.
10. Eliminar campo `Parqueadero.tarifa` y modelos de estrategia solo después de migrar valores.
11. Aplicar constraints e índices después de limpiar conflictos.
12. Probar `migrate` desde base vacía y desde snapshot anonimizado.

Rollback:

- Cada migración destructiva requiere backup y script de verificación.
- Desplegar primero código compatible con ambos esquemas cuando sea necesario.
- No borrar columnas antiguas en el mismo despliegue que introduce las nuevas.

## 13. Plan de trabajo por fases

Las estimaciones son días ideales para una persona con experiencia full-stack, sin contar esperas de revisión o cuentas externas. Deben recalibrarse tras descubrir si existe una base con datos.

### Fase 0: Baseline y protección inmediata (1-2 días)

Dependencias: ninguna.

Tareas:

- Crear rama de estabilización.
- Rotar/retirar secretos.
- Registrar versiones de Python/Node soportadas.
- Confirmar si existe DB/Drive con datos reales.
- Congelar el modelo objetivo y catálogo de tipos/tarifas.
- Convertir `parkingPaTi.md` y este plan en baseline.

Criterio de aceptación:

- No hay secretos rastreados vigentes.
- Existe decisión escrita sobre datos existentes y migración.
- Modelo y estados son aprobados.

### Fase 1: Entorno backend reproducible (2-3 días)

Dependencias: Fase 0.

Tareas:

- Usar exclusivamente `backend/venv/` para desarrollo local.
- Corregir `DJANGO_SECRET_KEY` y templates `.env.example`.
- Eliminar dependencias WebSocket del objetivo.
- Añadir dependencias Google Drive y pruebas.
- Instalar requirements dentro del venv.
- Configurar PostgreSQL local/test.
- Añadir health endpoint y logging estructurado mínimo.
- Hacer pasar `manage.py check`.

Comandos objetivo:

```powershell
backend\venv\Scripts\python.exe -m pip install --upgrade pip
backend\venv\Scripts\python.exe -m pip install -r backend\requirements\dev.txt
backend\venv\Scripts\python.exe backend\manage.py check
```

No se instalará `daphne` solo para sostener WebSockets que serán retirados. Sí se instalarán dependencias realmente usadas: pytest, pytest-django, Google API/auth y servidor WSGI de producción.

Criterio de aceptación:

- Un clon limpio crea/usa venv, instala requirements y pasa `check`.
- No hay imports faltantes.

### Fase 2: Modelos, migraciones y contratos base (4-6 días)

Dependencias: Fase 1 y decisión sobre datos.

Tareas:

- Implementar relaciones OneToOne.
- Crear estados de cuenta/onboarding/habilitación.
- Consolidar tarifas.
- Incorporar borrado lógico de espacios.
- Crear estancia mínima.
- Crear migraciones y constraints.
- Uniformar error envelope y códigos HTTP.
- Publicar esquema OpenAPI inicial.

Criterio de aceptación:

- `makemigrations --check` no detecta cambios pendientes.
- `migrate` funciona en DB vacía.
- Tests de constraints y relaciones verdes.

### Fase 3: Registro, correo, parqueadero inicial y Drive (5-7 días)

Dependencias: Fase 2, credenciales de correo/Drive.

Tareas:

- Registro Persona/Cuenta.
- Confirmaciones en web.
- Verificación/reenvío de correo.
- Estado de onboarding y redirección.
- Mapa selector Loja.
- Guardado inicial del parqueadero.
- Adapter Drive privado y nombre requerido.
- Subida/reemplazo compensado.
- Envío de solicitud.

Criterio de aceptación:

- Flujo completo se puede interrumpir/reanudar.
- Documento queda privado, link/file ID coherentes.
- Cuenta no puede enviar solicitud sin verificar correo.

### Fase 4: Panel administrativo (4-6 días)

Dependencias: Fase 3.

Tareas:

- API admin paginada y permisos.
- Vistas de solicitudes/cuentas.
- Mapa/documento seguro.
- Aprobar/rechazar con motivos y confirmaciones.
- Deshabilitar con confirmación e invalidación de sesión.
- Correos de decisión.

Criterio de aceptación:

- Propietario no puede invocar endpoints admin.
- Acción concurrente repetida devuelve 409, no duplica transición.
- UI muestra confirmación antes y resultado después.

### Fase 5: Configuración final y espacios (5-7 días)

Dependencias: Fase 4.

Tareas:

- Guardar horarios y tarifas en lote.
- Crear cantidad inicial de espacios atómicamente.
- Grilla y edición individual.
- Agregar, renombrar, tipar, deshabilitar y borrar lógicamente.
- Conteos y disponibilidad transaccionales.
- Protección de espacio con estancia activa.

Criterio de aceptación:

- Primer ingreso aprobado obliga configuración final.
- No hay estados agregados obsoletos.
- Ninguna operación masiva queda parcialmente aplicada.

### Fase 6: Estancias y costo informativo (3-5 días)

Dependencias: Fase 5.

Tareas:

- Inicio con tarifa normal por defecto.
- Selección de tarifa activa.
- Locks/concurrencia.
- Fin, redondeo, snapshot y costo.
- Resumen visible “informativo”.
- Consulta limitada de registros mínimos según retención aprobada.

Criterio de aceptación:

- No pueden existir dos estancias activas por espacio.
- Cambiar tarifa después no altera una estancia iniciada.
- Casos 1 min, 60 min, 61 min y varias horas calculan correctamente.

### Fase 7: API pública, polling y retiro de WebSockets (3-5 días)

Dependencias: Fase 5; puede avanzar en paralelo con Fase 6 tras estabilizar modelos.

Tareas:

- Endpoint bbox y detalle público.
- Filtrar aprobados/activos.
- Índices/coordenadas y límites Loja.
- React Query web con 5 s.
- Retirar WebSockets/Redis/Channels.
- Tests de carga básicos del polling.

Criterio de aceptación:

- Un cambio del propietario aparece en web pública en máximo 10 s bajo condiciones normales.
- No quedan rutas, imports ni dependencias WebSocket.
- Fuera de bbox no se devuelven registros.

### Fase 8: Integración móvil real (4-6 días)

Dependencias: Fase 7.

Tareas:

- Instalación local limpia Expo.
- Añadir TanStack Query para React Native.
- Eliminar datos hardcodeados y login falso.
- Implementar servicio HTTP/adapter OpenAPI.
- Mapa/lista/detalle anónimos.
- Polling con pausa en background.
- Si se mantiene panel propietario móvil, autenticar y definir alcance; por defecto esta fase prioriza conductor anónimo.

Criterio de aceptación:

- TypeScript sin errores.
- Dispositivo/emulador consume Render/staging por HTTPS.
- Mapa presenta datos reales y refresca.

### Fase 9: CI, seguridad y rendimiento (3-5 días)

Dependencias: fases funcionales.

Tareas:

- GitHub Actions reales para backend/web/móvil.
- Lint web declarado e instalado.
- Tests unitarios, integración y contratos.
- Scanning de secretos/dependencias.
- Throttling y headers.
- Pruebas de permisos y carga polling.
- Optimizar imágenes/bundle web.

Criterio de aceptación:

- PR no integra si fallan checks.
- Matriz de permisos automatizada.
- Cobertura mínima acordada: propuesta 80% en servicios críticos, sin imponer porcentaje vacío al UI.

### Fase 10: Despliegue gratuito y aceptación (3-4 días)

Dependencias: Fase 9.

Tareas:

- Supabase proyecto y conexión segura.
- Render API, variables, build/start/health.
- Cloudflare Pages, SPA redirects y variables Vite.
- CORS/CSRF/hosts/HTTPS.
- Migraciones controladas.
- Smoke tests y UAT del flujo completo.
- Manual de operación y recuperación.

Criterio de aceptación:

- Web pública, API y móvil usan staging/producción por HTTPS.
- Flujo vertical completo aprobado.
- Se conocen y documentan limitaciones de tiers gratuitos.

### Estimación global

- Total secuencial: **34-51 días ideales** para una persona.
- Con dos personas (backend y clientes) y contratos estabilizados: **5-7 semanas calendario** aproximadas.
- No incluye espera de credenciales, revisión legal de documentos, publicación en tiendas ni migración compleja de datos desconocidos.

## 14. Estrategia de pruebas

### Backend

- Models/constraints: OneToOne, únicos, checks y estados.
- Serializers: inputs válidos, límites y errores de campo.
- Services: permisos, transacciones, concurrencia y compensación Drive.
- API: status codes, envelope, paginación y filtros.
- Correo: token, expiración, reuso, reenvío y enumeration resistance.
- Documentos: MIME falso, tamaño, reemplazo y privacidad.
- Estancias: redondeo, snapshots y doble inicio/fin.
- Bbox: límites, parámetros inválidos y visibilidad.

### Web

- Unitarias de validadores/adapters.
- Componentes de confirmación admin.
- Integración React Query con Mock Service Worker o equivalente.
- E2E: registro, verificación simulada, onboarding, revisión, configuración y consulta pública.
- Rutas por rol y estados de onboarding.

### Móvil

- Typecheck.
- Tests de adapter de API.
- Render de estados loading/error/empty/data.
- Mapa/lista con fixtures contractuales.
- AppState: polling pausado en background.
- Smoke Android físico/emulador.

### Pruebas de aceptación prioritarias

1. Un anónimo ve solo parqueaderos aprobados de Loja.
2. El registro no pierde datos si falla Drive/correo.
3. Admin puede revisar documento y ubicación antes de decidir.
4. Rechazar exige motivo; aprobar/deshabilitar exigen confirmación.
5. Cuenta deshabilitada no obtiene ni renueva tokens.
6. Primer login aprobado obliga configuración final.
7. Crear/borrar/deshabilitar espacios mantiene conteos correctos.
8. Polling refleja cambios en 5-10 segundos.
9. Estancia de 61 minutos cobra 2 horas al precio snapshot.
10. Ningún cliente consulta Supabase u OSM API para parqueaderos.

## 15. Despliegue objetivo

### 15.1 Cloudflare Pages

Configuración propuesta:

```text
Root directory: frontend-web
Build command: npm ci && npm run build
Output directory: dist
Variable: VITE_API_BASE_URL=https://<api>.onrender.com/api/v1
```

Agregar fallback SPA para React Router y headers/CSP. Cloudflare documenta `npm run build` y `dist` para proyectos Vite conectados a Git. Referencia: [Cloudflare Pages para Vite](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/).

### 15.2 Render Free

Configuración propuesta:

```text
Root directory: backend
Build: pip install -r requirements/prod.txt && python manage.py collectstatic --noinput
Pre-deploy/migration: python manage.py migrate --noinput
Start: gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
Health: /health/
```

Render exige enlazar el servicio a `0.0.0.0` y su `PORT`. El tier gratuito se duerme tras 15 minutos sin tráfico, puede tardar cerca de un minuto en despertar y tiene filesystem efímero; no se guardarán documentos localmente. Render indica que Free es para hobby/pruebas y no producción crítica. Referencias: [Render Web Services](https://render.com/docs/web-services) y [Render Free](https://render.com/docs/free).

Impacto del cold start:

- La primera consulta puede ser lenta.
- Polling solo mantiene despierto el servicio mientras existan usuarios activos; no se crearán pings artificiales para evadir límites.
- UI debe mostrar “Conectando con el servidor” y retry.

### 15.3 Supabase PostgreSQL Free

- Usar PostgreSQL de Supabase únicamente como DB.
- Django usa connection string por variable secreta.
- Para Render, evaluar Shared Pooler en modo session si la red requiere IPv4; Supabase lo recomienda para backends persistentes IPv4. Referencia: [Conectar a Supabase Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres).
- Ejecutar migraciones desde Render/CI con conexión apropiada.
- No exponer service keys al frontend.
- Configurar `CONN_MAX_AGE` de forma compatible con el pooler.

El plan Free actualmente incluye 500 MB de base; al superarlos entra en solo lectura, no incluye backups automáticos y puede pausarse tras una semana de inactividad. Referencias: [Supabase billing](https://supabase.com/docs/guides/platform/billing-on-supabase) y [database size](https://supabase.com/docs/guides/platform/database-size).

Consecuencias:

- El registro mínimo de estancias necesita política de retención y monitoreo de tamaño.
- Antes de producción real se requiere estrategia externa de backups o cambio de plan.
- Export periódico manual/automatizado debe diseñarse sin almacenar secretos en el repo.

### 15.4 Variables mínimas

Backend:

```text
DJANGO_SETTINGS_MODULE
DJANGO_SECRET_KEY
DJANGO_ALLOWED_HOSTS
CORS_ALLOWED_ORIGINS
CSRF_TRUSTED_ORIGINS
DATABASE_URL
GOOGLE_DRIVE_CREDENTIALS_JSON o ruta segura
GOOGLE_DRIVE_FOLDER_ID
EMAIL_HOST / EMAIL_PORT / EMAIL_USER / EMAIL_PASSWORD
DEFAULT_FROM_EMAIL
FRONTEND_BASE_URL
```

Web:

```text
VITE_API_BASE_URL
VITE_TILE_URL
VITE_TILE_ATTRIBUTION
VITE_LOJA_BOUNDS
```

Móvil: configuración Expo por ambiente, nunca IP privada hardcodeada.

## 16. Mapeo de hallazgos de `parkingPaTi.md`

| Hallazgo | Tratamiento planificado | Fase |
|---:|---|---:|
| 1 backend no arranca | Variables/dependencias/venv | 1 |
| 2 creación parqueadero rota | Nuevo onboarding por capas | 2-3 |
| 3 listado público roto | Endpoint bbox/DTO único | 7 |
| 4 delete opera sobre espacio | Servicios/repositorios separados + tests | 2/5 |
| 5 disponibilidad incorrecta | Reglas y conteos transaccionales | 5 |
| 6 file_id inconsistente | Adapter Drive compensado | 3 |
| 7 sin migraciones | Migraciones versionadas | 2 |
| 8 WebSocket divergente | Retiro total, polling | 7 |
| 9 móvil roto | Instalación/adapters/API | 8 |
| 10 registro descarta datos | Onboarding reanudable | 3 |
| 11 categoría no se limpia | Modelo tarifa/espacio nuevo | 2/5 |
| 12 secretos | Rotación y secret management | 0 |
| 13 documentos públicos | Drive privado | 3 |
| 14 validación superficial | MIME/magic bytes/scan definido | 3/9 |
| 15 login móvil falso | Retirar; conductor anónimo | 8 |
| 16 JWT localStorage | Estrategia de sesión | 3/9 |
| 17 estado no bloquea auth | `is_active` | 2-4 |
| 18 sin throttling | DRF/proxy throttling | 3/9 |
| 19 WS sin autorización | Eliminado | 7 |
| 20 lecturas sin propiedad | Matriz de permisos | 2/9 |
| 21 tarifa duplicada | Consolidación de modelo | 2 |
| 22 errores divergentes | Envelope/códigos | 2 |
| 23 contrato móvil distinto | OpenAPI + adapter | 2/8 |
| 24 docs vacías | Actualización de SRS/ADR/README | Todas/10 |
| 25 zona | UTC + America/Guayaquil | 2 |
| 26 settings development | Settings/Render correctos | 1/10 |
| 27 pruebas nulas | Pirámide de pruebas/CI | Todas/9 |
| 28 infraestructura vacía | CI y despliegue reales | 9-10 |
| 29 código muerto/grande | Limpieza tras tests | 7-9 |
| 30 validaciones divergentes | Backend autoritativo + contratos | 2-5 |

## 17. Orden de ejecución y dependencias

```text
F0 Seguridad/baseline
  -> F1 Entorno reproducible
      -> F2 Modelos/migraciones/contratos
          -> F3 Registro/onboarding/Drive
              -> F4 Administración
                  -> F5 Configuración/espacios
                      ├──> F6 Estancias
                      └──> F7 API pública/polling
                              -> F8 Móvil
                                  -> F9 CI/hardening
                                      -> F10 Despliegue/UAT
```

Paralelización segura:

- Diseño UI admin puede iniciar durante F2 con fixtures OpenAPI.
- Web pública y móvil pueden desarrollar contra fixtures después de congelar contrato F2.
- F6 y F7 pueden ejecutarse en paralelo tras F5.
- Despliegue base de staging puede prepararse durante F3, pero no promoverse antes de F9.

## 18. Backlog priorizado

### P0

- Secretos y acceso Drive.
- Backend/venv reproducible.
- Modelo objetivo y migraciones.
- Creación/listado/eliminación de parqueadero.
- Contrato de auth/errores.

### P1

- Registro completo y verificación de correo.
- Panel administrativo y deshabilitación.
- Configuración final y espacios.
- Disponibilidad/conteos.
- Polling y API pública.
- Integración móvil.

### P2

- Estancias/costo informativo.
- CI, pruebas de carga y seguridad.
- Deploy Cloudflare/Render/Supabase.
- Documentación operativa.

### P3

- Mejoras de UX, rendimiento de mapas y optimización de imágenes.
- Proveedor de tiles con SLA si el uso crece.
- Plan pago/backups cuando el proyecto deje de ser experimental.

## 19. Decisiones pendientes antes de implementar

Estas decisiones no deben asumirse en código:

1. Bounding box exacto permitido para Loja.
2. Catálogo de tipos de espacio.
3. Tarifas adicionales definitivas y sus nombres visibles.
4. Retención del registro mínimo de estancias.
5. Si un propietario rechazado puede editar todo o solo campos señalados.
6. Si se requiere rehabilitar cuentas deshabilitadas.
7. Proveedor SMTP/correo.
8. Cuenta/folder de Google Drive y política de permisos del administrador.
9. Estrategia final de refresh JWT web: cookie HttpOnly o almacenamiento temporal documentado.
10. Existencia de datos reales que deban migrarse.
11. Alcance propietario en móvil; el requisito confirmado es consulta anónima.
12. Proveedor de tiles para producción si no se acepta el servicio best-effort de OSM.

## 20. Definición de terminado

Una historia se considera terminada solo si:

- Respeta controller -> DTO -> service -> repository -> model.
- Incluye permisos y validación backend.
- Incluye migración cuando cambia esquema.
- Tiene pruebas automatizadas del caso exitoso y fallos relevantes.
- Actualiza OpenAPI y tipos/adapters de clientes.
- Maneja loading, empty, error y retry en UI.
- No introduce secretos, datos demo ni URLs/IP hardcodeadas.
- No añade WebSockets ni acceso directo a OSM API/Supabase desde clientes.
- Pasa format, lint, typecheck, tests y build.
- Tiene criterios de aceptación demostrables.

## 21. Criterio de aceptación final del proyecto

La fase de correcciones se considerará completa cuando se demuestre en staging el flujo:

```text
registro propietario
-> verificación de correo
-> selección de ubicación en Loja
-> creación de parqueadero inicial
-> carga privada de documento en Drive
-> envío de solicitud
-> revisión visual administrativa
-> aprobación con confirmación
-> primer ingreso y configuración final
-> creación/edición lógica de espacios
-> inicio y fin de estancia con cálculo informativo
-> consulta anónima web y móvil
-> actualización por polling en 5-10 segundos
-> deshabilitación administrativa que bloquea acceso y oculta parqueadero
```

Además:

- Backend arranca desde clon limpio usando `backend/venv`.
- Migraciones crean una Supabase/PostgreSQL vacía.
- Web se despliega en Cloudflare Pages.
- Django se despliega en Render y usa Supabase PostgreSQL.
- Móvil compila y consume HTTPS sin IP local.
- No quedan WebSockets, Channels, Redis de disponibilidad ni endpoints OSM para parqueaderos.
- No se implementan reservas ni pagos.
- Documentos permanecen privados y los secretos están fuera de Git.

## 22. Corrección de sesión y redirecciones por rol (2026-07-17)

- Web limpia por completo la caché privada de React Query al iniciar y cerrar sesión para evitar datos residuales entre cuentas.
- El login consulta `GET /api/v1/auth/me/` con el token nuevo antes de decidir el destino.
- La ruta de onboarding valida primero rol y estado; un administrador no monta vistas ni endpoints de propietario.
- Las rutas del propietario fuerzan `CONFIGURACION_PENDIENTE` hacia `/owner/configuration` y `ACTIVO` hacia `/owner/dashboard`.
- Las rutas administrativas redirigen propietarios según su estado real, no siempre hacia onboarding.
- Verificación real: `npm.cmd test` (22/22), `npm.cmd run lint` y `npm.cmd run build` exitosos.
- Prueba interactiva en navegador: **No confirmado**, porque no había un navegador conectado en la sesión de verificación.
