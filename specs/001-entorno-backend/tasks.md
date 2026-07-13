# Tareas de fase 001

- [x] `backend` Crear/recrear `backend/venv` con Python aprobado. **Evidencia:** Python 3.13.14.
- [x] `backend` Revisar y fijar requirements base/dev/prod. **Evidencia:** instalación dev/prod exitosa y `pip check` sin errores.
- [x] `backend` Retirar Daphne/Channels/Redis de settings y requirements objetivo. **Evidencia:** paquetes ausentes y referencias runtime retiradas.
- [x] `backend` Añadir pytest, pytest-django y dependencias Drive declaradas.
- [x] `backend` Unificar nombres de variables y settings development/production/test.
- [x] `infra` Mantener solo plantillas `.env.example` sin valores reales.
- [x] `backend` Configurar PostgreSQL local/test mediante variables.
- [x] `backend` Añadir `/health/` sin consultar servicios externos innecesarios.
- [x] `backend` Configurar logging técnico sin datos sensibles.
- [x] `tests` Ejecutar `manage.py check` desde el venv. **Evidencia:** cero issues tras consolidar tarifas con la excepción aprobada para fase 002.
- [x] `tests` Ejecutar un smoke test Django mínimo. **Evidencia:** 2 pruebas pasaron.
- [x] `docs` Documentar instalación/comandos y riesgos pendientes. **Evidencia:** `backend/README.md` y `specs/001-entorno-backend/evidence.md`.

Evidencia detallada: `specs/001-entorno-backend/evidence.md`.
