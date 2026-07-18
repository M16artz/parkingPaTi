# Backend ParkingPaTi

## Requisitos

- Python 3.13.
- PostgreSQL accesible para migraciones y pruebas que usen base de datos.
- Variables locales basadas en `.env.example`; nunca versionar `backend/.env`.

## Instalacion

Desde la raiz del repositorio en Windows:

```powershell
py -3.13 -m venv backend/venv
backend/venv/Scripts/python.exe -m pip install -r backend/requirements/dev.txt
```

En Linux o macOS:

```bash
python3.13 -m venv backend/venv
backend/venv/bin/python -m pip install -r backend/requirements/dev.txt
```

Para desarrollo se puede crear `backend/.env` a partir de `.env.example`. Si
no se define `DJANGO_SECRET_KEY`, development y test usan una clave inerte y
explicita; production siempre exige una clave externa.

## Verificacion

Desde `backend/`:

```powershell
venv/Scripts/python.exe -m pip check
venv/Scripts/python.exe manage.py check
venv/Scripts/python.exe manage.py migrate --noinput
venv/Scripts/python.exe -m pytest -q
```

El endpoint `GET /health/` responde `{"status": "ok"}` sin consultar
PostgreSQL, Drive ni otros servicios externos.

La API se publica bajo `/api/v1/`; OpenAPI esta disponible en
`/api/v1/schema/` y Swagger UI en `/api/v1/docs/`.

## Configuracion

- `config.settings.development`: PostgreSQL local configurable por `DB_*`.
- `config.settings.test`: PostgreSQL de pruebas configurable por `DB_*`.
- `config.settings.production`: exige secretos y hosts desde el entorno.
- `DJANGO_LOG_LEVEL`: controla el nivel del logging tecnico a consola.
- SMTP Gmail/Workspace usa `EMAIL_HOST*`, `DEFAULT_FROM_EMAIL` y
  `FRONTEND_BASE_URL`; no registrar credenciales.
- Drive usa una cuenta de servicio, `GOOGLE_DRIVE_CREDENTIALS_PATH` y una
  carpeta exclusiva indicada por `GOOGLE_DRIVE_FOLDER_ID`.
- El refresh web reside en cookie HttpOnly; nombre, `Secure` y `SameSite` se
  controlan con las variables `JWT_*` de la plantilla.
- Los limites `LOJA_*` de la plantilla corresponden a DP-01.
- Staging Render usa `config.settings.production`, respeta HTTPS del proxy y
  puede exigir SSL PostgreSQL mediante `DB_SSL_REQUIRE=True`.
- El Blueprint mínimo de fase 008 está en `render.yaml`; sus variables marcadas
  `sync: false` se completan solo en Render.

## Flujo de onboarding

```text
registro -> verificacion de correo -> login -> datos iniciales
         -> documento privado -> envio a revision
```

El flujo se consulta y reanuda con `GET /api/v1/owner/onboarding-status/`.
No se debe usar el enlace de Drive como URL publica ni registrar tokens o IDs
de archivos en logs.

No se usan Daphne, Django Channels, Redis ni WebSockets. La disponibilidad se
actualizara mediante polling REST en su fase correspondiente.
