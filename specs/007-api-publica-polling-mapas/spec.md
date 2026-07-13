# Fase 007: API pública, polling y mapas

## Objetivo

Entregar consulta anónima de parqueaderos de Loja y reemplazar completamente WebSockets por polling REST.

## Incluye

- Endpoint bbox y detalle público.
- Solo parqueaderos aprobados, configurados y activos.
- Mapa/lista/detalle web.
- React Query cada 5 s con pausa en background.
- Retiro de Consumers, Channels, Redis y clientes WebSocket.

## No incluye

- Móvil real (fase 008).
- Geocodificación, descarga/offline o API OSM.

## Criterios de aceptación

- Cambio visible en máximo 10 s en condiciones normales.
- Bbox inválido/fuera de Loja se valida.
- No quedan rutas/imports/dependencias WebSocket.
- Marcadores vienen de Django/PostgreSQL.

## Decisiones aplicadas

- DP-01 define bbox base y tolerancia de `0.01` grados.
- DP-12 permanece pendiente para produccion. La fase usa URL y atribucion de
  tiles configurables; no presupone SLA, credenciales ni proveedor definitivo.
