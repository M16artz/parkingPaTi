---
name: maps-osm-leaflet
description: Implementar o revisar mapas de ParkingPaTi en React Leaflet o react-native-maps, con datos desde Django, bbox limitado a Loja y tiles OSM/proveedor configurables. Usar en selector de ubicación y consulta pública web/móvil.
---

# Mapas OSM y Leaflet

## Cuándo usarlo

Usar para componentes cartográficos, coordenadas, bbox, markers, tiles o polling vinculado al viewport.

## Reglas obligatorias

- Obtener parqueaderos únicamente desde Django/PostgreSQL.
- Usar mapa solo como base visual y selector de coordenadas.
- Respetar DP-01 para límites exactos de Loja.
- Web: React Leaflet; móvil: `react-native-maps`.
- Configurar URL/atribución del proveedor.
- Solicitar solo tiles visibles y respetar caché/licencia.
- Debounce al mover mapa y query key por bbox.
- Validar bbox también en backend.

## Antipatrones prohibidos

- OSM/Nominatim como buscador o DB de parqueaderos.
- Scraping, bulk download, prefetch o mapas offline.
- Ocultar atribución.
- Hardcodear proveedor de modo no reemplazable.
- Confiar solo en límites de cámara para validar coordenadas.
- Mezclar tiles y API del dominio en un mismo service.

## Checklist de salida

- [ ] Datos proceden de endpoint Django.
- [ ] Bbox/límites usan decisión aprobada.
- [ ] Atribución es visible.
- [ ] Estados de mapa y red son claros.
- [ ] No hay descarga/API OSM de datos.
- [ ] Tests cubren bbox y adapters.
