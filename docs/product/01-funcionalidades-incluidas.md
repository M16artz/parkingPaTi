# Funcionalidades incluidas

## Identidad y onboarding

- Cuenta de propietario y Persona uno a uno.
- Verificación y reenvío de correo.
- Una Cuenta tiene cero o un Parqueadero.
- Una Cuenta tiene un Documento de habilitación.
- Registro reanudable: cuenta, mapa/datos iniciales, documento y envío.
- Estados explícitos de onboarding y habilitación.

## Administración

- Lista paginada de solicitudes y cuentas.
- Revisión de nombres, identificación, correo, documento y ubicación visual.
- Aprobación con confirmación.
- Rechazo con motivo y confirmación.
- Deshabilitación de cuenta con confirmación y bloqueo real de acceso.

## Operación del propietario

- Configuración final obligatoria después de aprobación.
- Horarios y tarifas informativas.
- Cantidad inicial y creación en lote de espacios.
- Renombrar, tipar, agregar, deshabilitar y borrar lógicamente espacios.
- Tarifa normal predeterminada y selección de otra tarifa activa.
- Inicio y fin de estancia con redondeo al entero superior.
- Registro mínimo: tiempos, snapshot de tarifa y costo informativo.

## Consulta pública

- Mapa/lista/detalle sin cuenta.
- Parqueaderos aprobados y activos dentro del bbox de Loja.
- Disponibilidad, horarios y valores de tarifa.
- Polling REST con React Query cada 5 segundos cuando la vista esté activa.
- Leaflet en web y `react-native-maps` en móvil.

## Plataforma y calidad

- Django/DRF/PostgreSQL por capas.
- Documento privado en Drive con ID y enlace persistidos.
- OpenAPI como contrato compartido.
- Pruebas, CI, seguridad y despliegue reproducible.
