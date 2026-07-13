# Fase 002: Modelos, migraciones y contratos

## Objetivo

Crear el dominio persistente y los contratos base que usarán todas las fases posteriores.

## Incluye

- Relaciones OneToOne y estados.
- Tarifas consolidadas, espacios lógicos y estancia mínima.
- Migraciones versionadas y constraints.
- Envelope de errores, `/api/v1/` y OpenAPI inicial.

## Decisiones bloqueantes

DP-02, DP-03, DP-10, DP-13 y DP-14 deben resolverse. No asumir valores.

## No incluye

- UI de onboarding/admin.
- Integraciones reales de Drive/correo.
- API pública con polling.

## Criterios de aceptación

- Migración desde base vacía funciona.
- `makemigrations --check` no produce cambios.
- Constraints y transiciones base tienen pruebas.
- Contratos OpenAPI base están publicados.
