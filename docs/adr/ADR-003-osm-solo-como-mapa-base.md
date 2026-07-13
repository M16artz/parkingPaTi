# ADR-003: OSM solo como mapa base

- Estado: Aceptada
- Fecha: 2026-07-12
- Implementada: fase 007, 2026-07-13

## Contexto

Los clientes necesitan mapas de Loja y marcadores de parqueaderos del negocio.

## Decisión

Los parqueaderos provienen de Django/PostgreSQL. Leaflet y `react-native-maps` muestran tiles OSM o de un proveedor configurable. No usar API OSM/Nominatim como base de datos o búsqueda.

## Consecuencias

- Separación clara entre cartografía y dominio.
- Dirección se ingresa manualmente y coordenadas se eligen en mapa.
- Atribución/caché obligatorias; sin descarga, prefetch ni offline.
- Proveedor productivo queda en DP-12.

## Alternativas descartadas

- Buscar parqueaderos en OSM: datos no controlados por ParkingPaTi.
- Descargar tiles de Loja: contradice alcance/política del servicio estándar.
- Nominatim en esta fase: dependencia externa innecesaria.

## Evidencia de implementacion

Los marcadores se obtienen exclusivamente de
`GET /api/v1/public/parkings/?bbox=...`. React Leaflet consume por separado una
URL de tiles y atribucion configurables. DP-12 sigue pendiente para elegir el
proveedor productivo.
