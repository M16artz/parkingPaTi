# Prompt: revisar una fase

```text
Revisa la implementación de la fase {numero_nombre} con postura de code review; no corrijas todavía salvo solicitud explícita.

Lee AGENTS.md, MANIFEST.md, spec.md, plan.md, tasks.md, Definition of Done, estrategia de pruebas y skills aplicables. Compara código, migraciones, OpenAPI, clientes, tests y documentación contra cada criterio/tarea.

Prioriza hallazgos por severidad y cita archivo/línea. Verifica especialmente:
- límites de fase y funcionalidades excluidas;
- arquitectura backend por capas;
- permisos, transacciones, secretos y privacidad;
- coherencia web/móvil/API;
- pruebas faltantes y comandos fallidos;
- decisiones pendientes asumidas indebidamente.

Entrega hallazgos, preguntas/bloqueos, matriz de criterios y recomendación `aprobada` o `requiere cambios`. No marques checkboxes sin evidencia.
```
