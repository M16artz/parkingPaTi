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

## Preparación mínima de staging autorizada

Miguel Armas autorizó preparar Django + PostgreSQL de staging únicamente para
cerrar el smoke de fase 008, sin ejecutar ni cerrar fase 010.

Preparación versionada:

- `render.yaml`: Blueprint sin secretos para Django en Render.
- `backend/.python-version`: Python 3.13 aprobado.
- Settings de producción: HTTPS detrás del proxy y SSL PostgreSQL configurable.
- `docs/qa/mobile-staging-smoke.md`: creación externa y procedimiento de smoke.

Esto no cierra el bloqueo: aún deben crearse Supabase/Render, cargar variables
reales externamente, disponer datos visibles y ejecutar Android con Node 22.

Verificaciones de la preparación:

```text
pytest -q (desde backend/): 56 passed
pytest test_production_settings.py + test_health.py: 3 passed
manage.py check con settings production: 0 issues
makemigrations --check --dry-run: no changes
render.yaml: YAML válido; variables sync:false sin valores
```

`manage.py check --deploy` informó HSTS aún no configurado y clave de diagnóstico
insuficiente. La clave fue deliberadamente inerte; Render genera la real. HSTS
queda como riesgo de hardening, sin asumir su política antes de fase 009/010.

Una primera invocación de Pytest desde la raíz no cargó `backend/pytest.ini` y
falló durante collection. Al repetir el comando reproducible desde `backend/`,
la suite completa pasó; no fue un fallo de código.

## Preparación local para validación de usabilidad (2026-07-15)

- Vite dispone de proxy local `/api` y `/health` hacia Django, configurable con
  `VITE_DEV_API_TARGET` y sin IP privada versionada.
- `scripts/setup-local.cmd` valida Node 22/Python 3.13, recrea el venv roto,
  instala lockfiles y migra PostgreSQL sin crear `.env`.
- `scripts/start-local.cmd` inicia Django y web en una sola consola y detiene
  ambos procesos con `Ctrl+C`.
- README raíz/web/móvil diferencia la validación web de Expo Go y conserva el
  requisito móvil de staging HTTPS.

Resultados reales:

```text
frontend-web: 14 tests PASS; lint PASS; build PASS.
Vite proxy /health -> Django local :8017: PASS {"status":"ok"}.
frontend-movil: Expo 54.0.36 compatible; typecheck PASS; 3 suites/10 tests
PASS; export Android PASS (1102 módulos, 3.1 MB).
Django temporal: manage.py check PASS; makemigrations --check PASS.
Backend pytest: bloqueado en esta sesión porque PostgreSQL local exige una
contraseña y no existe backend/.env configurado para el proceso de validación.
```

El `backend/venv` local no se pudo completar mientras seguía activo un servidor
Django preexistente en `localhost:8017` (PID observado: 81672), que bloqueó DLL y
archivos `.pyd` en Windows. El script ahora detecta procesos que usan ese venv y
exige cerrarlos antes de recrearlo; no se detuvo el proceso del usuario.
