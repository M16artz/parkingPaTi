# Plan de fase 007

## Lecturas

- `docs/architecture/04-mapas-polling.md`
- ADR-001 y ADR-003.
- `skills/frontend-react-query/SKILL.md`
- `skills/maps-osm-leaflet/SKILL.md`

## Enfoque

1. Optimizar query pública por bbox/visibilidad.
2. Congelar DTO compartido web/móvil.
3. Implementar web pública con cache/polling/foco.
4. Probar rendimiento y actualización.
5. Retirar WebSockets y dependencias después de equivalencia.

## Dependencias

Requiere fase 005 y DP-01/DP-12 resueltas o proveedor configurable aceptado.
