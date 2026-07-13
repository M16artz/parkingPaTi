# Plan de fase 002

## Lecturas

- `docs/architecture/02-modelo-datos.md`
- `docs/architecture/03-api-contracts.md`
- `skills/backend-django-layered/SKILL.md`

## Enfoque

1. Resolver decisiones bloqueantes y congelar nombres/estados.
2. Preparar migración limpia o compatible con datos existentes.
3. Implementar models/constraints por módulo.
4. Implementar repositories base sin casos de uso futuros.
5. Definir excepciones/envelope/versionado/OpenAPI.
6. Probar DB vacía y ruta de datos aprobada.

## Dependencias

Requiere fases 000-001. Habilita 003-010.
