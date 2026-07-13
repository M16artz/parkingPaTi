# ParkingPaTi - Revisión Técnica del Proyecto

> Fecha de revisión: 2026-07-12  
> Alcance: estado actual del árbol de trabajo, incluidos los cambios locales no confirmados que ya existían al iniciar la revisión.  
> Restricción aplicada: no se modificó código funcional. Este documento es el único archivo fuente agregado por la revisión.

## 1. Resumen ejecutivo

ParkingPaTi parece ser una plataforma para consultar y administrar parqueaderos de Loja, Ecuador. El repositorio contiene tres piezas: una API Django REST, una aplicación web React orientada principalmente al propietario y una aplicación móvil Expo orientada a conductores y propietarios. El dominio cubre cuentas, parqueaderos, ubicación, espacios, horarios, tarifas, documentos de habilitación y disponibilidad en tiempo real.

El diseño declarado es cliente-servidor y por capas, con controladores, DTOs, servicios y repositorios por módulo. Esa intención sí se reconoce en el backend. También existen JWT, permisos por rol, transacciones en algunos procesos, paginación parcial, validaciones de archivos y WebSockets con Django Channels. La web ya consume buena parte de la API y su build de producción finaliza correctamente.

Sin embargo, el sistema completo **no está desplegable ni operable en el estado revisado**. El backend no inicia con la configuración versionada: espera `DJANGO_SECRET_KEY`, pero el `.env` raíz define otro nombre; luego falla por la dependencia no declarada/no instalada `daphne`. No existen migraciones reales, pruebas implementadas ni pipelines CI funcionales. Incluso resolviendo el arranque, hay fallos deterministas en creación, listado y eliminación de parqueaderos. La aplicación móvil es un prototipo con datos simulados y autenticación aparente, no una integración funcional.

Los riesgos prioritarios son:

1. Un `.env` real con credenciales y clave Django está versionado.
2. Los documentos de propietarios se publican en Google Drive con acceso para cualquiera que tenga el enlace, y solo se valida extensión/tamaño.
3. No hay migraciones, por lo que no existe un procedimiento reproducible para crear el esquema.
4. El flujo de parqueaderos contiene varias roturas de ejecución y una eliminación dirigida al tipo de entidad equivocado.
5. Registro web, móvil, documentación, infraestructura y contratos presentan grandes diferencias frente a lo que la interfaz promete.

No se encontró implementación de reservas, pagos, cobros, historial de ocupación, notificaciones push móviles, recuperación de contraseña ni cuentas de conductor. Cualquier existencia de esos requisitos fuera del repositorio queda como **No confirmado**.

## 2. Interpretación general del proyecto

### Propósito interpretado

El sistema intenta resolver dos necesidades:

- Permitir a conductores localizar parqueaderos y consultar ubicación, horario y disponibilidad.
- Permitir a propietarios registrar su cuenta y administrar parqueadero, espacios, estado operativo, horarios, tarifas y documento habilitante.
- Permitir a administradores validar parqueaderos, documentos y cuentas de otros usuarios.

Es un sistema transaccional cliente-servidor con API REST y un canal WebSocket para cambios de disponibilidad. No es, en su estado actual, un sistema de reservas o pagos: el núcleo implementado es descubrimiento y gestión operativa de espacios.

### Actores detectados

| Actor | Evidencia | Estado |
|---|---|---|
| Conductor/cliente anónimo | Listado público, mapa y horarios; `frontend-movil/src/screens/MapScreen.tsx`, `ListScreen.tsx` | Parcial; móvil usa datos locales |
| Propietario | Rol `PROPIETARIO`, dashboard web, CRUD de parqueadero/espacios/horarios/tarifas/documentos | Parcial y con flujos rotos |
| Administrador | Rol `ADMINISTRADOR`, creación administrativa y acciones `validar` | Parcial; no hay interfaz administrativa completa |
| Servicio Google Drive | Almacenamiento de documentos | Parcial; dependencias ausentes y seguridad insuficiente |
| Cliente WebSocket | Observa cambios de espacios | Parcial; web tiene URL incompleta y móvil usa otra ruta |

### Módulos principales

- `usuarios`: Persona, Cuenta, registro, login JWT, CRUD y permisos.
- `parqueaderos`: Parqueadero, Dirección, Ubicación, Espacio y disponibilidad.
- `tarifas`: estrategia normal, incremento, descuento y categorías por vehículo.
- `horarios`: horario por parqueadero y día.
- `documentos`: carga, reemplazo, eliminación y validación administrativa.
- `frontend-web`: registro/login, sitio público y dashboard del propietario.
- `frontend-movil`: mapa/lista y pantallas de propietario actualmente simuladas.
- `infra`, `deploy`, `.github`: estructura reservada, pero los archivos están vacíos.

## 3. Tecnologías detectadas

| Área | Tecnología | Evidencia/observación |
|---|---|---|
| Backend | Python, Django 5.1.4 | `backend/requirements/base.txt` |
| API | Django REST Framework 3.17.1 | ViewSets, APIViews y serializers |
| Autenticación | SimpleJWT 5.3.1 | Access de 15 min y refresh de 1 día |
| Tiempo real | Channels 4.1.0, channels-redis 4.2.1, ASGI | In-memory en desarrollo, Redis en producción |
| Base de datos | PostgreSQL mediante psycopg 3 | Settings de desarrollo/producción |
| Backend productivo | Uvicorn/Gunicorn declarados | No confirmado en ejecución; scripts e infraestructura vacíos |
| Web | React 18, Vite 5, React Router, Axios | `frontend-web/package.json` |
| UI web | Tailwind CSS, Framer Motion, Lucide, Leaflet | Componentes y vistas web |
| Estado web | Estado local React | React Query y Zustand están instalados, pero su uso no fue detectado |
| Móvil | Expo 54, React Native 0.81, React 19 | `frontend-movil/package.json` |
| Mapas/geolocalización | React Native Maps, Expo Location, React Leaflet/OpenStreetMap | Móvil y registro web |
| Archivos externos | API de Google Drive | Código presente; paquetes Google ausentes de requirements |
| Pruebas | pytest/pytest-django declarados | No instalados en el venv; archivos de prueba vacíos |
| Infraestructura | Docker, Nginx, Cloudflared sugeridos | Todos los archivos correspondientes están vacíos |
| CI/CD | GitHub Actions sugerido | Los cuatro workflows están vacíos |

La versión exacta y el estado de seguridad de dependencias Python quedan **No confirmados** mediante auditoría de vulnerabilidades. Los audits npm offline reportaron 0 vulnerabilidades conocidas en la caché local, pero no consultaron una base actual en línea.

## 4. Arquitectura detectada

### Backend

La arquitectura intentada es modular y por capas:

1. `controllers.py`: transporte HTTP y permisos de entrada.
2. `serializers_dto.py`: contratos y validación.
3. `services.py`: reglas de negocio y autorización sobre recursos.
4. `repositories.py`: consultas ORM y persistencia.
5. `models.py`: esquema de dominio/persistencia.
6. `core/`: excepciones, paginación, permisos y utilidades transversales.

Se observan Repository, Service Layer, DTO, Strategy por herencia para tarifas y Observer/pub-sub mediante Channels. La división es reconocible, pero no siempre coherente: algunos controladores consultan repositorios directamente; `DocumentoViewSet` combina `ModelViewSet`, queryset, servicios y permisos propios; y `ParqueaderoService` contiene métodos de `Espacio` con nombres de parqueadero.

### Frontend web

La web intenta una variante de MVC/MVVM ligera:

- `views`: presentación.
- `controllers`: hooks que coordinan estado y casos de uso.
- `services`: contratos HTTP y almacenamiento de JWT.
- `utils/validators`: validación local.
- `config`: rutas y URL base.

La estructura es razonable, aunque hay componentes de cientos de líneas y comentarios extensos que narran parches anteriores. `src/App.jsx` es un banco de prueba muerto porque `main.jsx` monta directamente `RouterProvider`.

### Frontend móvil

Usa Context + navegación por stack/tabs. La capa de servicio existe, pero el proveedor inicia tres parqueaderos fijos y no carga la API. Las pantallas de administración mutan estado local. El hook real-time está desactivado y no compila con el contrato actual del contexto.

### Evaluación de coherencia

La arquitectura conceptual es apropiada para el tamaño del dominio, pero la implementación mezcla estados de prototipo con código supuestamente productivo. Hay contratos duplicados entre backend, web y móvil sin una fuente compartida ni OpenAPI. No hay pruebas que protejan los límites entre capas.

## 5. Estructura del proyecto

```text
parkingPaTi/
├── backend/
│   ├── apps/{usuarios,parqueaderos,tarifas,horarios,documentos}/
│   ├── config/settings/       # base, development, production
│   ├── core/                  # permisos, errores, paginación, repositorios
│   ├── requirements/          # base, dev, prod
│   └── tests/                 # sin pruebas reales
├── frontend-web/
│   ├── src/{config,controllers,hooks,services,utils,views}/
│   └── tests/                 # solo .gitkeep
├── frontend-movil/
│   ├── src/{components,context,hooks,navigation,screens,services}/
│   └── assets/
├── docs/                      # 14 documentos declarados, todos vacíos
├── infra/                     # Docker/Nginx/Cloudflared, archivos vacíos
├── deploy/                    # entornos/scripts vacíos
├── .github/workflows/         # workflows vacíos
├── scripts/                   # seed/setup vacíos
└── .env                       # archivo real versionado
```

El repositorio rastrea además archivos `__pycache__/*.pyc`, que son artefactos de máquina y no deberían estar versionados.

## 6. Requisitos que cumple

### 6.1 Requisitos funcionales cumplidos

- Modelado de personas y cuentas con roles de propietario/administrador.
- Registro público que fuerza rol `PROPIETARIO` y creación administrativa protegida.
- Emisión y refresh de JWT con claims `username` y `rol`.
- Modelado de parqueaderos, dirección, coordenadas, espacios, estados y validación administrativa.
- Modelado de horarios con unicidad por parqueadero/día y validación apertura < cierre.
- Modelado de tarifas normales, incrementos, descuentos y categorías.
- Carga de documento con límite de 5 MB y extensiones PDF/JPG/PNG.
- API pública conceptual para parqueaderos validados y horarios.
- API autenticada para gestión del propietario.
- Build productivo de la web completado correctamente.
- Manejo central de excepciones DRF para errores lanzados como excepciones.

### Requisitos no funcionales presentes

- Contraseñas creadas con `create_user` y validadores Django.
- JWT de vida corta y refresh separado.
- CORS por lista de orígenes, no globalmente permisivo.
- Cookies seguras y redirección HTTPS en settings de producción.
- Transacciones en registro, creación de parqueadero y parte de tarifas/documentos.
- Índices y restricciones de unicidad en modelos.
- Paginación con máximo de 100 en varios listados.
- Separación parcial por capas y whitelists contra mass assignment.
- Errores 500 sin detalle interno al cliente y logging de excepciones.

### 6.2 Requisitos parcialmente cumplidos

- **Registro integral de propietario:** crea Persona/Cuenta, pero descarta parqueadero, ubicación y documento capturados por la web.
- **Gestión de parqueaderos:** modelos y endpoints existen, pero crear/listar/eliminar están rotos.
- **Disponibilidad en tiempo real:** backend publica eventos, pero crear/eliminar no notifican; la URL web es incompleta y móvil usa una ruta inexistente.
- **Administración:** hay acciones de validación, pero no interfaz completa; el administrador no puede listar documentos ajenos.
- **Gestión de espacios:** web integrada, pero el estado agregado se recalcula incorrectamente y no se sincroniza en altas/bajas.
- **Tarifas:** CRUD existe, pero faltan límites de precios/porcentajes, control de lectura y contrato único.
- **Documentos:** el flujo existe, pero dependencias faltan, archivos son públicos y el reemplazo deja `file_id` inconsistente.
- **Escalabilidad:** Redis está configurado para producción, pero no hay despliegue real; `mios` no pagina y varias operaciones hacen llamadas secuenciales.
- **Mantenibilidad:** capas claras en intención, sin pruebas ni migraciones que permitan evolucionarlas con seguridad.
- **Seguridad por rol:** buena parte de las mutaciones valida propietario/admin, pero hay rutas/UI y lecturas sin control consistente.

### 6.3 Requisitos faltantes o no confirmados

- Reservas de espacios: ausente.
- Pagos, cobros, facturación o integración bancaria: ausente.
- Historial de ocupación, auditoría o trazabilidad: ausente.
- Recuperación/cambio de contraseña por correo: ausente.
- Verificación de correo: ausente.
- Cuenta/rol de conductor: ausente; el conductor opera como anónimo.
- Notificaciones push móviles: ausente.
- Cálculo efectivo de tarifa final por tiempo/incremento/descuento: ausente.
- Geocodificación o búsqueda geoespacial por radio/distancia: ausente.
- Panel de administración propio: No confirmado; solo existe Django Admin sin registros `admin.py` detectados.
- Observabilidad productiva, métricas, health checks, trazas y alertas: ausente.
- Backups, recuperación y política de retención: No confirmado.
- Accesibilidad y pruebas cross-browser: No confirmado.
- Requisitos formales SRS/ADR: no se pueden confirmar porque los archivos están vacíos.

## 7. Flujos principales detectados

### 7.1 Registro y login web

- **Archivos:** `useRegisterController.js`, `authService.js`, `usuarios/controllers.py`, `serializers_dto.py`, `services.py`, `repositories.py`.
- **Entrada:** nombres, apellidos, tipo/número de identificación, correo y contraseña. La UI además pide datos del parqueadero y documento.
- **Proceso:** web mapea `CEDULA` a `CI`, usa correo como `username`, registra Persona/Cuenta en transacción y luego solicita tokens.
- **Salida:** `CuentaDetalleDTO`; después `{refresh, access, username, rol}` guardado en `localStorage`.
- **Fallos:** los datos de parqueadero/documento no se envían; validación web indica 6 caracteres pero backend exige al menos 8 y validadores adicionales; no hay rollback de cuenta si falla el login posterior; duplicados concurrentes pueden terminar como error no controlado.

### 7.2 Gestión de cuenta

- **Archivos:** `usuarios/controllers.py`, `CuentaActualizarDTO`, `CuentaService`.
- **Entrada:** correo, contraseña y/o `estado`.
- **Proceso:** propietario solo accede a su ID; admin lista/elimina y puede acceder a cualquier cuenta.
- **Salida:** detalle o 204.
- **Fallos:** desactivar `estado` no desactiva `is_active`, por lo que no bloquea autenticación; muchos “no existe” devuelven 400 en vez de 404.

### 7.3 Alta y consulta de parqueadero

- **Archivos:** `parqueaderos/controllers.py`, `serializers_dto.py`, `services.py`, `repositories.py`.
- **Entrada:** nombre, dirección y coordenadas; JWT del propietario.
- **Proceso esperado:** crear Parqueadero + Dirección + Ubicación en transacción; admin valida; público lista solo activos/validados.
- **Salida esperada:** `ParqueaderoDetalleDTO` o página de `ParqueaderoResumenDTO`.
- **Fallos:** el DTO no tiene `to_direccion_datos()`/`to_ubicacion_datos()`, la firma del servicio no acepta los argumentos del controlador, el repositorio usa un enum inexistente y el resumen no implementa `get_espacios_disponibles()`.

### 7.4 Gestión de espacios y disponibilidad

- **Archivos:** `EspacioViewSet`, `EspacioService`, `EspacioRepository`, `useEspacioController.js`.
- **Entrada:** parqueadero, número; PATCH con estado/categoría.
- **Proceso:** valida propietario/admin, persiste espacio, recalcula disponibilidad en cambios de estado y emite evento Channels.
- **Salida:** `EspacioDTO`; eventos con IDs, estado y conteo disponible.
- **Fallos:** alta/baja no recalculan ni notifican; todos inhabilitados terminan `LLENO`; categoría no puede limpiarse con `null`; retrieve permite a cualquier autenticado leer por ID; el borrado masivo web no es atómico.

### 7.5 Horarios

- **Archivos:** `horarios/*`, `horarioService.js`, `useOwnerConfigGController.js`.
- **Entrada:** parqueadero, día, apertura y cierre.
- **Proceso:** crea/actualiza/elimina por día, con unicidad y autorización del propietario.
- **Salida:** lista no paginada de DTOs o entidad modificada.
- **Fallos:** PUT acepta todos los campos como opcionales; lectura pública no oculta horarios de parqueaderos no validados; el frontend dispara hasta siete operaciones independientes sin transacción global.

### 7.6 Tarifas

- **Archivos:** `tarifas/*`, `tarifaService.js`, `useOwnerConfigGController.js`.
- **Entrada:** parqueadero, precio, porcentaje o código de categoría.
- **Proceso:** crea una estrategia OneToOne o hace upsert de categoría; mutaciones comprueban propietario/admin.
- **Salida:** DTO paginado o entidad.
- **Fallos:** cualquier autenticado lista/consulta estrategias de cualquier parqueadero; precios normales y porcentajes aceptan negativos o valores sin rango de negocio; no existe cálculo/aplicación de la estrategia.

### 7.7 Documentos

- **Archivos:** `documentos/controllers.py`, `services.py`, `storage_backends.py`.
- **Entrada:** multipart `archivo` y fecha opcional.
- **Proceso:** sube a Drive, publica enlace, crea OneToOne; admin valida; reemplazo invalida de nuevo.
- **Salida:** ID, cuenta, validez, expiración y URL pública.
- **Fallos:** paquetes Google no declarados, configuración no confirmada, admin no lista documentos ajenos, contenido público, verificación superficial y reemplazo inconsistente de `file_id`.

### 7.8 Consulta móvil

- **Archivos:** `ParkingContext.tsx`, `parkingService.ts`, pantallas mapa/lista.
- **Entrada:** ninguna autenticación para conductor; credenciales no vacías para propietario.
- **Proceso real:** usa tres registros hardcodeados y navegación local.
- **Salida:** mapa/lista demo y dashboard demo.
- **Fallos:** API devuelve página y nombres españoles anidados, pero móvil espera arreglo y campos ingleses planos; IP fija; WebSocket incorrecto; hook deshabilitado/roto; login no llama backend.

## 8. Contratos detectados

### API y DTOs

| Contrato | Entrada/salida principal | Observaciones |
|---|---|---|
| `RegistroDTO` | nombre, apellido, tipo, identificación, username, correo, password | Rol forzado a propietario |
| `CustomTokenObtainPairSerializer` | username/password → access, refresh, username, rol | Web mapea correo a username |
| `CuentaDetalleDTO` | cuenta + Persona anidada | `rol` es solo lectura |
| `ParqueaderoCrearDTO` | nombre, dirección plana, latitud, longitud | Helpers incompletos |
| `ParqueaderoResumenDTO` | id, nombre, ubicación, disponibilidad, disponibles | Método calculado ausente |
| `ParqueaderoDetalleDTO` | dirección/ubicación/espacios anidados | Omite el campo legado `tarifa` |
| `EspacioDTO` | id, parqueadero, número, estado, categoría | parqueadero read-only en salida normal |
| `HorarioAtencion*DTO` | parqueadero, día, apertura, cierre | Crear/actualizar separados |
| `Estrategia/Incremento/DescuentoDTO` | parqueadero, precio, porcentaje | Sin mínimos/rangos |
| `CategoriaTarifaDTO` | parqueadero, código, precio | Crear usa integer para FK y upsert |
| `DocumentoEscrituraDTO` | archivo, expiración | Extensión + 5 MB |
| `DocumentoLecturaDTO` | cuenta, validez, expiración, URL | Expone URL pública; omite `file_id` |
| WebSocket backend | espacio_id, parqueadero_id, estado, disponibles | Emisor añade número, consumer lo elimina |

### Formato de respuestas

- Listados paginados: `{count, next, previous, results}` en cuentas, parqueaderos, espacios y tarifas.
- Horarios y `parqueaderos/mios`: arreglos sin paginar.
- Excepciones DRF: `{error: true, detail, code}`.
- Respuestas manuales de error: normalmente solo `{detail}`; por tanto el contrato de errores no es uniforme.
- No existe especificación OpenAPI/Swagger ni esquema compartido. La documentación en `docs/` está vacía.

### Coherencia entre clientes y backend

- **Web auth:** coherente mediante mapeos explícitos, aunque usa correo como username por convención implícita.
- **Web parqueaderos:** entrada coherente en servicio, pero backend de creación está roto.
- **Web registro:** inconsistente; la interfaz exige datos que el caso de uso descarta.
- **Web WebSocket:** inconsistente; `WS_BASE_URL` no está exportado y espera `numero_espacio` que el consumer no envía.
- **Móvil REST:** inconsistente en envoltura, nombres, tipos y estructura de ubicación.
- **Móvil WebSocket:** ruta y mensaje incompatibles.
- **Modelos/migraciones:** no contrastables; no hay migraciones. Estado: **No confirmado** en una base real.

## 9. Casos de uso cubiertos

| Caso de uso | Clasificación | Evidencia |
|---|---|---|
| Registrar cuenta de propietario | Implementado | `usuarios/controllers.py:30`, web `authService.js:70` |
| Login/refresh JWT web | Implementado | `usuarios/urls.py:20`, `apiClient.js:50` |
| Crear cuenta por administrador | Implementado | `usuarios/controllers.py:52` |
| Consultar/editar cuenta propia | Implementado | `usuarios/controllers.py:112` |
| Listar/eliminar cuentas como admin | Implementado | `usuarios/controllers.py:88` |
| Crear parqueadero | Inconsistente o roto | `parqueaderos/controllers.py:40`, `services.py:33` |
| Listar parqueaderos públicos | Inconsistente o roto | `repositories.py:29`, DTO resumen |
| Validar parqueadero | Parcial | Endpoint existe; no hay UI/admin probado |
| Eliminar parqueadero | Inconsistente o roto | `ParqueaderoService.eliminar` elimina Espacio |
| Gestionar espacios web | Parcial | CRUD presente; sincronización agregada incompleta |
| Actualizar disponibilidad en vivo | Parcial | Channels presente; clientes/altas/bajas incompletos |
| Gestionar horarios | Implementado por inspección | Sin pruebas ni base confirmada |
| Gestionar tarifas por categoría | Parcial | CRUD/upsert presente; sin cálculo ni validación completa |
| Estrategias incremento/descuento | Parcial | Persistencia CRUD; no se aplican a cobros |
| Subir documento | Parcial/no ejecutable | Faltan dependencias/configuración Drive |
| Validar documento | Parcial | Acción admin por ID; listado admin roto |
| Buscar parqueaderos en móvil | No implementado realmente | Datos hardcodeados en contexto |
| Login propietario móvil | Inconsistente o roto | Cualquier credencial no vacía entra |
| Reservar espacio | No implementado pero sugerido por el dominio | Sin modelo/ruta/servicio |
| Pagar estacionamiento | No implementado | Sin código relacionado |
| Recuperar contraseña/verificar correo | No implementado | Sin rutas o servicios |

## 10. Errores encontrados

### Hallazgo 1: El backend no arranca con la configuración versionada

- Tipo: Error
- Severidad: Crítica
- Archivo(s): `.env`, `backend/config/settings/base.py`, `backend/requirements/base.txt`
- Descripción: Settings exige `DJANGO_SECRET_KEY`, mientras `.env` define `SECRET_KEY`. Al inyectar una clave temporal, el arranque falla después porque `daphne` está en `INSTALLED_APPS` pero no en requirements/venv.
- Evidencia: `manage.py check` produjo `ValueError: DJANGO_SECRET_KEY must be set`; segunda ejecución produjo `ModuleNotFoundError: No module named 'daphne'`.
- Impacto: Ningún endpoint, migración ni prueba Django puede ejecutarse de forma reproducible.
- Recomendación: Unificar nombres de variables, declarar `daphne` o retirar su app según el servidor elegido, validar instalación desde cero y agregar un smoke test CI.

### Hallazgo 2: Creación de parqueadero tiene contratos internos incompatibles

- Tipo: Error
- Severidad: Crítica
- Archivo(s): `backend/apps/parqueaderos/controllers.py:40`, `serializers_dto.py:58`, `services.py:33`
- Descripción: El controlador llama `dto.to_direccion_datos()` y `dto.to_ubicacion_datos()`, métodos inexistentes, y luego invoca `ParqueaderoService.crear(propietario=..., direccion_datos=..., ...)`; el servicio espera `(parqueadero_id, numero_espacio, cuenta_solicitante, estado)` y crea un Espacio.
- Evidencia: Comparación directa de firma y llamadas.
- Impacto: `POST /api/parqueaderos/` falla siempre antes de crear el parqueadero.
- Recomendación: Restaurar el caso de uso de creación de parqueadero en el servicio y completar los mapeos del DTO; cubrirlo con prueba de integración.

### Hallazgo 3: Listado público de parqueaderos falla por dos errores deterministas

- Tipo: Error
- Severidad: Crítica
- Archivo(s): `backend/apps/parqueaderos/repositories.py:28`, `serializers_dto.py:31`
- Descripción: El repositorio usa `Parqueadero.Disponibilidad`, aunque `Disponibilidad` es una clase de módulo, y `ParqueaderoResumenDTO` declara `SerializerMethodField` sin `get_espacios_disponibles`.
- Evidencia: No existe atributo interno `Disponibilidad` en el modelo ni método requerido en el serializer.
- Impacto: `GET /api/parqueaderos/` falla al construir el queryset o serializar resultados.
- Recomendación: Referenciar el enum importado y definir/usar correctamente el conteo anotado; agregar prueba con cero y varios registros.

### Hallazgo 4: El endpoint de eliminar parqueadero opera sobre Espacio

- Tipo: Error
- Severidad: Crítica
- Archivo(s): `backend/apps/parqueaderos/controllers.py:74`, `services.py:65`
- Descripción: `ParqueaderoViewSet.destroy` llama `ParqueaderoService.eliminar(pk, user)`, pero ese método busca `Espacio` por el mismo ID y lo elimina.
- Evidencia: `EspacioRepository.obtener_por_id` y `EspacioRepository.eliminar` dentro del método.
- Impacto: Puede borrar un espacio no relacionado en lugar del parqueadero solicitado, o responder que no existe si los IDs no coinciden.
- Recomendación: Implementar eliminación sobre `ParqueaderoRepository`, verificar propiedad y añadir pruebas que aseguren el tipo e ID eliminados.

### Hallazgo 5: Disponibilidad agregada se calcula y sincroniza incorrectamente

- Tipo: Error
- Severidad: Alta
- Archivo(s): `backend/apps/parqueaderos/services.py:101`, `services.py:107`, `services.py:148`
- Descripción: Crear/eliminar espacios no recalcula ni notifica. En el cálculo, `libres == 0` se evalúa antes que “todos inhabilitados”, haciendo inalcanzable `FUERA_DE_SERVICIO` cuando todos están inhabilitados; cero espacios queda `LLENO`.
- Evidencia: Orden de condiciones y ausencia de llamadas en `EspacioService.crear/eliminar`.
- Impacto: La disponibilidad pública y en tiempo real puede ser falsa o quedar obsoleta.
- Recomendación: Definir reglas explícitas para cero/todos inhabilitados, centralizar mutación + recálculo + evento en una transacción y probar la matriz completa.

### Hallazgo 6: Reemplazo de documento pierde la referencia al nuevo archivo

- Tipo: Error
- Severidad: Alta
- Archivo(s): `backend/apps/documentos/services.py:78`, `repositories.py:24`
- Descripción: El servicio sube un archivo nuevo, borra el anterior y pasa `file_id=nuevo_file_id`, pero la whitelist del repositorio omite `file_id`; además la actualización DB ocurre después de borrar el anterior.
- Evidencia: `campos_permitidos={"es_valido", "fecha_expiracion", "ruta"}`.
- Impacto: La base conserva el ID viejo ya borrado; futuras eliminaciones/reemplazos fallan y el archivo nuevo puede quedar huérfano.
- Recomendación: Persistir `file_id`, diseñar compensación ante fallo y no borrar el anterior hasta confirmar el nuevo estado.

### Hallazgo 7: No existen migraciones de aplicación

- Tipo: Error
- Severidad: Crítica
- Archivo(s): `backend/apps/*/migrations/__init__.py`, `.gitignore`
- Descripción: Todas las carpetas solo contienen `__init__.py` y `.gitignore` ignora globalmente `migrations/`.
- Evidencia: No hay archivos `0001_*.py` ni historial de esquema.
- Impacto: Una base nueva no puede construirse de forma reproducible; no se puede verificar coherencia modelo/esquema.
- Recomendación: Versionar migraciones, eliminar la regla global y validar `makemigrations --check`/`migrate` en CI.

### Hallazgo 8: WebSocket web usa una constante no exportada y un mensaje divergente

- Tipo: Error
- Severidad: Alta
- Archivo(s): `frontend-web/src/config/env.ts`, `hooks/useDisponibilidadSocket.js`, `backend/apps/parqueaderos/consumers.py`
- Descripción: El hook importa `WS_BASE_URL`, pero `env.ts` solo exporta `API_BASE_URL`. Además documenta `numero_espacio`, pero el consumer no lo reenvía.
- Evidencia: URL resultante depende de `undefined`; campos comparados entre hook y consumer.
- Impacto: Las actualizaciones en vivo web no se conectan correctamente o carecen de datos esperados.
- Recomendación: Definir URL ws/wss derivada/configurable y un contrato único del evento con prueba cliente-consumer.

### Hallazgo 9: Aplicación móvil no cumple sus contratos y no compila en el entorno disponible

- Tipo: Error
- Severidad: Alta
- Archivo(s): `frontend-movil/tsconfig.json`, `parkingService.ts`, `ParkingContext.tsx`, `useRealTimeParkings.ts`
- Descripción: Faltan dependencias locales/configuración Expo resoluble; el servicio espera campos ingleses y arreglo plano; la API pagina y usa campos españoles; el hook llama `updateParkingStatus`, inexistente.
- Evidencia: `npx tsc --noEmit` terminó con errores de configuración/dependencias y errores propios como `updateParkingStatus` y `address` ausentes.
- Impacto: No hay build móvil reproducible ni integración REST/WebSocket funcional.
- Recomendación: Instalar con `npm ci`, alinear versión Expo/tsconfig, definir adaptador del DTO backend y activar el hook solo después de probarlo.

### Hallazgo 10: Flujo de registro web descarta datos requeridos por la interfaz

- Tipo: Error
- Severidad: Alta
- Archivo(s): `frontend-web/src/controllers/useRegisterController.js`, `views/auth/RegisterView.jsx`, `services/documentoService.js`, `parqueaderoService.js`
- Descripción: La UI obliga a completar parqueadero, dirección, ubicación y documento, pero submit solo registra cuenta e inicia sesión.
- Evidencia: `handleSubmit` solo llama `authService.register` y `authService.login`.
- Impacto: El usuario recibe una señal de solicitud completada aunque no se crea parqueadero ni se carga documento.
- Recomendación: Diseñar un onboarding por pasos con estado explícito, coordenadas reales y compensación/reanudación ante fallos.

### Hallazgo 11: La categoría de tarifa de un espacio no se puede limpiar

- Tipo: Error
- Severidad: Media
- Archivo(s): `backend/apps/parqueaderos/serializers_dto.py:77`, `services.py:119`
- Descripción: El DTO acepta `categoria_tarifa=null`, pero el servicio solo actúa cuando el valor no es `None`.
- Evidencia: Condición `if categoria_tarifa is not None`.
- Impacto: Un espacio queda ligado a una categoría aunque el cliente solicite quitarla.
- Recomendación: Diferenciar campo ausente de valor nulo mediante sentinel y persistir `NULL` cuando sea explícito.

## 11. Vulnerabilidades y riesgos de seguridad

### Hallazgo 12: Secretos reales versionados

- Tipo: Vulnerabilidad
- Severidad: Crítica
- Archivo(s): `.env`, historial Git potencial
- Descripción: El repositorio rastrea credenciales de PostgreSQL y una clave secreta Django con apariencia de valor de desarrollo real.
- Evidencia: `git ls-files` incluye `.env`; contiene valores no vacíos. No se reproducen aquí.
- Impacto: Acceso no autorizado a entornos reutilizados, falsificación de firmas/sesiones y exposición persistente en el historial.
- Recomendación: Rotar inmediatamente todos los valores, retirar `.env` del índice e historial según política, mantener solo ejemplos y usar secret manager/variables del entorno.

### Hallazgo 13: Documentos potencialmente sensibles se hacen públicos

- Tipo: Vulnerabilidad
- Severidad: Alta
- Archivo(s): `backend/apps/documentos/storage_backends.py:54`, `models.py:14`
- Descripción: Cada archivo recibe permiso Drive `anyone/reader` y la API devuelve su URL.
- Evidencia: `permissions().create(... {"type": "anyone", "role": "reader"})`.
- Impacto: Licencias o documentos de identidad pueden filtrarse por enlace, logs, historial o reenvío; no hay revocación temporal.
- Recomendación: Almacenamiento privado, descarga autorizada o URL firmada de corta duración, clasificación de datos y política de retención.

### Hallazgo 14: Validación de archivos basada en extensión y tamaño

- Tipo: Vulnerabilidad
- Severidad: Alta
- Archivo(s): `backend/apps/documentos/serializers_dto.py:19`, `storage_backends.py`
- Descripción: No se inspecciona MIME real, magic bytes, contenido activo/malicioso ni malware.
- Evidencia: Solo `FileExtensionValidator` y límite de 5 MB.
- Impacto: Un atacante autenticado puede subir contenido disfrazado y distribuirlo mediante un enlace público confiable.
- Recomendación: Validar firma y MIME, normalizar imágenes/PDF, escanear malware, generar nombre seguro y servir con headers restrictivos.

### Hallazgo 15: Login móvil es una omisión total de autenticación

- Tipo: Vulnerabilidad
- Severidad: Alta
- Archivo(s): `frontend-movil/src/screens/WelcomeScreen.tsx:10`
- Descripción: Cualquier usuario y contraseña no vacíos navegan al panel de propietario sin consultar backend.
- Evidencia: La condición solo usa `trim() !== ''`.
- Impacto: La UI administrativa móvil no tiene control de acceso. Hoy muta datos demo, pero sería crítica si se conectara a endpoints sin corregir el flujo.
- Recomendación: Autenticar contra JWT, guardar tokens en SecureStore, validar rol y proteger navegación/requests.

### Hallazgo 16: Tokens web persistidos en localStorage

- Tipo: Vulnerabilidad
- Severidad: Media
- Archivo(s): `frontend-web/src/services/apiClient.js:21`
- Descripción: Access y refresh se guardan en `localStorage`, accesible a cualquier JavaScript ejecutado en el origen.
- Evidencia: `localStorage.setItem` para ambos tokens.
- Impacto: Una vulnerabilidad XSS o dependencia comprometida puede robar una sesión renovable por un día.
- Recomendación: Evaluar refresh token en cookie HttpOnly/Secure/SameSite y access token en memoria; reforzar CSP y controles XSS.

### Hallazgo 17: Estado de cuenta no bloquea autenticación

- Tipo: Vulnerabilidad
- Severidad: Media
- Archivo(s): `backend/apps/usuarios/models.py:37`, `serializers_dto.py:132`
- Descripción: `Cuenta.estado` es independiente de `AbstractUser.is_active`; SimpleJWT usa la semántica estándar y no se observa validación de `estado`/`Persona.estado`.
- Evidencia: No hay override del token serializer que rechace esos flags.
- Impacto: Una cuenta “desactivada” por la lógica del negocio puede seguir obteniendo tokens y accediendo.
- Recomendación: Usar `is_active` como fuente de verdad o aplicar una política de autenticación central probada.

### Hallazgo 18: Sin throttling para autenticación y registro

- Tipo: Vulnerabilidad
- Severidad: Media
- Archivo(s): `backend/config/settings/base.py`, `usuarios/controllers.py`
- Descripción: No hay `DEFAULT_THROTTLE_CLASSES/RATES`, captcha, bloqueo ni rate limit visible.
- Evidencia: REST_FRAMEWORK solo define autenticación, permisos y exception handler.
- Impacto: Facilita fuerza bruta, credential stuffing y creación automatizada de cuentas/archivos.
- Recomendación: Añadir throttling por IP/cuenta, protección en proxy, monitoreo y respuesta uniforme.

### Hallazgo 19: WebSocket acepta conexiones sin autorización ni validación de origen explícita

- Tipo: Vulnerabilidad
- Severidad: Media
- Archivo(s): `backend/config/asgi.py`, `parqueaderos/consumers.py`
- Descripción: `AuthMiddlewareStack` no autentica JWT del cliente web y `connect` acepta siempre; no se usa `AllowedHostsOriginValidator` ni control por parqueadero.
- Evidencia: `await self.accept()` sin inspeccionar usuario/origen.
- Impacto: Terceros pueden enumerar IDs y observar actividad en vivo; aumenta riesgo de cross-site WebSocket hijacking según despliegue.
- Recomendación: Definir si el dato es público; si no, autenticar token, autorizar recurso y validar origen/host.

### Hallazgo 20: Lecturas autenticadas de tarifas y espacios no siempre respetan propiedad/validación

- Tipo: Vulnerabilidad
- Severidad: Media
- Archivo(s): `backend/apps/tarifas/controllers.py:25`, `parqueaderos/controllers.py:119`
- Descripción: Cualquier autenticado puede listar/obtener estrategias de todos los parqueaderos y recuperar un espacio por ID sin verificar propietario ni visibilidad del parqueadero.
- Evidencia: `IsAuthenticated` global y servicios `listar/obtener` sin filtro de solicitante.
- Impacto: Exposición de configuración interna y recursos aún no validados a otros usuarios.
- Recomendación: Aplicar política de lectura explícita y filtrar queryset por dueño/admin o parqueadero público validado.

## 12. Incoherencias encontradas

### Hallazgo 21: Modelo de tarifa mantiene dos conceptos incompatibles con el mismo nombre

- Tipo: Incoherencia
- Severidad: Alta
- Archivo(s): `backend/apps/parqueaderos/models.py:22`, `backend/apps/tarifas/models.py:4`
- Descripción: `Parqueadero` aún tiene un campo decimal `tarifa`, mientras `EstrategiaTarifa.parqueadero` declara reverse name `tarifa`.
- Evidencia: Campo concreto y relación reversa comparten nombre en la misma clase objetivo.
- Impacto: Potencial error de checks/modelado, ambigüedad ORM y dos fuentes de verdad para precios.
- Recomendación: Elegir un único modelo tarifario y migrar/eliminar el legado con migración de datos.

### Hallazgo 22: Contrato de errores no es uniforme

- Tipo: Incoherencia
- Severidad: Media
- Archivo(s): `backend/core/exceptions.py`, controladores de parqueaderos/horarios
- Descripción: El handler promete `{error, detail, code}`, pero múltiples ramas retornan manualmente solo `{detail}`; servicios usan `ValidationError` para recursos inexistentes.
- Evidencia: Responses manuales 400/404 y excepciones 400 para “no existe”.
- Impacto: Clientes deben manejar formatos/códigos distintos y pueden mostrar mensajes genéricos.
- Recomendación: Definir envelope y taxonomía HTTP única; usar `NotFound` para ausencia y probar contratos.

### Hallazgo 23: Contrato móvil difiere totalmente de REST y WebSocket

- Tipo: Incoherencia
- Severidad: Alta
- Archivo(s): `frontend-movil/src/services/parkingService.ts`, `context/ParkingContext.tsx`, backend DTOs/consumer
- Descripción: Móvil espera `name/latitude/available/status`, ID numérico o string según archivo, y WS `/ws/parking`; backend entrega `nombre`, `ubicacion.latitud`, `espacios_disponibles`, `FUERA_DE_SERVICIO` y ruta por ID.
- Evidencia: Interfaces y URLs comparadas.
- Impacto: Aun con red disponible, la app no puede representar respuestas reales.
- Recomendación: Generar tipos desde OpenAPI o implementar un adaptador único con pruebas de fixtures.

### Hallazgo 24: Código y documentación describen estados que no existen

- Tipo: Incoherencia
- Severidad: Media
- Archivo(s): `docs/**`, comentarios de backend/web, `README.md`
- Descripción: Los ADR/SRS/auditoría/diagramas están vacíos, mientras el código menciona RNF, ADR, “patches adjuntos” y correcciones que no pueden verificarse; `README` solo explica levantar la web.
- Evidencia: 14 archivos Markdown de docs con 0 bytes y referencias a archivos patch inexistentes.
- Impacto: No hay baseline verificable de requisitos ni decisiones, y comentarios pueden confundirse con documentación vigente.
- Recomendación: Convertir este informe en baseline, completar SRS/ADR con decisiones reales y retirar narrativa histórica del código.

### Hallazgo 25: Configuración geográfica y temporal no coincide

- Tipo: Incoherencia
- Severidad: Baja
- Archivo(s): `backend/config/settings/base.py`, contexto/UI del proyecto
- Descripción: El proyecto se presenta como Loja, Ecuador, pero usa `America/Guayaquil` y `LANGUAGE_CODE='es-ec'`; esto es válido para Ecuador. El entorno de revisión está en `America/Bogota`, que comparte UTC-5 pero es una zona distinta.
- Evidencia: Settings y contexto del proyecto.
- Impacto: Hoy no cambia el offset, pero reglas futuras de zona/operación podrían depender del identificador.
- Recomendación: Mantener zona de negocio explícita y no derivarla del host; documentar que es Ecuador.

### Hallazgo 26: Settings de ASGI/WSGI favorecen desarrollo por defecto

- Tipo: Incoherencia
- Severidad: Media
- Archivo(s): `backend/config/asgi.py`, `wsgi.py`, `manage.py`
- Descripción: Los puntos de entrada fijan por defecto `config.settings.development`; producción solo se usa si el despliegue define correctamente la variable, pero los scripts/archivos de entorno están vacíos.
- Evidencia: `os.environ.setdefault` y ausencia de despliegue operativo.
- Impacto: Un despliegue mal configurado puede arrancar con DEBUG y hosts de desarrollo, o no arrancar.
- Recomendación: Crear entrypoints/variables de despliegue verificadas y un check que impida settings de desarrollo en producción.

## 13. Calidad del código y deuda técnica

### Hallazgo 27: Cobertura automatizada efectivamente nula

- Tipo: Deuda técnica
- Severidad: Alta
- Archivo(s): `backend/apps/*/tests/__init__.py`, `backend/tests`, `frontend-web/tests`, `.github/workflows`
- Descripción: No hay casos de prueba; directorios y workflows están vacíos.
- Evidencia: Archivos de prueba de 0 bytes y ausencia de specs.
- Impacto: Las roturas contractuales actuales no son detectadas antes de integrar o desplegar.
- Recomendación: Priorizar tests de arranque, auth/permisos, CRUD de parqueaderos, disponibilidad, documentos y contratos frontend.

### Hallazgo 28: Infraestructura y automatización son solo placeholders

- Tipo: Deuda técnica
- Severidad: Alta
- Archivo(s): `infra/**`, `deploy/**`, `scripts/**`, `.github/workflows/**`
- Descripción: Dockerfiles, compose, nginx, cloudflared, scripts, envs y pipelines tienen 0 bytes.
- Evidencia: Inspección de tamaño/contenido.
- Impacto: No hay forma documentada/repetible de levantar servicios, desplegar o ejecutar CI.
- Recomendación: Implementar primero un entorno local mínimo (PostgreSQL/Redis/backend/web), luego CI y despliegue.

### Hallazgo 29: Componentes grandes, código muerto y comentarios históricos

- Tipo: Deuda técnica
- Severidad: Media
- Archivo(s): `frontend-web/src/views/auth/HomeView.jsx`, `RegisterView.jsx`, `OwnerConfigEspacios.jsx`, `src/App.jsx`, `tarifas/controllers.py`
- Descripción: Varias vistas superan 450 líneas; `App.jsx` no se monta; `TarifaViewSetMixin.create` contiene `pass`; hay imports duplicados y muchos comentarios “antes/corrección/patch”.
- Evidencia: Conteos de líneas y rutas de importación.
- Impacto: Mayor costo de comprensión, riesgo de divergencia y falsa sensación de funcionalidades terminadas.
- Recomendación: Tras estabilizar contratos/tests, dividir por responsabilidad y eliminar código muerto/narrativa obsoleta.

### Hallazgo 30: Validaciones de negocio incompletas y divergentes

- Tipo: Deuda técnica
- Severidad: Media
- Archivo(s): DTOs de tarifas/usuarios, validadores web
- Descripción: Web acepta contraseña desde 6 caracteres y backend desde 8; precios/porcentajes no tienen límites consistentes; identificación ecuatoriana solo se valida estructuralmente en web, no en backend; PUT usa DTOs opcionales.
- Evidencia: Comparación de `authValidator.js`, serializers y modelos.
- Impacto: Errores tardíos, datos inválidos desde clientes alternos y comportamiento distinto por canal.
- Recomendación: Reglas autoritativas en backend, mensajes/constraints compartidos y validación web como apoyo.

### Evaluación general

- **Mantenibilidad:** baja-media. La intención por capas ayuda, pero las capas no están protegidas por pruebas.
- **Separación de responsabilidades:** media en backend y web; baja en móvil/prototipos y documentos.
- **Claridad de nombres:** media; predominan nombres de dominio claros, pero hay residuos (`ParqueaderoService.crear/eliminar` operando espacios, dos `tarifa`).
- **Organización:** buena como esqueleto, incompleta como producto.
- **Cobertura:** 0% confirmado; no existe medición ni tests.
- **Extensibilidad:** baja hasta estabilizar migraciones, contratos y CI.
- **Duplicación:** controladores de tres tipos de tarifa son casi iguales; validaciones y contratos se duplican entre clientes.
- **Encoding:** numerosos textos aparecen mojibake (`Ã`, `â`) al leerse en el entorno, indicio de codificación inconsistente. Debe confirmarse en editores/build antes de una normalización masiva.

## 14. Pruebas, comandos ejecutados y resultados

| Comando/verificación | Resultado |
|---|---|
| `git status --short`, `git ls-files`, inventario PowerShell | 196 archivos rastreados; 14 archivos ya modificados antes de la revisión |
| Lectura de configuración, código, docs, infra, contratos | Completada; docs/infra/deploy/CI casi totalmente vacíos |
| `python manage.py check` con Python global | No ejecutable: Django no instalado globalmente |
| `backend/venv/Scripts/python.exe manage.py check` | Falló: `DJANGO_SECRET_KEY` ausente por nombre inconsistente |
| `manage.py check` con clave temporal no persistida | Falló después: módulo `daphne` ausente |
| `manage.py makemigrations --check --dry-run` | No alcanzó el chequeo: mismo fallo de `daphne` |
| `manage.py test` | No alcanzó tests: mismo fallo de `daphne` |
| `python -m pytest -q` | No ejecutable: pytest/pytest-django no están instalados en el venv |
| Inspección de tests | No existen casos; solo archivos vacíos/.gitkeep |
| Parseo AST de Python sin imports | Sin errores sintácticos en los `.py` inspeccionados; incluyó archivos del venv, por lo que solo confirma sintaxis |
| `npm.cmd run build` en web | **Exitoso**: Vite transformó 1630 módulos y generó bundle; `dist` fue eliminado después por ser artefacto de revisión |
| `npm.cmd run lint` en web | No ejecutable: `eslint` no está instalado/declarado aunque el script lo requiere |
| `npx.cmd tsc --noEmit` en móvil | Falló: dependencias/tsconfig no resolubles y errores propios de tipos/contratos |
| `npm.cmd audit --offline --omit=dev` web/móvil | 0 vulnerabilidades en caché local; resultado limitado, no verificación online actual |

No se instaló ni actualizó ninguna dependencia. No se pudo ejecutar una prueba integrada con PostgreSQL, Redis o Google Drive. Su funcionamiento queda **No confirmado**.

## 15. Recomendaciones prioritarias

### P0 - Bloqueantes y exposición inmediata

1. Rotar secretos, retirar `.env` del control de versiones y revisar historial/accesos.
2. Hacer que backend arranque desde una instalación limpia: variable de secret coherente, `daphne`/requirements completos y settings correctos.
3. Crear y versionar migraciones iniciales; validar esquema en PostgreSQL temporal.
4. Corregir creación, listado y eliminación de parqueaderos antes de exponer la API.
5. Privatizar documentos y reparar la actualización de `file_id`; revisar archivos ya publicados.

### P1 - Integridad funcional y seguridad

6. Corregir disponibilidad en altas, bajas, todos inhabilitados y cero espacios; eventos dentro de transacción.
7. Definir autorización uniforme para lecturas, WebSockets y cuentas desactivadas.
8. Completar onboarding web o dejar de solicitar/confirmar datos que se descartan.
9. Establecer un contrato OpenAPI y alinear web/móvil/eventos/códigos de error.
10. Añadir rate limiting, validación real de archivos y política segura de tokens.

### P2 - Calidad y entrega

11. Implementar suite mínima y CI antes de nuevos módulos.
12. Crear entorno Docker/compose real con PostgreSQL y Redis.
13. Reparar instalación/build móvil y reemplazar mocks por adaptadores API.
14. Declarar ESLint/configuración web o retirar un script no soportado.
15. Completar README, SRS y ADR con el comportamiento real.

### P3 - Evolución

16. Eliminar campo tarifario legado y definir cálculo de precios.
17. Refactorizar vistas grandes/código muerto solo después de fijar pruebas.
18. Diseñar reservas, pagos, historial y notificaciones únicamente si son requisitos aprobados; hoy son ausentes, no deuda accidental confirmada.

## 16. Próximos pasos sugeridos

1. Congelar cambios funcionales y acordar este documento como baseline del estado actual.
2. Abrir una rama de estabilización y resolver P0 en cambios pequeños, cada uno con prueba.
3. Levantar PostgreSQL/Redis efímeros y ejecutar `check`, migraciones y tests en CI.
4. Publicar OpenAPI desde backend y usar fixtures/contract tests para web y móvil.
5. Ejecutar una revisión de seguridad específica de documentos, secretos, JWT y WebSockets.
6. Completar un flujo vertical verificable: registro → parqueadero → validación admin → horarios/tarifas/espacios → consulta pública → evento de disponibilidad.
7. Decidir formalmente el alcance del producto (consulta operativa frente a reservas/pagos) antes de ampliar modelos.

### Criterio de salida recomendado para la siguiente fase

El proyecto debería considerarse estabilizado solo cuando una instalación limpia pueda: arrancar con configuración de ejemplo sin secretos, migrar una base vacía, ejecutar pruebas verdes, completar el flujo vertical anterior y producir builds web/móvil reproducibles. En el estado revisado, ninguno de esos criterios de extremo a extremo está confirmado.
