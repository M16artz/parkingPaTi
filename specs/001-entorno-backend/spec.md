# Fase 001: Entorno backend reproducible

## Objetivo

Lograr que un clon limpio instale el backend en `backend/venv` y ejecute checks sin imports/configuración faltante.

## Incluye

- Requirements base/dev/prod coherentes con el objetivo sin WebSockets.
- Variables de ejemplo seguras y settings por entorno.
- PostgreSQL local/test configurable.
- Health endpoint y logging técnico mínimo.

## No incluye

- Rediseño de modelos o migraciones de negocio.
- Onboarding, Drive funcional o correo funcional.

## Criterios de aceptación

- `pip install -r requirements/dev.txt` funciona en el venv.
- `manage.py check` pasa.
- No se requieren Daphne, Channels ni Redis.
- Ningún valor sensible queda versionado.
