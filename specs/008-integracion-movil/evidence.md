# Evidencia de fase 008

Estado: incompleta por validación externa Android/staging (12/13 tareas).

## Dependencias y contrato

- Fase 007: completada 14/14 en `specs/007-api-publica-polling-mapas/tasks.md`.
- DP-11: móvil limitado al conductor anónimo en
  `docs/product/03-decisiones-pendientes.md`.
- Expo SDK 54, RN 0.81 y `react-native-maps` 1.20.1 verificados con
  `npx.cmd expo install --check`: `Dependencies are up to date`.
- Adapter runtime: `frontend-movil/src/services/publicParkingApi.ts` consume
  lista bbox y detalle de `docs/openapi.yaml`.

## Verificaciones ejecutadas

```text
npm.cmd run typecheck
PASS - TypeScript 5.9 strict, sin errores.

npm.cmd test -- --coverage
PASS - 3 suites, 10 tests.
Cobertura: adapter/config, bbox, estados loading/error/empty/retry y pausa de polling.

EXPO_PUBLIC_API_BASE_URL=https://example.invalid/api/v1 \
  npx.cmd expo export --platform android --output-dir dist
PASS - bundle Android, 1102 módulos, 3.1 MB.
```

El valor `example.invalid` es un dominio reservado sin servicio y se usó solo
para comprobar el bundle; no constituye un smoke de integración.

## Riesgos y bloqueo

- La máquina expone Node 24.14.1, aunque DP-15 aprobó Node 22 LTS. Los checks
  pasan, pero debe repetirse `npm ci`, typecheck, tests y bundle con Node 22.
- `npm.cmd ci --dry-run` agotó 120 s bajo Node 24 durante resolución de peers;
  la instalación Expo sí concluyó y el lockfile quedó actualizado, pero el
  clean install debe validarse con Node 22.
- `npm install` reporta 13 vulnerabilidades moderadas, principalmente en el
  toolchain de pruebas. No se aplicó actualización forzada.
- No se proporcionó URL de staging HTTPS ni hay evidencia de dispositivo o
  emulador Android. El task de smoke y el segundo criterio de aceptación siguen
  abiertos hasta ejecutar el flujo real lista -> mapa -> detalle contra Django.

## Condición explícita de cierre

Decisión confirmada el 2026-07-13: la fase 008 no se cierra hasta disponer de
un backend Django desplegado mediante HTTPS y ejecutar el smoke Android real.

Estado pendiente:

- Backend Django desplegado por HTTPS.
- `EXPO_PUBLIC_API_BASE_URL` con la URL final del backend.
- Ejecución en Android físico o emulador.
- Validación del flujo mapa -> lista -> detalle.
- Observación de al menos dos ciclos de polling contra staging.
- Repetición de instalación, typecheck, tests y bundle con Node 22 LTS.

Cuando exista la URL, se configurará únicamente en un entorno local ignorado o
en el gestor del entorno de build; no se versionará un valor real en el
repositorio. Solo después de adjuntar evidencia de estas validaciones podrá
marcarse el smoke en `tasks.md` y declararse completada la fase.
