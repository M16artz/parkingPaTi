# Funcionalidades excluidas

No implementar en ninguna fase:

- Reservas de espacios.
- Pagos, cobros, facturación, recibos fiscales o pasarelas.
- Cuenta o autenticación de conductor.
- Datos personales o placa del conductor.
- Historial general de ocupación o bitácora de auditoría.
- WebSockets, Django Channels o Redis para disponibilidad.
- Acceso directo de web/móvil a Supabase o PostgreSQL.
- API de OSM/Nominatim como fuente de parqueaderos o geocodificador.
- Scraping, descarga masiva, prefetch u offline de tiles OSM.
- Motor de incrementos/descuentos porcentuales o cálculo fiscal.

## Excepción acotada

Se persiste únicamente el resumen de cada estancia: inicio, fin, minutos,
horas redondeadas, tarifa/precio snapshot y costo informativo. DP-04 limita su
consulta al propietario del parqueadero y administradores, establece 12 meses
de retención y exige eliminación física al vencer. No convierte al producto
en un sistema de auditoría, pagos ni gestión de clientes.

## Control de alcance

Una solicitud que contradiga este archivo requiere modificar primero la decisión de producto de forma explícita. Un agente no puede ampliar el alcance por inferencia.
