# Mapas y polling

## Fuente de datos

```text
Cliente -> Django -> PostgreSQL: parqueaderos
Mapa -> proveedor de tiles: base visual
```

Nunca consultar OSM/Nominatim para descubrir parqueaderos.

## Web y móvil

- Web: React Leaflet.
- Móvil: `react-native-maps`.
- Bbox aprobado de Loja: longitud `[-79.2770, -79.1300]` y latitud
  `[-4.0800, -3.8950]`.
- Backend admite una tolerancia adicional de `0.01` grados al validar el punto.
- El selector web mantiene visualmente el bbox base, sin la tolerancia.
- El selector de onboarding obtiene coordenadas del gesto sobre el mapa.
- Dirección se captura en formulario, sin geocodificación en esta fase.

La fase 008 implementa en móvil la consulta pública anónima con
`react-native-maps`. Lista y detalle consumen el mismo contrato OpenAPI que la
web; el mapa calcula el bbox visible, lo limita a Loja y aplica debounce de
400 ms antes de cambiar la query key.

## Polling

- React Query en ambos clientes.
- `refetchInterval: 5000` con vista activa.
- `refetchIntervalInBackground: false`.
- Pausar en pestaña/app en background.
- Debounce al mover mapa y query key por bbox.
- Invalidar cache tras escrituras del propietario.
- Mostrar última actualización, error y retry.
- Web cancela la consulta anterior al cambiar viewport y aplica debounce de
  400 ms antes de cambiar la query key.
- Móvil vincula `AppState` a `focusManager`, registra conectividad en
  `onlineManager` y deshabilita la query si la pantalla no está enfocada o la
  app deja de estar activa.

## Tiles

- URL/atribución configurables.
- Solicitar solo tiles visibles y respetar caché.
- No prefetch, descarga masiva ni modo offline.
- Evaluar proveedor productivo en DP-12.

DP-12 sigue `No confirmado` para produccion. El cliente usa
`VITE_MAP_TILE_URL` y `VITE_MAP_ATTRIBUTION`; el valor por defecto es el
servicio estandar OSM best-effort, sin descargar ni precargar tiles.

El móvil usa `EXPO_PUBLIC_MAP_TILE_URL` y `EXPO_PUBLIC_MAP_ATTRIBUTION`. Si no
se configura una plantilla de tiles, usa el proveedor nativo de
`react-native-maps` y conserva la atribución del SDK además de la etiqueta
configurada. No existe proveedor productivo asumido.

## Retiro

La fase 007 elimino consumers, routing WS, Channels/Redis, hooks y dependencias
WebSocket despues de disponer de polling probado. El movil conserva su
integracion REST real para fase 008, pero ya no contiene servicio/hook WS.
