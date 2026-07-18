# Modelo de datos objetivo

Fuente historica: `cambios.md`, seccion 5. Decisiones: `docs/product/03-decisiones-pendientes.md`.

## Relaciones

```text
Persona 1 -- 1 Cuenta
Cuenta 1 -- 0..1 Parqueadero
Cuenta 1 -- 0..1 DocumentoHabilitacion
Parqueadero 1 -- 1 Direccion
Parqueadero 1 -- 1 Ubicacion
Parqueadero 1 -- N HorarioAtencion
Parqueadero 1 -- N CategoriaTarifa
Parqueadero 1 -- N Espacio
Espacio 1 -- N Estancia
```

## Entidades

- **Cuenta:** propietario o administrador, `is_active`, correo verificado y estado de onboarding. El campo heredado `email` se mantiene sincronizado mediante constraint con `correo`, que es el identificador de acceso del contrato.
- **VerificacionCorreo:** hash unico, expiracion, uso y cuenta; nunca token en texto plano.
- **Parqueadero:** propietario unico, habilitacion, operacion, conteos y configuracion.
- **Direccion/Ubicacion:** tablas OneToOne separadas por DP-13.
- **DocumentoHabilitacion:** metadata y referencias privadas de Drive, estado y revisor.
- **CategoriaTarifa:** fuente unica; `NORMAL`, `DESCUENTO` o `INCREMENTO`, cada una con precio/hora independiente.
- **Espacio:** nombre, estado, tarifa predeterminada y borrado logico; no tiene tipo fisico.
- **Estancia:** snapshot de tarifa/precio, inicio/fin, horas y costo informativo.
- **HorarioAtencion:** parqueadero y dia unico con apertura anterior al cierre.

## Estados

- Onboarding: correo pendiente, datos pendientes, revision, rechazado, configuracion, activo, deshabilitado.
- Habilitacion: borrador, pendiente, aprobado, rechazado.
- Parqueadero: abierto, lleno, cerrado, inactivo, fuera de servicio.
- Espacio: libre, ocupado, inhabilitado.
- Estancia: activa, finalizada, cancelada.

## Constraints

- OneToOne para Persona/Cuenta, Cuenta/Parqueadero, Cuenta/Documento y Parqueadero/Direccion/Ubicacion.
- Nombre de espacio activo unico por parqueadero.
- Categoria de tarifa unica por parqueadero; precio no negativo.
- `NORMAL` obligatoria, activa y no eliminable por regla de servicio.
- Una estancia activa por espacio; snapshots y total no negativos.
- Una estancia `ACTIVA` no tiene fin y una `FINALIZADA` exige fin, minutos,
  horas y costo.
- Horario unico por dia y apertura anterior al cierre.
- Disponibles no supera total; coordenadas dentro de rangos geograficos validos.

## Conteos de espacios

- `total_espacios`: espacios con `is_active=true`, incluidos los inhabilitados.
- `espacios_disponibles`: espacios activos con estado `LIBRE`.
- Sin espacios activos o sin configuracion final: parqueadero `INACTIVO`.
- Al menos un espacio libre: `ABIERTO`.
- Sin libres y con algun ocupado: `LLENO`.
- Todos los espacios activos inhabilitados: `FUERA_DE_SERVICIO`.
- `estado_operativo_manual` permite al propietario mantener `CERRADO` o
  `FUERA_DE_SERVICIO`; cuando es nulo se aplica el calculo anterior. Un
  parqueadero sin configuracion o sin espacios permanece `INACTIVO`.
- Borrado desde API siempre es logico (`is_active=false`, `deleted_at`); una
  reactivacion exige que no exista otro nombre activo igual.

DP-02 elimina el tipo fisico de `Espacio`. La tarifa predeterminada y el estado
operativo son conceptos independientes.

## Estancias y retencion

- Iniciar bloquea parqueadero y espacio, toma snapshot de tipo/precio y cambia
  el espacio de `LIBRE` a `OCUPADO` en una transaccion.
- Finalizar bloquea la estancia activa, persiste el resumen y libera el espacio
  en la misma transaccion.
- `minutos_reales = max(1, ceil(segundos / 60))`.
- `horas_cobradas = max(1, ceil(minutos_reales / 60))`.
- `costo_total = precio_hora_snapshot * horas_cobradas`, con `Decimal` a dos
  decimales.
- DP-04 conserva finalizadas durante 12 meses. Las consultas excluyen vencidas
  aun si la purga programada todavia no se ejecuto.
- `purge_expired_stays` elimina fisicamente finalizadas/canceladas vencidas;
  su programacion en Render corresponde a despliegue.

## Migracion

DP-10 confirmo PostgreSQL y Drive sin datos. La ruta aprobada es crear el
esquema desde una base PostgreSQL vacia mediante migraciones iniciales; no hay
transformacion ni preservacion de modelos heredados.
