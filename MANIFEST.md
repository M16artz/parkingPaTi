# Manifiesto de trabajo ParkingPaTi

## Inicio rápido para agentes

Leer siempre, en orden:

1. `AGENTS.md`: reglas globales y prohibiciones.
2. `MANIFEST.md`: navegación y secuencia.
3. `cambios.md`: fuente histórica completa; no editar por tareas normales.
4. `docs/product/03-decisiones-pendientes.md`: bloqueos que no se pueden asumir.
5. `specs/<fase>/spec.md`, `plan.md`, `tasks.md` de la fase activa.
6. Documentos de arquitectura/QA y skills indicados por la fase.

`parkingPaTi.md` conserva la revisión técnica previa y evidencia de hallazgos.

## Orden de ejecución

| Orden | Fase | Dependencia principal |
|---:|---|---|
| 000 | Baseline y seguridad | Ninguna |
| 001 | Entorno backend | 000 |
| 002 | Modelos, migraciones y contratos | 000-001 + decisiones |
| 003 | Registro, onboarding y Drive | 002 + proveedores/decisiones |
| 004 | Panel administrativo | 003 |
| 005 | Configuración y espacios | 004 |
| 006 | Estancias y costo informativo | 005 |
| 007 | API pública, polling y mapas | 005; paralela a 006 |
| 008 | Integración móvil | 007 |
| 009 | CI, seguridad y rendimiento | 000-008 |
| 010 | Despliegue y aceptación | 009 |

No iniciar una fase si sus decisiones bloqueantes o dependencias no están cerradas.

## Producto

- `docs/product/00-vision-alcance.md`: propósito, actores y resultado.
- `docs/product/01-funcionalidades-incluidas.md`: alcance positivo.
- `docs/product/02-funcionalidades-excluidas.md`: prohibiciones y excepción de estancia.
- `docs/product/03-decisiones-pendientes.md`: única lista operativa de decisiones abiertas.

## Arquitectura

- `docs/architecture/00-arquitectura-general.md`: componentes y límites.
- `docs/architecture/01-backend-por-capas.md`: responsabilidades obligatorias.
- `docs/architecture/02-modelo-datos.md`: entidades, relaciones y constraints.
- `docs/architecture/03-api-contracts.md`: rutas/convenciones propuestas.
- `docs/openapi.yaml`: contrato OpenAPI generado y validado.
- `docs/architecture/04-mapas-polling.md`: bbox, tiles y actualización.
- `docs/architecture/05-despliegue.md`: Cloudflare, Render, Supabase y servicios.

## Decisiones arquitectónicas

- `docs/adr/ADR-001-polling-sobre-websockets.md`
- `docs/adr/ADR-002-cloudflare-render-supabase.md`
- `docs/adr/ADR-003-osm-solo-como-mapa-base.md`
- `docs/adr/ADR-004-backend-por-capas.md`

Los ADR históricos vacíos `001-008` se conservan; no son decisiones operativas actuales.

## Calidad

- `docs/qa/definition-of-done.md`: terminado por tarea/fase.
- `docs/qa/test-strategy.md`: pirámide y seguridad/rendimiento.
- `docs/qa/acceptance-final.md`: flujo y escenarios finales.
- `docs/qa/mobile-staging-smoke.md`: procedimiento externo para cerrar el smoke
  Android de fase 008 sin ejecutar fase 010.

## Fases

Cada directorio contiene `spec.md`, `plan.md` y `tasks.md`:

- `specs/000-baseline-seguridad/`
- `specs/001-entorno-backend/`
- `specs/002-modelos-migraciones-contratos/`
- `specs/003-registro-onboarding-drive/`
- `specs/004-panel-administrativo/`
- `specs/005-configuracion-espacios/`
- `specs/006-estancias-costo-informativo/`
- `specs/007-api-publica-polling-mapas/`
- `specs/008-integracion-movil/`
- `specs/009-ci-seguridad-rendimiento/`
- `specs/010-despliegue-aceptacion/`

La fase 000 mantiene además `specs/000-baseline-seguridad/evidence.md` con inventario redactado, toolchain y bloqueos externos.

La fase 001 mantiene `specs/001-entorno-backend/evidence.md` con instalación y verificaciones de cierre.

La fase 002 mantiene `specs/002-modelos-migraciones-contratos/evidence.md` con decisiones, migraciones, pruebas PostgreSQL y criterios de cierre.

La fase 003 mantiene `specs/003-registro-onboarding-drive/evidence.md` con decisiones, contratos, pruebas PostgreSQL/web, riesgos de proveedores y criterios de cierre.

La fase 004 mantiene `specs/004-panel-administrativo/evidence.md` con decisiones,
contratos, pruebas PostgreSQL/web y criterios de cierre. El uso operativo del
panel se documenta en `docs/qa/panel-administrativo.md`.

La fase 005 mantiene `specs/005-configuracion-espacios/evidence.md` con pruebas
de atomicidad, propiedad, borrado logico y conteos. El flujo propietario se
documenta en `docs/qa/configuracion-espacios.md`.

La fase 006 mantiene `specs/006-estancias-costo-informativo/evidence.md` con
pruebas de concurrencia, atomicidad, snapshots, calculo y retencion. El flujo
operativo se documenta en `docs/qa/estancias-costo-informativo.md`.

La fase 007 mantiene `specs/007-api-publica-polling-mapas/evidence.md` con
pruebas bbox, visibilidad, polling, carga y retiro WebSocket. El flujo anonimo
se documenta en `docs/qa/api-publica-mapas.md`.

La fase 008 mantiene `specs/008-integracion-movil/evidence.md` con verificaciones
móviles y el bloqueo de smoke Android/staging. La fase 009 mantiene
`specs/009-ci-seguridad-rendimiento/evidence.md`; actualmente está bloqueada y
no iniciada hasta cerrar fase 008.

## Skills

- `skills/backend-django-layered/SKILL.md`: cualquier backend Django/DRF.
- `skills/frontend-react-query/SKILL.md`: web React, services y cache/polling.
- `skills/mobile-expo-react-native/SKILL.md`: cliente móvil público.
- `skills/maps-osm-leaflet/SKILL.md`: mapas, bbox y tiles.
- `skills/security-secrets-auth/SKILL.md`: secretos, auth, correo y documentos.
- `skills/testing-ci/SKILL.md`: pruebas y workflows.
- `skills/deployment-free-tier/SKILL.md`: despliegue/límites gratuitos.

## Prompts reutilizables

- `prompts/00-dividir-cambios-md.md`: descomponer una fuente histórica.
- `prompts/01-generar-spec-fase.md`: crear/refinar documentación de fase.
- `prompts/02-implementar-fase.md`: ejecutar una fase aprobada.
- `prompts/03-revisar-fase.md`: auditar una fase terminada.
- `prompts/04-actualizar-documentacion.md`: sincronizar documentación operativa.

## Mapa de la fuente histórica

| Contenido de `cambios.md` | Destino operativo |
|---|---|
| Objetivo/alcance | `docs/product/00-02` |
| Decisiones pendientes | `docs/product/03` |
| Principios/arquitectura/módulos | `docs/architecture/00-01` |
| Modelo propuesto | `docs/architecture/02` + fase 002 |
| Flujos | fases 003-008 |
| Contratos | `docs/architecture/03` + specs |
| Polling/mapas/retirar WS | `docs/architecture/04`, ADR-001/003, fase 007 |
| Vista admin | fase 004 |
| Seguridad/migraciones | fases 000/002/009 y skills |
| Plan de fases | `specs/000-010` |
| Pruebas/DoD/aceptación | `docs/qa` |
| Despliegue | `docs/architecture/05`, ADR-002, fase 010 |
| 30 hallazgos | tareas distribuidas 000-010; tabla original permanece en `cambios.md` |

## Mantenimiento

- No duplicar decisiones: enlazar documento canónico.
- Actualizar este manifiesto al crear, mover o retirar documentación operativa.
- Mantener archivos pequeños; dividir al superar aproximadamente 200 líneas salvo justificación.
- Conservar fuentes históricas aunque la solución evolucione.
