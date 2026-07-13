# Evidencia de fase 005

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
