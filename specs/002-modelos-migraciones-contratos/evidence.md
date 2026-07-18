# Evidencia de fase 002

> Fecha: 2026-07-12  
> Estado: completada con PostgreSQL 16 efimero.

## Dependencias y decisiones

- Fase 000: completa.
- Fase 001: completada despues de corregir E302/E303 con excepcion explicita.
- DP-02: no existen tipos fisicos de espacio.
- DP-03: `NORMAL`, `DESCUENTO` e `INCREMENTO` tienen precio/hora independiente.
- DP-10: base y Drive sin datos; ruta aprobada desde base vacia.
- DP-13: direccion y ubicacion en tablas separadas.
- DP-14: estado de espacio y tarifa son catalogos independientes.
- DP-16/DP-17: fuente unica de tarifas y estados de espacio confirmados.

## Modelo implementado

- Persona-Cuenta, Cuenta-Parqueadero, Cuenta-Documento y
  Parqueadero-Direccion/Ubicacion usan OneToOne.
- VerificacionCorreo almacena hash, expiracion, uso y cuenta.
- Parqueadero separa habilitacion, operacion, conteos y configuracion.
- CategoriaTarifa reemplaza campo/estrategias heredadas; no hay porcentajes.
- Espacio usa nombre, estado, tarifa predeterminada y borrado logico.
- Estancia conserva solo snapshots, tiempos y costo informativo.
- Horario aplica unicidad diaria y apertura anterior al cierre.

## Arquitectura y contratos

- Controllers y DTOs no contienen ORM ni importan repositories.
- Services contienen permisos, transiciones y transacciones.
- Repositories encapsulan persistencia por modulo.
- API versionada bajo `/api/v1/`.
- Envelope uniforme: `{error, code, detail, fields}`.
- OpenAPI generado en `docs/openapi.yaml` y publicado en `/api/v1/schema/`.
- No existen Channels, WebSockets, Redis, pagos, reservas ni acceso cliente a DB.

## Migraciones

- `.gitignore` ya no excluye directorios `migrations`.
- Se generaron migraciones iniciales para usuarios, parqueaderos, tarifas,
  horarios, documentos y estancias.
- PostgreSQL de prueba: imagen local `postgres:16.3-alpine`, contenedor efimero
  sin volumen ni datos reales.
- `migrate --noinput` aplico todas las migraciones desde una DB vacia.
- DP-10 descarta una ruta de upgrade con datos heredados; no se requirio data migration.

## Comandos y resultados

| Comando | Resultado |
|---|---|
| `pip install -r requirements/dev.txt` | Exitoso |
| `manage.py check` | Exitoso; 0 issues |
| `manage.py makemigrations --check --dry-run` | Exitoso; sin cambios |
| `manage.py migrate --noinput` | Exitoso sobre PostgreSQL vacio |
| `manage.py migrate --check` | Exitoso; sin migraciones pendientes |
| `python -m pytest -q` | Exitoso; 13 pruebas pasaron |
| `python -m pip check` | Exitoso; sin dependencias rotas |
| `manage.py spectacular --validate` | Exitoso; 0 errores y 0 warnings |

## Cobertura funcional de pruebas

- OneToOne de identidad, propietario y parqueadero.
- Unicidad/precio no negativo de tarifas.
- Nombre activo unico y borrado logico de espacios.
- Una estancia activa por espacio.
- Horario unico y rango valido.
- Transiciones de onboarding y habilitacion.
- Tarifa `NORMAL` no desactivable ni eliminable.
- Envelope de error y publicacion OpenAPI.

## Riesgos pendientes

- Los clientes web/movil aun consumen contratos heredados; su alineacion
  funcional corresponde a fases posteriores.
- La integracion real de Drive y validacion profunda de archivos corresponde a fase 003.
- La prueba uso PostgreSQL efimero; despliegue Supabase se valida en fase 010.

## Estado de fase

**Completada el 2026-07-12.** Todos los criterios de aceptacion cuentan con
evidencia ejecutada y no quedan tareas abiertas en esta fase.
