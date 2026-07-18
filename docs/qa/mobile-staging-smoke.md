# Smoke móvil contra staging

Este procedimiento prepara únicamente el staging mínimo autorizado para cerrar
fase 008. No ejecuta ni cierra fase 010.

## Recursos externos

Responsable: Miguel Armas.

1. Crear PostgreSQL staging en Supabase sin habilitar acceso desde clientes.
2. Copiar los parámetros del Session Pooler a variables privadas de Render.
3. Crear un Blueprint Render desde `render.yaml`.
4. Completar `DJANGO_ALLOWED_HOSTS` con el hostname asignado por Render.
5. Completar `DB_NAME`, `DB_USER`, `DB_PASSWORD` y `DB_HOST` en Render.
6. Confirmar que build, migraciones, start y `/health/` terminan correctamente.

El Blueprint exige SSL hacia PostgreSQL y fija Python mediante
`backend/.python-version`. Render genera `DJANGO_SECRET_KEY`; no reemplazarla
por un valor manual corto o predecible.

No configurar Gmail, Drive, Cloudflare o producción para este smoke público.
No guardar valores reales en archivos versionados.

## Datos mínimos

Staging debe contener temporalmente un parqueadero con cuenta activa,
habilitación aprobada, configuración completa, ubicación dentro de Loja,
tarifa `NORMAL`, horario y al menos un espacio. Debe crearse mediante servicios
existentes o preparación controlada de staging, nunca como mock permanente.

## Verificación API

Desde una terminal local, mantener la URL solo en memoria:

```powershell
$Api = "https://<host-staging>"
Invoke-RestMethod "$Api/health/"
$List = Invoke-RestMethod "$Api/api/v1/public/parkings/?bbox=-79.277,-4.080,-79.130,-3.895"
$List.results
Invoke-RestMethod "$Api/api/v1/public/parkings/$($List.results[0].id)/"
```

Los tres recursos deben responder 200 y el detalle no debe exponer propietario,
cuenta, documento ni espacios internos.

## Android y polling

1. Activar Node 22 LTS y ejecutar `npm.cmd ci`, typecheck, tests y check Expo.
2. Definir `EXPO_PUBLIC_API_BASE_URL` en `frontend-movil/.env.local`.
3. Abrir Android físico o emulador y ejecutar `npm.cmd run android`.
4. Validar mapa -> lista -> detalle con el mismo parqueadero.
5. Registrar requests en aproximadamente T+0, T+5 y T+10.
6. Pasar la app a background 10-15 s y confirmar que no consulta.
7. Volver a foreground y confirmar que el polling se reanuda.

Adjuntar fecha, responsable, dispositivo, comandos, respuestas, capturas y
timestamps en `specs/008-integracion-movil/evidence.md`. Solo entonces marcar
el smoke y cerrar fase 008.

## Riesgos diferidos

El staging mínimo aún no activa HSTS. La política HSTS debe definirse durante
hardening/despliegue final y no se habilita apresuradamente en esta excepción.
