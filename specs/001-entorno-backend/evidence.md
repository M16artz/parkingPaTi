# Evidencia de fase 001

> Fecha: 2026-07-12  
> Alcance: entorno backend; no se redisenaron modelos ni contratos de negocio.

## Dependencias

- Fase 000: completada, 12 tareas cerradas.
- DP-15: resuelta con Python 3.13 como objetivo backend.
- Otras decisiones abiertas: no bloquean esta fase.

## Cambios verificados

- `backend/venv` fue recreado con Python 3.13.14.
- `requirements/dev.txt` se instalo completamente en el venv.
- `pip check` informo `No broken requirements found`.
- Requirements y runtime ya no incluyen Daphne, Channels ni Redis.
- pytest, pytest-django, google-api-python-client y google-auth estan declarados.
- Development, production y test usan variables `DJANGO_*`, `DB_*` y `CORS_*` coherentes.
- Solo existe la plantilla rastreada `backend/.env.example`; no contiene valores sensibles.
- PostgreSQL local/test se configura mediante variables, sin SQLite ni acceso cliente directo.
- `GET /health/` no consulta DB, Drive ni proveedores.
- Logging tecnico escribe nivel, logger y mensaje; no configura cuerpos, tokens ni credenciales.

## Comandos y resultados

| Comando | Resultado |
|---|---|
| `py -3.13 -m venv backend/venv --clear` | Exitoso con permiso de WindowsApps |
| `backend/venv/Scripts/python.exe --version` | Python 3.13.14 |
| `python -m pip install -r backend/requirements/dev.txt` | Exitoso |
| `python -m pip install -r backend/requirements/prod.txt` | Exitoso |
| `python -m pip check` | Exitoso; sin requirements rotos |
| `python -m pytest -q` | Exitoso; 2 pruebas pasaron |
| `python manage.py check` | Exitoso al cierre; 0 issues tras la excepción de fase 002 |

## Bloqueo

`manage.py check` detecta que el reverse accessor
`EstrategiaTarifa.parqueadero -> Parqueadero.tarifa` colisiona con el campo
existente `Parqueadero.tarifa`. La correccion exige cambiar el contrato del
modelo y generar su migracion. Ese trabajo pertenece a la fase 002 y esta
explicitamente excluido de la fase 001.

Miguel Armas resolvio el 2026-07-12 que `TipoCategoriaTarifa` y
`CategoriaTarifa` seran la fuente unica, con `NORMAL` como tarifa obligatoria
y predeterminada. La decision esta registrada como DP-16; su implementacion y
el retiro de las representaciones heredadas permanecen en fase 002.

Miguel Armas autorizo el 2026-07-12 que fase 002 resuelva esta colision y que
fase 001 se cierre inmediatamente despues de que `manage.py check` pase.

No se agrego `SILENCED_SYSTEM_CHECKS` ni se excluyeron apps para ocultar el
error. Hasta que la fase 002 resuelva el modelo, el criterio
`manage.py check pasa` permanece incumplido.

## Estado de criterios

| Criterio | Estado |
|---|---|
| `pip install -r requirements/dev.txt` funciona | Cumplido |
| `manage.py check` pasa | Cumplido tras consolidar el modelo de tarifas en fase 002 |
| No se requieren Daphne, Channels ni Redis | Cumplido |
| Ningun valor sensible queda versionado | Cumplido para el alcance de la fase |

## Estado de fase

**Completada el 2026-07-12.** `manage.py check` pasa con cero issues despues de
la correccion E302/E303 autorizada como excepcion de dependencia en fase 002.
