# Cliente móvil ParkingPaTi

Cliente Expo SDK 54 para consulta pública anónima de parqueaderos de Loja. No
incluye cuenta de conductor, autenticación ni operaciones de propietario.

## Configuración

Crear un archivo local ignorado a partir de `.env.example` y definir:

- `EXPO_PUBLIC_API_BASE_URL`: base HTTPS de Django terminada en `/api/v1`.
- `EXPO_PUBLIC_MAP_TILE_URL`: plantilla HTTPS opcional con `{z}`, `{x}` y `{y}`.
- `EXPO_PUBLIC_MAP_ATTRIBUTION`: atribución visible del proveedor configurado.

La app rechaza HTTP, localhost e IPs privadas. Las variables `EXPO_PUBLIC_*`
son visibles en el bundle y no deben contener secretos. Sin URL de tiles se
usa el mapa nativo de `react-native-maps`; DP-12 aún debe definir el proveedor
productivo.

## Comandos

```powershell
npm.cmd ci
npm.cmd run typecheck
npm.cmd test
npm.cmd run check:expo
npm.cmd start
```

`npm.cmd start` inicia Metro y muestra el QR para Expo Go. Expo Go ejecuta este
cliente móvil, no `frontend-web`. El teléfono y el equipo deben compartir red;
si la red bloquea LAN puede usarse `npx.cmd expo start --tunnel`, con una carga
más lenta. La API configurada sigue siendo el staging HTTPS exigido por la
fase: el túnel de Metro no convierte un Django local en backend público.

La app consulta lista bbox y detalle en Django, valida el JSON contra los tipos
de `docs/openapi.yaml` y refresca cada 5 segundos solo con pantalla y app
activas. Los estados de carga, error, vacío, retry y desconexión son visibles.

## Limitaciones

- El mapa está restringido al bbox aprobado de Loja.
- No hay geocodificación, descarga offline ni consulta de datos a OSM.
- El free tier puede introducir cold starts y respuestas lentas.
- El smoke Android requiere una URL staging HTTPS real y un dispositivo o
  emulador; no se reemplaza con una IP de red local.
