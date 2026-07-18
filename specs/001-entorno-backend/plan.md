# Plan de fase 001

## Lecturas

- `docs/architecture/01-backend-por-capas.md`
- `skills/backend-django-layered/SKILL.md`
- `skills/security-secrets-auth/SKILL.md`

## Enfoque

1. Fijar versiones compatibles de Python/paquetes.
2. Podar dependencias WebSocket y declarar dependencias realmente usadas/test.
3. Unificar `DJANGO_SECRET_KEY` y settings.
4. Crear configuración PostgreSQL de test sin secretos.
5. Añadir health check aislado de negocio.
6. Verificar desde venv limpio y documentar comandos.

## Dependencias

Requiere fase 000. Habilita fase 002.
