# Decisiones pendientes

No asumir respuestas. Cada decisión requiere aprobación funcional y debe registrar fecha, responsable y elección.

| ID | Decisión | Opciones/contexto | Bloquea |
|---|---|---|---|
| DP-01 | Bounding box exacto de Loja | **Resuelta 2026-07-13:** bbox base `minLng=-79.2770`, `minLat=-4.0800`, `maxLng=-79.1300`, `maxLat=-3.8950`; tolerancia adicional de `0.01` grados para validación | API pública/mapas |
| DP-02 | Catálogo de tipos de espacio | **Resuelta 2026-07-12:** `Espacio` no tendrá atributo ni catálogo de tipo físico; solo estado operativo | Modelo/espacios |
| DP-03 | Tarifas adicionales | **Resuelta 2026-07-12:** `NORMAL` obligatoria y predeterminada; `DESCUENTO` e `INCREMENTO` opcionales, todas con precio por hora independiente y sin porcentajes | Modelo/UI tarifas |
| DP-04 | Retención de estancias | **Resuelta 2026-07-13:** conservar 12 meses; acceso limitado al propietario de su parqueadero y a administradores; eliminación física al vencer. Responsable: Miguel Armas | Privacidad/tamaño DB |
| DP-05 | Edición tras rechazo | **Resuelta 2026-07-13:** el propietario puede editar y reenviar todo el onboarding después del rechazo. Responsable: Miguel Armas | Onboarding |
| DP-06 | Rehabilitación de cuentas | **Reabierta y resuelta 2026-07-18:** incluir rehabilitación administrativa confirmada; restaura acceso y reconstruye el estado de onboarding desde correo, parqueadero, documento y configuración. Responsable: solicitante del proyecto mediante aprobación explícita | Admin/API |
| DP-07 | Proveedor de correo | **Resuelta 2026-07-13:** SMTP Gmail/Google Workspace con App Password, configurado exclusivamente mediante variables de entorno; validación real diferida a fase 010 | Verificación |
| DP-08 | Drive y permisos | **Resuelta 2026-07-13:** cuenta de servicio Google, carpeta exclusiva y documentos privados accesibles solo por administradores autorizados; no existen documentos previos por migrar y la validación real queda en fase 010 | Documentos |
| DP-09 | Refresh JWT web | **Resuelta 2026-07-13:** refresh JWT en cookie `HttpOnly`, `Secure` y `SameSite`; atributos por entorno y validación HTTPS real diferida a fase 010 | Auth/deploy |
| DP-10 | Datos reales existentes | **Resuelta 2026-07-12:** Miguel Armas confirmó PostgreSQL y Drive sin datos; no aplica backup ni migración de datos existentes | Migraciones |
| DP-11 | Propietario en móvil | **Resuelta 2026-07-13:** el móvil se limita al conductor anónimo; no incluye autenticación, panel ni operaciones de propietario | Móvil |
| DP-12 | Proveedor de tiles productivo | OSM best-effort o proveedor con SLA | Despliegue/mapas |
| DP-13 | Normalización de dirección | **Resuelta 2026-07-12:** dirección y ubicación se modelan en tablas separadas de `Parqueadero` | Modelo/API |
| DP-14 | Tipo de espacio vs tarifa | **Resuelta 2026-07-12:** tipo de espacio y tipo de tarifa son catálogos independientes | Modelo/UX |
| DP-15 | Versiones objetivo de toolchain | **Resuelta 2026-07-12:** Python 3.13, Node 22 LTS con su npm incluido y Expo SDK 54/React Native 0.81 | Fases 001 y 008 |
| DP-16 | Fuente única de tarifas | **Resuelta 2026-07-12:** usar `TipoCategoriaTarifa` y `CategoriaTarifa`, con `NORMAL` como tipo obligatorio y predeterminado; retirar representaciones heredadas en fase 002 | Modelo/tarifas |
| DP-17 | Estados operativos de espacio | **Resuelta 2026-07-12:** `LIBRE`, `OCUPADO` e `INHABILITADO` | Modelo/espacios |

## Registro de resolución

Al resolver una decisión:

1. Actualizar esta tabla con `Resuelta` y un enlace a ADR/spec.
2. Actualizar contratos/modelo afectados.
3. No reescribir `cambios.md`; es fuente histórica.
