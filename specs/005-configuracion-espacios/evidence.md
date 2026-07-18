# Evidencia de fase 005

## Correcciones de dashboard - 2026-07-17

- El modal de edición de espacios usa un portal a `document.body` y se centra
  respecto de la pantalla completa.
- Dirección, coordenadas y mapa son de solo lectura para el propietario; el
  DTO rechaza intentos de modificarlos.
- Verificación conjunta fases 005-006: 20 pruebas backend aprobadas.
- Web: 21 pruebas aprobadas, ESLint y build Vite correctos.

## Rediseño del dashboard del propietario - 2026-07-17

- `/owner/dashboard` carga el panel modular con cuatro secciones y estado
  inicial `inicio`.
- Los resúmenes de ocupación, horario, tarifas y configuración se calculan con
  la respuesta real de `owner/configuration` y `parqueaderos/mios`.
- `PATCH /api/v1/parqueaderos/{id}/` actualiza de forma atómica nombre,
  descripción, dirección y coordenadas validadas dentro de Loja.
- `npm.cmd test`: 21 pruebas aprobadas.
- `npm.cmd run lint`: correcto.
- `npm.cmd run build`: correcto; mantiene la advertencia conocida de tamaño de
  bundle.
- `python -m pytest tests/test_phase005_configuration.py -q`: 9 pruebas
  aprobadas.
- `python manage.py check`: sin problemas.
- `python manage.py makemigrations --check --dry-run`: sin cambios.
- Regeneración automática de OpenAPI: **No confirmada** por incompatibilidad
  preexistente entre `jsonschema` y `attrs` del entorno. El contrato se alineó
  manualmente y las pruebas de API pasaron.

## Estado

Fase completada: 13 de 13 tareas verificadas.

## Dependencias y decisiones

- La fase 004 estaba completada antes de iniciar.
- DP-02: no existen tipos fisicos de espacio.
- DP-03 y DP-16: `NORMAL` es obligatoria y predeterminada; `DESCUENTO` e
  `INCREMENTO` son opcionales y tienen precios por hora independientes.
- DP-14: estado del espacio y categoria de tarifa son conceptos independientes.
- DP-17: los estados son `LIBRE`, `OCUPADO` e `INHABILITADO`.
- La reactivacion conserva borrado logico y exige que no exista otro nombre
  activo equivalente.

No se identificaron decisiones bloqueantes para esta fase.

## Implementacion verificada

### Backend

- DTO compuesto en `apps/parqueaderos/configuration_serializers_dto.py`.
- Controllers propietarios en `apps/parqueaderos/configuration_controllers.py`.
- Casos de uso transaccionales en
  `apps/parqueaderos/configuration_services.py`.
- Persistencia y bloqueos en repositorios de parqueaderos, horarios y tarifas.
- Configuracion final atomica e idempotente para reintentos con la misma
  cantidad inicial.
- Alta adicional por lote, edicion individual, borrado logico y reactivacion.
- Recalculo centralizado de total, disponibles y estado agregado.
- `OCUPADO` no se acepta como cambio manual; su transicion corresponde a la
  fase 006.

### Web

- Ruta protegida `/owner/configuration` y redireccion del onboarding pendiente.
- Formulario reanudable de horarios, tarifas y cantidad inicial.
- Grilla estable con edicion, alta en lote, deshabilitacion, borrado logico y
  reactivacion con confirmacion.
- React Query realiza una mutacion por operacion e invalida la consulta; el
  flujo activo no ejecuta bucles de N peticiones.
- El flujo activo no contiene WebSockets.

### Contratos y documentacion

- Contratos actualizados en `docs/architecture/03-api-contracts.md`.
- Reglas de datos actualizadas en `docs/architecture/02-modelo-datos.md`.
- Guia operativa en `docs/qa/configuracion-espacios.md`.
- No se requirio migracion: los modelos de la fase 002 ya cubrian el cambio.

## Criterios de aceptacion

1. Un propietario aprobado permanece con configuracion pendiente hasta que el
   servicio compuesto finaliza; solo entonces se activa cuenta/parqueadero.
2. La prueba de rollback demuestra que una falla del lote no deja horarios,
   tarifas ni espacios parciales.
3. La matriz de estados valida conteos y estado agregado para espacios libres,
   ocupados, inhabilitados e inactivos.
4. DELETE ejecuta borrado logico; la reactivacion y los conflictos de nombres
   se prueban sin eliminacion fisica.

## Verificaciones ejecutadas

| Verificacion | Resultado |
|---|---|
| `python manage.py check` | Sin problemas |
| `python manage.py makemigrations --check --dry-run` | Sin cambios |
| Migraciones sobre PostgreSQL temporal | Correctas |
| Suite backend | 34 pruebas aprobadas |
| Pruebas especificas fase 005 | 7 aprobadas |
| Generacion OpenAPI | 0 warnings, 0 errores |
| `pip check` | Sin dependencias rotas |
| Suite web | 8 pruebas aprobadas |
| ESLint web | Correcto |
| Build Vite | Correcto |
| Escaneo de WebSocket/Channels/Redis en codigo activo | 0 coincidencias |

PostgreSQL se ejecuto en un contenedor efimero sin volumen ni datos
persistentes. No se usaron credenciales reales.

## Riesgos y limites

- Vite advierte que el bundle principal supera 500 kB; su optimizacion queda en
  la fase 009.
- La ocupacion mediante estancias y el costo informativo pertenecen a la fase
  006 y no se implementaron aqui.
- La API publica, mapas y polling pertenecen a la fase 007 y no se implementaron
  aqui.
- Las integraciones reales y el despliegue permanecen para la fase 010.

## Bloqueos

Ninguno para el cierre de la fase 005.

## Correccion UX del 2026-07-17

- La configuracion inicial marca el dia exacto cuando la apertura no es
  anterior al cierre.
- Tarifas admiten solo digitos y punto decimal, deben ser mayores que cero y
  descuento/incremento limpian el precio al desactivarse.
- La cantidad inicial admite solo enteros entre 1 y 500.
- El guardado exitoso actualiza la cache y dirige a `/owner/dashboard`; los
  errores anidados del API ya no se muestran como `[object Object]`.
- `npm.cmd test`: 19 pruebas aprobadas.
- `npm.cmd run lint`: correcto.
- `npm.cmd run build`: correcto; conserva la advertencia conocida del bundle
  principal mayor a 500 kB.
- `py -3.13 -m py_compile apps/parqueaderos/configuration_serializers_dto.py`:
  correcto.
- Contrato fuente y `docs/openapi.yaml`: alineados con precio minimo `0.01`;
  regeneracion automatica **No confirmada** por el bloqueo del entorno Python.
- Pruebas Django y `manage.py check`: **No confirmado** en esta correccion. El
  `backend/venv` preexistente apunta a un Python 3.12 ausente y el Python 3.13
  disponible no tiene instaladas las dependencias; no se reconstruyo ni se
  modifico el entorno del usuario.
