# Arquitectura general

## Diagrama

```text
[Web React/Vite en Cloudflare Pages] ─┐
                                      ├── HTTPS REST -> [Django/DRF en Render]
[Móvil Expo/React Native] ────────────┘                         │
                                                               ├-> [Supabase PostgreSQL]
                                                               ├-> [Google Drive privado]
                                                               └-> [Correo]

[Leaflet/react-native-maps] -> [proveedor de tiles]
[Clientes] -> [Django] -> [PostgreSQL] para datos de parqueaderos
```

## Límites

- Django centraliza negocio, autorización y acceso a datos.
- Los clientes solo consumen HTTPS REST.
- Polling reemplaza por completo WebSockets.
- El proveedor cartográfico solo dibuja el mapa.
- Drive se accede mediante un adapter backend.

## Módulos

- `usuarios`: identidad, auth y correo.
- `parqueaderos`: datos, ubicación, estado y consulta pública.
- `documentos`: almacenamiento/revisión.
- `espacios`: inventario lógico y disponibilidad.
- `tarifas`: valores informativos.
- `estancias`: operación y costo informativo mínimo.
- `horarios`: atención por día.
- `administracion`: casos de revisión/bloqueo.

## Requisitos transversales

- Contratos versionados bajo `/api/v1/`.
- UTC en persistencia; zona de negocio `America/Guayaquil`.
- Paginación en colecciones administrativas.
- Errores uniformes y OpenAPI compartido.
