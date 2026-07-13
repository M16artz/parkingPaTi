# Manual del panel administrativo

## Acceso

1. Iniciar sesion con una cuenta cuyo rol sea `ADMINISTRADOR`.
2. El login dirige a `/admin/applications`.
3. La guarda web consulta `/auth/me/`; Django vuelve a validar rol y cuenta
   activa en cada endpoint.

## Revisar una solicitud

1. Filtrar solicitudes pendientes o buscar por persona, identificacion,
   correo o parqueadero.
2. Abrir `Revisar` para consultar datos, marcador y metadatos del archivo.
3. Usar `Revisar documento privado`; la URL se obtiene en ese momento y Drive
   exige que el administrador tenga acceso autorizado.
4. Confirmar `Aprobar`, o ingresar un motivo de al menos tres caracteres y
   confirmar `Rechazar`.

Una respuesta `409` indica que otro administrador ya decidio o que los datos
cambiaron. Se debe recargar el detalle. Si el correo falla, la decision sigue
vigente y el panel lo informa.

## Deshabilitar una cuenta

1. Abrir la pestaña `Cuentas` y aplicar filtros si corresponde.
2. Pulsar `Deshabilitar` y confirmar el mensaje.
3. La cuenta pierde login/refresh y su parqueadero queda inactivo.

No existe accion de rehabilitacion por DP-06. La recuperacion de una cuenta
deshabilitada requiere una decision de alcance futura y no debe hacerse con
cambios manuales en base de datos.
