# Evidencia de fase 007

## Estado

Fase completada: 14 de 14 tareas verificadas.

## Dependencias y decisiones

- Fase 005 completada con 13 de 13 tareas.
- DP-01 resuelta: bbox base de Loja y tolerancia adicional de `0.01` grados.
- DP-12 sigue `No confirmado` para produccion. No bloquea esta fase porque URL
  y atribucion son configurables, conforme a AGENTS y ADR-003.

No se asumio proveedor con SLA, cuenta externa ni credencial.

## Backend por capas

- Controller anonimo: `public_controllers.py`.
- DTO de bbox y respuestas compartidas: `public_serializers_dto.py`.
- Reglas de visibilidad y detalle: `public_services.py`.
- ORM bbox, select/prefetch y filtros: `repositories.py`.
- Indice compuesto de visibilidad: migracion `parqueaderos.0004`.

Rutas implementadas:

- `GET /api/v1/public/parkings/?bbox=minLng,minLat,maxLng,maxLat`.
- `GET /api/v1/public/parkings/{id}/`.

Solo aparecen parqueaderos aprobados, configurados, con cuenta activa y estado
publico. El detalle excluye propietario, documento y espacios internos.

## Web publica

- `/` abre la experiencia anonima `/parkings`.
- React Leaflet muestra mapa limitado a Loja, lista y detalle.
- React Query usa intervalo de 5000 ms, pausa en background y retry.
- El viewport usa query key por bbox, cancelacion y debounce de 400 ms.
- Existen estados loading, empty, error/retry y data.
- Leaflet mantiene atribucion visible y tiles configurables.
- Los marcadores proceden exclusivamente de la API Django.

## Retiro WebSocket/Redis

- Backend ya no contiene consumers, routing WS, Channels ni configuracion
  Redis; requirements tampoco incluyen esas dependencias.
- Web no contiene hooks/imports WebSocket.
- Se eliminaron del movil `useRealTimeParkings.ts` y `parkingService.ts`, junto
  con comentarios/imports obsoletos. No se integro todavia la API movil.
- Infraestructura activa no declaraba Redis; no fue necesario modificarla.
- Escaneo final: cero coincidencias de WebSocket, Channels, Redis, IP local,
  Supabase directo, Nominatim u OSM API como datos.

## Criterios de aceptacion

1. La configuracion probada usa polling cada 5 s, por debajo del maximo de 10 s
   en condiciones normales; una segunda consulta refleja disponibilidad nueva.
2. Bbox ausente, mal formado, invertido o fuera de Loja responde 400; bbox base
   y tolerancia aprobada responden correctamente.
3. El escaneo de backend, web, movil, infraestructura y requirements produce
   cero remanentes WebSocket/Redis.
4. Servicio web y marcadores consumen `/api/v1/public/parkings/`; tiles se
   solicitan por una configuracion separada.

## Verificaciones

| Verificacion | Resultado |
|---|---|
| Pruebas especificas fase 007 | 11 aprobadas |
| Suite backend completa | 55 aprobadas |
| Pruebas web | 14 aprobadas |
| Carga basica | 40 marcadores, 1 consulta ORM |
| Django check | Sin problemas |
| Migraciones desde base vacia | Correctas, incluida `parqueaderos.0004` |
| `makemigrations --check --dry-run` | Sin cambios pendientes |
| OpenAPI | 0 warnings, 0 errores |
| ESLint web | Correcto |
| Build Vite | Correcto |
| `pip check` | Sin dependencias rotas |
| Smoke HTTP/CORS | API 200, web 200, 1 marcador temporal |

La primera prueba web fallo por una extension ESM omitida y se corrigio. La
primera generacion OpenAPI emitio cuatro warnings de tipos calculados; se
tiparon los metodos y la generacion final quedo limpia.

## Riesgos y verificaciones pendientes

- TypeScript movil llega a un error preexistente: `ParkingCard.tsx` usa
  `address`, ausente en la interfaz local `Parking`. No corresponde corregir el
  modelo/integracion movil en esta fase; queda para fase 008.
- `npm ci` movil informa 12 vulnerabilidades moderadas del arbol aprobado;
  su actualizacion se evalua en fases 008/009 sin ejecutar `audit fix` forzado.
- Vite advierte bundle principal de aproximadamente 551 kB; fase 009.
- El navegador integrado no estuvo disponible. Se verificaron HTTP, CORS,
  build, contrato y datos, pero no se genero captura automatizada.
- DP-12 debe resolverse antes del despliegue productivo en fase 010.

## Bloqueos

Ninguno para los criterios de aceptacion de la fase 007.
