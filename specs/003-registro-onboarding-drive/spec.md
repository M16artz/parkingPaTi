# Fase 003: Registro, onboarding y Drive

## Objetivo

Implementar el onboarding reanudable desde la cuenta hasta el envío de solicitud con documento privado.

## Incluye

- Registro Persona/Cuenta.
- Verificación/reenvío de correo.
- Login restringido por estado.
- Selección de coordenadas en mapa de Loja y datos iniciales.
- Adapter Drive privado con nombre `apellido_nombre_<id>`.
- Envío de solicitud y recuperación ante fallos.

## No incluye

- Decisión administrativa.
- Configuración final/espacios.
- Integración móvil.

## Criterios de aceptación

- Flujo puede interrumpirse y reanudarse.
- No se envía solicitud sin correo/parqueadero/documento completos.
- El registro completo conserva `CORREO_PENDIENTE` hasta verificar el correo y luego pasa directamente a `REVISION_PENDIENTE`; no repite datos iniciales ni documento.
- El login usa `correo` como identificador, mantiene `email = correo` en la tabla y admite propietarios en `CONFIGURACION_PENDIENTE`; `is_active=false` siempre bloquea, mientras que un indicador de correo heredado desincronizado no invalida un estado ya aprobado.
- Drive y DB conservan IDs/enlace coherentes y privados.
- No se exponen tokens/documentos en logs.
