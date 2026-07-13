---
name: frontend-react-query
description: Implementar o revisar frontend React/Vite de ParkingPaTi con servicios REST, TanStack React Query, rutas por rol/onboarding y estados completos. Usar en onboarding, administración, configuración, espacios y consulta pública web.
---

# Frontend React Query

## Cuándo usarlo

Usar para cualquier tarea en `frontend-web` después de leer el contrato y la spec activa.

## Flujo

1. Consumir OpenAPI/servicio, no inferir modelos.
2. Definir query keys y adapters.
3. Implementar estados loading/empty/error/data.
4. Usar mutations e invalidación para escrituras.
5. Proteger UX por rol/onboarding sin reemplazar permisos backend.
6. Probar contrato y flujo.

## Reglas obligatorias

- Centralizar HTTP y tokens en services.
- Usar React Query para estado servidor.
- Polling público a 5000 ms solo con vista activa.
- Pausar polling en background y cancelar requests obsoletas.
- Usar confirmación para aprobar, rechazar, deshabilitar y borrado lógico.
- Evitar doble submit y mostrar errores del envelope.
- Mantener Leaflet separado de datos del dominio.

## Antipatrones prohibidos

- `setInterval` paralelo a React Query.
- Fetch directo desde componentes.
- WebSockets o hooks de Channels.
- Conexión directa a Supabase/OSM API para parqueaderos.
- Datos demo o IPs hardcodeadas.
- Guardados masivos como bucles de N requests si existe caso de uso batch.
- Confiar en guardas de ruta como autorización real.

## Checklist de salida

- [ ] Contrato coincide con OpenAPI.
- [ ] Query keys/cache/invalidation son coherentes.
- [ ] Todos los estados de UI existen.
- [ ] Accesibilidad y textos de confirmación son claros.
- [ ] Tests/lint/build pasan.
- [ ] No hay secretos ni funcionalidades excluidas.
