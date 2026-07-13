# Fase 000: Baseline y seguridad

## Objetivo

Establecer una línea base segura y confirmar precondiciones antes de modificar funcionalidad.

## Incluye

- Inventario de secretos y rotación coordinada.
- Retiro del `.env` real del seguimiento sin publicar valores.
- Confirmación de DB/Drive/datos existentes.
- Registro de versiones soportadas.
- Aprobación del modelo/decisiones que bloquean fase 002.

## No incluye

- Corregir flujos backend o frontend.
- Crear migraciones definitivas.
- Desplegar servicios.

## Criterios de aceptación

- No quedan secretos vigentes rastreados.
- El equipo sabe si debe migrar datos reales.
- Riesgos y decisiones bloqueantes están registrados.
- `cambios.md` y `parkingPaTi.md` permanecen intactos.
