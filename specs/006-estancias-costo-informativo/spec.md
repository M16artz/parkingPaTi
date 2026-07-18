# Fase 006: Estancias y costo informativo

## Objetivo

Permitir ocupar/liberar un espacio y calcular un valor informativo sin introducir pagos ni auditoría general.

## Incluye

- Tarifa normal predeterminada y selección de tarifa activa.
- Una estancia activa por espacio.
- Snapshot de tipo/precio.
- Fin, minutos, horas redondeadas hacia arriba y costo.
- Registro minimo con retencion de 12 meses, acceso de propietario/admin y
  eliminacion fisica al vencer, segun DP-04.

## No incluye

- Placa/identidad del conductor.
- Pago, recibo fiscal o facturación.
- Historial de eventos intermedios.

## Criterios de aceptación

- Inicio/fin y espacio cambian atómicamente.
- Cambios posteriores de tarifa no alteran la estancia.
- Casos 1, 60 y 61 minutos calculan 1, 1 y 2 horas.
