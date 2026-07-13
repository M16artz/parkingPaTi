# Reglas de agentes para ParkingPaTi

## Lectura obligatoria

Antes de trabajar:

1. Leer `MANIFEST.md`.
2. Leer `cambios.md` como fuente histórica.
3. Leer la spec activa completa: `spec.md`, `plan.md` y `tasks.md`.
4. Leer los documentos y skills enlazados por esa spec.
5. Consultar `docs/product/03-decisiones-pendientes.md`; no resolver decisiones por cuenta propia.

## Restricciones obligatorias

- Trabajar una sola fase a la vez y respetar sus dependencias.
- No implementar reservas, pagos, cobros, facturación ni pasarelas.
- No crear cuentas de conductor; el conductor es anónimo y solo consulta.
- No crear historial general de ocupación ni bitácora de auditoría; solo se permite el resumen mínimo de estancia definido en el alcance.
- No implementar WebSockets, Channels, Redis para disponibilidad ni código equivalente.
- No conectar web o móvil directamente a Supabase/PostgreSQL.
- No usar OSM, Nominatim ni otra API cartográfica como base de datos de parqueaderos.
- No descargar, precargar ni empaquetar tiles OSM.
- No crear `.env` reales, secretos, tokens ni credenciales de ejemplo plausibles.
- No modificar decisiones pendientes sin aprobación explícita.
- No eliminar información de `cambios.md` o `parkingPaTi.md`.

## Arquitectura backend

Todo caso de uso debe seguir:

```text
controller/view -> DTO/serializer -> service -> repository -> model/PostgreSQL
```

- Controllers gestionan HTTP y no consultan ORM.
- DTOs validan forma y tipos, no coordinan negocio.
- Services aplican negocio, autorización y transacciones.
- Repositories encapsulan ORM y persistencia.
- Models expresan esquema, constraints e invariantes simples.
- Adapters aíslan Drive, correo y otros proveedores.
- Django es la única puerta de acceso a PostgreSQL.

## Alcance técnico

- Backend: Django + DRF + PostgreSQL.
- Web: React/Vite, React Query y React Leaflet.
- Móvil: Expo/React Native, React Query y `react-native-maps`.
- Actualización: polling cada 5 segundos mientras la vista esté activa.
- Datos del mapa: API pública Django con filtro bbox limitado a Loja.
- Mapa base: tiles OSM o proveedor configurable con atribución.
- Destinos: Cloudflare Pages, Render y Supabase PostgreSQL.

## Cambios y verificación

- No tocar archivos ajenos a la fase sin justificarlo.
- No revertir cambios locales preexistentes.
- Agregar migraciones y pruebas cuando corresponda.
- Mantener OpenAPI, clientes y documentación alineados.
- Ejecutar checks de la fase y registrar resultados reales.
- Marcar incertidumbre como `No confirmado`.

## Terminado

Una tarea termina cuando respeta capas y alcance, tiene validación/permisos, pruebas pertinentes, documentación/contratos actualizados y pasa los comandos de su fase sin introducir secretos, mocks permanentes, IPs hardcodeadas ni funcionalidades excluidas.
