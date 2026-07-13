# ADR-001: Polling sobre WebSockets

- Estado: Aceptada
- Fecha: 2026-07-12
- Implementada: fase 007, 2026-07-13

## Contexto

La disponibilidad debe actualizarse en web/móvil cada 5-10 segundos. El código WebSocket existente está incompleto y añade Channels, Redis, contratos y despliegue adicional.

## Decisión

Usar REST con React Query y `refetchInterval: 5000` mientras la vista está activa. Retirar completamente WebSockets, Channels y Redis de disponibilidad.

## Consecuencias

- Contratos y despliegue más simples.
- Carga periódica sobre Render/PostgreSQL; requiere bbox, índices, pausa en background y pruebas.
- Latencia esperada de hasta 5-10 segundos.

## Alternativas descartadas

- WebSockets/Channels: complejidad no justificada para el alcance.
- Server-Sent Events: conserva conexión persistente y otra ruta operativa.
- Refresh manual: no cumple actualización esperada.

## Evidencia de implementacion

La web usa React Query con intervalo de 5000 ms, pausa en background,
cancelacion y debounce por bbox. Backend, web y movil no contienen rutas,
imports ni servicios WebSocket; Channels/Redis no forman parte de requirements
ni infraestructura activa.
