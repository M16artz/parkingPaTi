# Definition of Done

Una tarea se considera terminada cuando:

- Pertenece a la fase activa y no amplía alcance.
- Respeta controller -> DTO -> service -> repository -> model.
- Incluye permisos y validación backend.
- Incluye migración si cambia esquema.
- Incluye pruebas exitosas y fallos relevantes.
- Actualiza OpenAPI, adapters/clientes y documentación afectados.
- UI maneja loading, empty, error, retry y doble submit cuando aplica.
- No introduce secretos, IPs, datos demo permanentes ni valores sensibles.
- No introduce reservas, pagos, conductor autenticado, WebSockets, Redis de disponibilidad, acceso directo a Supabase ni OSM como datos.
- Pasa format, lint, typecheck, tests y build aplicables.
- Registra comandos/resultados y riesgos residuales.

Una fase solo termina cuando todos sus criterios de aceptación y tasks obligatorios están cerrados.
