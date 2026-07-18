# Tareas de fase 000

- [x] `docs` Inventariar nombres de secretos/rutas expuestas sin registrar valores.
- [x] `infra` Identificar responsables de DB, Drive, correo y proveedores. **Evidencia:** Miguel Armas confirmó responsabilidad sobre PostgreSQL/Supabase, Drive, correo, Render, Cloudflare y seguridad el 2026-07-12.
- [x] `security` Rotar credenciales/clave Django fuera del repositorio. **Evidencia:** Miguel Armas confirmó la rotación de PostgreSQL, Django y servicios externos el 2026-07-12; no se registraron valores.
- [x] `docs` Registrar confirmación o ausencia de datos reales (DP-10). **Evidencia:** PostgreSQL y Drive fueron confirmados sin datos; no aplica backup de PostgreSQL.
- [x] `docs` Registrar cuenta/carpeta/permisos Drive o mantener DP-08 abierta.
- [x] `infra` Retirar `.env` real del seguimiento y reforzar `.gitignore`.
- [x] `security` Evaluar limpieza del historial Git y coordinarla si se aprueba. **Resultado:** se conservará el historial y se trabajará en rama; las credenciales históricas fueron confirmadas como rotadas.
- [x] `backend` Registrar versión Python objetivo sin instalar funcionalidad. **Objetivo aprobado:** Python 3.13.
- [x] `web` Registrar versiones Node/npm objetivo. **Objetivo aprobado:** Node 22 LTS y la versión de npm incluida con esa distribución.
- [x] `mobile` Registrar versión Expo/React Native objetivo compatible. **Objetivo aprobado:** Expo SDK 54, con React Native 0.81 según su matriz compatible.
- [x] `tests` Capturar baseline de checks/builds sin alterar código.
- [x] `docs` Actualizar decisiones resueltas y cerrar criterios de fase. **Evidencia:** DP-10 y DP-15 resueltas; DP-08 conserva únicamente la configuración futura de Drive y no bloquea el baseline.

Evidencia detallada: `specs/000-baseline-seguridad/evidence.md`.
