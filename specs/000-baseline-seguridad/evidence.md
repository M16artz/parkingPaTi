# Evidencia de fase 000

> Fecha: 2026-07-12  
> Regla: este archivo registra nombres y estados; nunca valores sensibles.

## Dependencias

- Fases previas: ninguna.
- Decisiones necesarias para iniciar: ninguna.
- Estado: confirmaciones externas recibidas y registradas el 2026-07-12; no hay dependencias abiertas para cerrar la fase.

## Inventario de exposición

| Ubicación | Nombres detectados | Estado |
|---|---|---|
| `.env` raíz | `DB_PASSWORD`, `SECRET_KEY` y configuración DB relacionada | Archivo real rastreado al iniciar; valores no reproducidos |
| `backend/.env.example` | `DJANGO_SECRET_KEY`, `DB_PASSWORD`, `GOOGLE_DRIVE_CREDENTIALS_PATH`, `GOOGLE_DRIVE_FOLDER_ID` | Plantilla; debe conservar solo valores inertes |
| Settings/backend | Referencias a secret, password, tokens y credenciales | Código, no valores incrustados confirmados por este inventario |

No se detectaron por nombre archivos de clave privada (`.pem`, `.key`, `.p12`) rastreados. La búsqueda por nombres no sustituye un secret scanner completo; este queda para fase 009.

## Historial Git

- `.env` aparece en 1 commit del historial alcanzable.
- Primera y última fecha detectada para ese archivo: 2026-06-26.
- La limpieza del historial reescribe commits y requiere aprobación/coordinación de todos los colaboradores.
- Recomendación: rotar primero; después decidir limpieza del historial. No se ejecutó reescritura.

## Proveedores y responsables

| Recurso | Evidencia local | Responsable | Estado |
|---|---|---|---|
| PostgreSQL/Supabase | Variables DB locales; sin config Supabase/Render | Miguel Armas | Responsable confirmado |
| Google Drive | Adapter y variables de ejemplo | Miguel Armas | Sin documentos existentes; configuración futura en DP-08 |
| Correo | Sin proveedor configurado | Miguel Armas | Responsable confirmado; proveedor futuro en DP-07 |
| Tiles | Uso actual en clientes; proveedor final abierto | No confirmado | DP-12 abierta |
| Cloudflare Pages | Sin configuración operativa | Miguel Armas | Responsable confirmado; implementación en fase 010 |
| Render | Sin `render.yaml`/servicio verificable | Miguel Armas | Responsable confirmado; implementación en fase 010 |

No existe `.github/CODEOWNERS`. La responsabilidad operativa fue confirmada explícitamente por Miguel Armas el 2026-07-12; su formalización en configuración del repositorio queda fuera de esta fase.

## Datos existentes

- No se detectaron dumps `.sql`, `.dump`, `.backup`, SQLite ni DB locales fuera de dependencias.
- Miguel Armas confirmó que PostgreSQL no contiene datos y que no aplica un backup previo.
- Miguel Armas confirmó que Drive no contiene documentos; no hay archivos ni permisos existentes que migrar.
- DP-10 queda resuelta: la fase 002 puede diseñar migraciones sin estrategia de conservación de datos preexistentes.

## Toolchain observado

| Área | Observado | Objetivo |
|---|---|---|
| Python global | 3.14.4 | Python 3.13 |
| Python `backend/venv` | 3.14.4 | Python 3.13; ajuste corresponde a fase 001 |
| Node | 24.14.1 | Node 22 LTS |
| npm | 11.11.0 | Versión incluida con Node 22 LTS |
| Expo manifest | `~54.0.35` | Expo SDK 54 |
| React Native manifest | `0.81.5` | React Native 0.81, compatible con Expo SDK 54 |
| TypeScript móvil | `~5.9.2` | Mantener compatibilidad con Expo SDK 54; cambios corresponden a fase 008 |

Miguel Armas aprobó las versiones objetivo el 2026-07-12. DP-15 queda resuelta; no se actualizan runtimes ni dependencias en fase 000.

## Rotación

- Rotación de credenciales PostgreSQL: confirmada como completada por Miguel Armas el 2026-07-12.
- Rotación de clave Django: confirmada como completada por Miguel Armas el 2026-07-12.
- Rotación de servicios externos: confirmada como completada por Miguel Armas el 2026-07-12.
- Revisión de Drive: confirmada sin archivos existentes; no hubo permisos de documentos que revocar o migrar.
- Responsable de ejecución y confirmación: Miguel Armas.

El `.env` fue retirado del índice y sus valores históricos fueron confirmados como revocados mediante rotación. Por decisión de Miguel Armas, se conserva el historial Git y se continúa el trabajo en rama. La rama observada al cierre es `refactor1`; no se reescribieron commits.

## Baseline de verificaciones

| Verificación | Resultado | Destino |
|---|---|---|
| Backend `manage.py check` con `backend/venv` | Falló: settings exige `DJANGO_SECRET_KEY`, ausente por contrato actual | Fase 001 |
| Backend pytest | No ejecutable: pytest no está instalado en el venv | Fase 001 |
| Web build Vite | Exitoso: 1630 módulos transformados; artefacto `dist` eliminado | Baseline verde |
| Web lint | No ejecutable: comando `eslint` no disponible | Fases 001/009 según dependencia web |
| Web audit offline producción | 0 vulnerabilidades conocidas en caché local | Limitado; fase 009 hará auditoría vigente |
| Móvil TypeScript | Falló: dependencias/tsconfig no resolubles y errores de contrato/tipos | Fase 008 |
| Móvil audit offline producción | 0 vulnerabilidades conocidas en caché local | Limitado; fase 009 hará auditoría vigente |
| `.env` local | Existe y permanece intacto | Correcto para esta operación |
| `.env` en índice | Retirado | Correcto |
| `.env` ignorado | Sí | Correcto |

No se instalaron dependencias, no se corrigió código funcional y no se crearon migraciones/contratos.

## Estado de criterios

| Criterio de fase | Estado |
|---|---|
| No quedan secretos vigentes rastreados | Cumplido para el alcance de fase: `.env` está fuera del índice y Miguel Armas confirmó la rotación de PostgreSQL, Django y servicios externos. El escaneo automatizado completo permanece planificado para fase 009 |
| El equipo sabe si debe migrar datos reales | Cumplido: PostgreSQL y Drive están vacíos; no aplica backup ni migración de datos preexistentes |
| Riesgos y decisiones bloqueantes registrados | Cumplido en esta evidencia y DP-08/DP-10/DP-15 |
| Fuentes históricas intactas | Cumplido; no se editaron `cambios.md` ni `parkingPaTi.md` |

## Estado de fase

**Completada el 2026-07-12.** Todos los criterios de aceptación de la fase 000 están respaldados por evidencia local o confirmación explícita de Miguel Armas. Esto habilita la fase 001, pero no la inicia ni modifica funcionalidad del producto.
