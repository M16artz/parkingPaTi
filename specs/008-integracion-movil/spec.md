# Fase 008: Integración móvil

## Objetivo

Convertir el prototipo móvil en un cliente anónimo real de la API pública.

## Incluye

- Instalación Expo reproducible y TypeScript limpio.
- React Query para React Native.
- Mapa, lista y detalle con datos Django.
- Polling con pausa en background.
- Configuración HTTPS por ambiente.

## No incluye

- Cuenta de conductor.
- Propietario móvil salvo resolución explícita DP-11.
- Datos hardcodeados o WebSockets.

## Criterios de aceptación

- `tsc`/checks Expo pasan.
- Dispositivo/emulador usa staging HTTPS sin IP local.
- Datos/contratos coinciden con OpenAPI y refrescan.
