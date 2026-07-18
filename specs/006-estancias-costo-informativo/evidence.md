# Evidencia de fase 006

## Tarifa visible de estancia activa - 2026-07-17

- La respuesta de configuración incluye `estancia_tarifa_codigo` y
  `estancia_precio_hora` desde el snapshot de la única estancia activa.
- La grilla usa esos valores cuando el espacio está `OCUPADO` y conserva la
  tarifa predeterminada para espacios no ocupados.
- Prueba de integración incluida para una estancia con tarifa `DESCUENTO`.
- Verificación conjunta fases 005-006: 20 pruebas backend aprobadas.

## Estado

Fase completada: 12 de 12 tareas verificadas.

## Dependencias y decisiones

- La fase 005 estaba completada con 13 de 13 tareas.
- DP-04 fue aprobada por Miguel Armas el 2026-07-13.
- Retencion: 12 meses.
- Acceso: propietario sobre su parqueadero y administradores sobre todos.
- Vencimiento: eliminacion fisica.

No quedaron decisiones bloqueantes para esta fase.

## Backend por capas

- Controllers HTTP: `apps/estancias/controllers.py`.
- DTOs de entrada, respuesta y registro: `apps/estancias/serializers_dto.py`.
- Negocio, autorizacion, calculo y transacciones:
  `apps/estancias/services.py`.
- ORM, locks, listado y purga: `apps/estancias/repositories.py`.
- Modelo/constraints: `apps/estancias/models.py` y migracion `0003`.

Inicio y fin bloquean parqueadero, espacio y estancia segun corresponda. El
inicio usa `NORMAL` al omitir tarifa, valida pertenencia/estado y guarda
snapshot. El preview no muta. El fin usa Decimal/ceil, libera el espacio y
recalcula conteos en la misma transaccion.

## Contratos implementados

- `POST /api/v1/owner/spaces/{id}/stays/start/`.
- `GET /api/v1/owner/spaces/{id}/stays/current/`.
- `POST /api/v1/owner/spaces/{id}/stays/finish/`.
- `GET /api/v1/owner/stays/`.
- `GET /api/v1/admin/stays/`.

Las listas son paginadas y excluyen registros vencidos. El comando
`purge_expired_stays` realiza la eliminacion fisica. Su programacion en Render
pertenece a la fase 010.

## Web

- `NORMAL` aparece seleccionada por defecto.
- El inicio exige confirmacion y una tarifa activa.
- Un espacio ocupado permite consultar un preview.
- Finalizar muestra minutos, horas, snapshot y costo con la etiqueta
  `Valor informativo`.
- No existen campos de conductor, placa, pago o facturacion.

## Criterios de aceptacion

1. Las pruebas de rollback verifican que inicio y fin no dejan estados
   parciales.
2. Cambiar el precio de la tarifa despues del inicio no altera el snapshot ni
   el costo final.
3. Los casos 1, 60 y 61 minutos producen 1, 1 y 2 horas; tambien se probo 181
   minutos como 4 horas.
4. Dos inicios concurrentes sobre PostgreSQL producen una estancia y un
   conflicto, nunca dos activas.

## Verificaciones

| Verificacion | Resultado |
|---|---|
| Pruebas especificas fase 006 | 10 aprobadas |
| Suite backend completa | 44 aprobadas |
| Suite web | 11 aprobadas |
| Django check | Sin problemas |
| Migraciones desde base vacia | Correctas, incluida `estancias.0003` |
| `makemigrations --check --dry-run` | Sin cambios pendientes |
| OpenAPI | 0 warnings, 0 errores |
| ESLint web | Correcto |
| Build Vite | Correcto |
| `pip check` | Sin dependencias rotas |
| Comando de purga | Ejecutado correctamente |
| Escaneo de alcance prohibido en archivos de fase | 0 coincidencias |

PostgreSQL 16.3 se ejecuto en un contenedor efimero, sin volumen. El contenedor
y el directorio `dist` generado fueron retirados al terminar.

## Incidencias corregidas durante verificacion

- La primera prueba paginada detecto que el DTO calculado no serializaba
  modelos. Se separo `EstanciaRegistroDTO`; la repeticion paso 10/10.
- OpenAPI detecto una colision de operation ID entre propietario/admin. Se
  separaron controllers y permisos; la validacion final quedo sin warnings.

## Riesgos residuales

- La ejecucion programada de `purge_expired_stays` debe configurarse en fase
  010. Mientras tanto, las consultas ya ocultan registros vencidos.
- Vite mantiene el warning conocido de bundle mayor a 500 kB; corresponde a
  fase 009.
- No se implemento UI administrativa de historial; el acceso aprobado existe
  mediante API paginada. La fase 006 solo exige acciones web del propietario.

## Bloqueos

Ninguno para el cierre de la fase 006.
