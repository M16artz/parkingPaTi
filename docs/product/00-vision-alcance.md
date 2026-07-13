# Visión y alcance

ParkingPaTi ayuda a propietarios a habilitar y operar un parqueadero y permite a conductores anónimos consultar parqueaderos de Loja, Ecuador.

## Problema

- El propietario necesita registrar datos, ubicación y documento, obtener aprobación y configurar su operación.
- El conductor necesita localizar parqueaderos y ver disponibilidad, horario y tarifas informativas sin registrarse.
- El administrador necesita revisar solicitudes y bloquear cuentas cuando corresponda.

## Producto objetivo

```text
React/Vite ─┐
            ├── HTTPS REST -> Django/DRF -> PostgreSQL
React Native┘                    ├-> Google Drive privado
                                └-> proveedor de correo
```

El sistema gestiona cuentas de propietario, habilitación, parqueaderos, espacios, horarios, tarifas y estancias informativas. No gestiona reservas ni pagos.

## Actores

- **Conductor anónimo:** consulta mapa, lista y detalle.
- **Propietario:** completa onboarding y administra su único parqueadero.
- **Administrador:** revisa solicitudes/documentos y deshabilita cuentas.
- **Servicios externos:** Drive privado, correo, tiles y PostgreSQL gestionado.

## Resultado esperado

Un flujo vertical demostrable desde registro y verificación hasta consulta pública web/móvil con polling, desplegado en los servicios definidos.

## Fuentes

- Histórica: `cambios.md`.
- Hallazgos: `parkingPaTi.md`.
- Alcance operativo: documentos de esta carpeta y `AGENTS.md`.
