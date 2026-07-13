# Estrategia de pruebas

## Backend

- Modelos/constraints y migraciones desde base vacía.
- DTOs: campos, límites y errores.
- Services: negocio, permisos, transacciones, locks y compensaciones.
- API: contratos, estados HTTP, paginación y filtros.
- Integraciones Drive/correo mediante fakes; smoke separado con credenciales seguras.

## Web

- Unitarias de validadores/adapters.
- Integración de React Query con servidor simulado.
- Componentes de confirmación y estados de UI.
- E2E del flujo vertical y rutas por rol/onboarding.

## Móvil

- Typecheck y adapter contractual.
- Estados loading/error/empty/data.
- Mapa/lista con fixtures.
- Polling pausado en background.
- Smoke Android en emulador/dispositivo.

## Seguridad y rendimiento

- Matriz anónimo/propietario/admin.
- Tokens de correo, throttling, archivos falsos y sesiones deshabilitadas.
- Polling con múltiples clientes, bbox e índices.
- Scanning de secretos/dependencias.

## Política

Cada fase añade las pruebas de sus tareas; la fase 009 consolida CI, no pospone toda la cobertura.
