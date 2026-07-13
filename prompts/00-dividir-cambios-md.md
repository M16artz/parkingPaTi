# Prompt: dividir documentación histórica

```text
Analiza {documento_fuente} y conviértelo en documentación navegable sin implementar código.

Lee primero AGENTS.md y MANIFEST.md. Conserva el documento fuente intacto y úsalo como historia. Separa visión, alcance, arquitectura, decisiones aceptadas, decisiones pendientes, QA y fases. No inventes respuestas: todo asunto abierto va a docs/product/03-decisiones-pendientes.md.

Restricciones: no reservas, pagos, cuenta de conductor, WebSockets/Redis de disponibilidad, acceso directo a Supabase ni OSM como base de datos. Conserva backend por capas.

Entrega:
- archivos pequeños y enlazados;
- manifiesto actualizado;
- mapa de cobertura fuente -> documentos;
- lista de ambigüedades;
- verificación de que no se tocó código funcional.
```
