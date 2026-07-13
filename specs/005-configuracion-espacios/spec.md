# Fase 005: Configuración y espacios

## Objetivo

Completar la configuración final del parqueadero y reparar la gestión integral de espacios.

## Incluye

- Horarios y tarifas en lote.
- Cantidad inicial y estados operativos; DP-02 excluye tipos fisicos.
- Creación masiva atómica.
- Grilla: renombrar, asignar tarifa, agregar, deshabilitar y borrado lógico.
- Asignacion de tarifa predeterminada por espacio; no se usa como tipo fisico.
- Reactivacion de borrado logico solo sin nombre activo duplicado.
- Conteos/disponibilidad transaccionales.

## No incluye

- Estancias/costo (fase 006).
- Polling público (fase 007).

## Criterios de aceptación

- Propietario aprobado no activa parqueadero sin configuración final.
- Operación masiva no deja parciales.
- Conteos y estado agregado coinciden con espacios activos.
- No se elimina físicamente desde la API.
