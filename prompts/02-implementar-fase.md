# Prompt: implementar una fase

```text
Implementa únicamente la fase {numero_nombre}.

Antes de editar, lee AGENTS.md, MANIFEST.md, los tres archivos de la fase, docs/product/03-decisiones-pendientes.md y los skills enlazados. Confirma que fases dependientes están completas y que decisiones bloqueantes están resueltas; si no, detente y documenta el bloqueo.

Trabaja tasks.md en orden y actualiza cada checkbox solo con evidencia. Respeta controller/view -> DTO/serializer -> service -> repository -> model/PostgreSQL. No añadas alcance excluido, secretos, mocks permanentes, IPs locales, WebSockets, acceso directo a Supabase ni OSM como datos.

Para cada tarea:
- implementa el cambio mínimo;
- añade pruebas y migración/contrato cuando aplique;
- ejecuta verificaciones de la fase;
- actualiza documentación afectada.

Al final informa archivos, tests/resultados, tareas cerradas, riesgos y bloqueos. No declares terminada la fase si falta un criterio de aceptación.
```
