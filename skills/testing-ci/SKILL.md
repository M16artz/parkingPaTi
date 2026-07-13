---
name: testing-ci
description: Diseñar, implementar o revisar pruebas y CI de ParkingPaTi para Django, React/Vite, Expo, contratos, migraciones, seguridad y polling. Usar en cada fase para su cobertura y en fase 009 para consolidar workflows y gates.
---

# Pruebas y CI

## Cuándo usarlo

Usar al definir criterios verificables, añadir tests, diagnosticar fallos o crear workflows.

## Reglas obligatorias

- Añadir tests en la misma fase de la funcionalidad.
- Priorizar services/permissions/contracts críticos.
- Usar DB temporal y migraciones reales en backend CI.
- Testear adapters/clientes contra fixtures OpenAPI.
- Separar unit, integration, E2E y smoke externo.
- No usar credenciales reales en CI de PR.
- Registrar comandos y resultados reales.
- Mantener workflows con mínimos permisos.

## Antipatrones prohibidos

- Posponer toda prueba a fase 009.
- Tests que solo afirman status feliz.
- Mocks que impiden validar contratos.
- Dependencia de Drive/correo real en tests normales.
- Ignorar tests fallidos o aumentar timeouts sin diagnóstico.
- Cobertura porcentual como sustituto de escenarios críticos.

## Checklist de salida

- [ ] Criterios de aceptación tienen prueba o procedimiento.
- [ ] Éxito, permisos, errores y concurrencia relevante están cubiertos.
- [ ] Tests son deterministas y aislados.
- [ ] CI ejecuta comandos del entorno limpio.
- [ ] Fallos producen diagnósticos útiles.
- [ ] Docs de QA reflejan riesgos residuales.
