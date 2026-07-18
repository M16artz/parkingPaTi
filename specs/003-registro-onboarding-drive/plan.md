# Plan de fase 003

## Lecturas

- `docs/product/01-funcionalidades-incluidas.md`
- `skills/security-secrets-auth/SKILL.md`
- `skills/maps-osm-leaflet/SKILL.md`
- `skills/frontend-react-query/SKILL.md`

## Enfoque

1. Implementar servicios auth/token de correo con fakes.
2. Implementar endpoints de estado y datos iniciales.
3. Implementar adapter Drive/compensación.
4. Implementar wizard web por pasos reanudables.
5. Integrar selector Leaflet limitado por DP-01.
6. Añadir envío y estado pendiente.
7. Reconciliar el registro completo: parqueadero/documento pendientes y transición directa a revisión después de verificar correo.
8. Unificar el acceso por `correo`, sincronizar `email` y dirigir el primer login aprobado a la configuración final.

## Dependencias

Requiere fase 002 y DP-01, DP-07, DP-08, DP-09.
