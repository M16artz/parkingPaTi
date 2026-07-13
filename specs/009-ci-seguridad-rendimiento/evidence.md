# Evidencia de fase 009

Estado: bloqueada, no iniciada.

## Comprobación previa

Fecha: 2026-07-13.

- `MANIFEST.md` establece que fase 009 depende de fases 000-008.
- `plan.md` exige fases 000-008 funcionalmente completas.
- `specs/008-integracion-movil/tasks.md` registra 12/13 tareas cerradas.
- La tarea abierta es `Ejecutar smoke Android contra staging HTTPS`.
- `specs/008-integracion-movil/evidence.md` declara explícitamente que fase 008
  no se cierra sin backend HTTPS, dispositivo/emulador y smoke real.

Por estas evidencias no se inició ninguna tarea de fase 009. No se modificaron
CI, backend, web, móvil, infraestructura, dependencias ni funcionalidad.

## Condición de desbloqueo

Antes de reintentar fase 009 debe cerrarse fase 008 con evidencia de:

1. Backend Django de staging accesible mediante HTTPS.
2. `EXPO_PUBLIC_API_BASE_URL` configurada fuera del repositorio.
3. Smoke en Android físico o emulador del flujo mapa -> lista -> detalle.
4. Al menos dos ciclos de polling observados contra staging.
5. Instalación y verificaciones móviles repetidas con Node 22 LTS.
6. Checkbox 13/13 y criterios de aceptación de fase 008 cerrados.

DP-12 continúa pendiente, pero no es el bloqueo inmediato para iniciar 009. No
se asumirá un proveedor productivo de tiles durante el desbloqueo.
