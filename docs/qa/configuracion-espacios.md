# Manual de configuracion y espacios

## Primer ingreso aprobado

1. Iniciar sesion como propietario aprobado.
2. La aplicacion dirige a `/owner/configuration` mientras el estado sea
   `CONFIGURACION_PENDIENTE`.
3. Activar al menos un dia y definir apertura anterior al cierre.
4. Ingresar el precio por hora `NORMAL`; descuento e incremento son opcionales.
5. Indicar la cantidad inicial y guardar.

Horarios, tarifas y espacios se guardan juntos. Si una parte falla, ninguna se
conserva y el formulario puede reintentarse sin duplicar espacios.

## Gestion posterior

- `Crear lote` agrega entre 1 y 100 espacios con una sola solicitud.
- Seleccionar una celda permite renombrar y cambiar tarifa/estado.
- `Deshabilitar` conserva el espacio activo con estado `INHABILITADO`.
- `Eliminar` conserva la fila con borrado logico y exige confirmacion.
- `Reactivar` restaura un eliminado si su nombre no colisiona con uno activo.

El propietario no puede marcar manualmente un espacio como `OCUPADO`; esa
transicion pertenece al flujo de estancia de fase 006. No existen tipos fisicos
de espacio por DP-02.
