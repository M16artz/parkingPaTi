# Aceptación final

## Flujo vertical

```text
registro -> verificar correo -> ubicación/datos -> Drive privado -> enviar
-> revisión admin -> aprobar -> configuración final -> espacios
-> estancia informativa -> consulta pública web/móvil -> polling
-> deshabilitar cuenta y ocultar parqueadero
```

## Escenarios obligatorios

1. Anónimo ve solo parqueaderos aprobados/activos de Loja.
2. Onboarding se reanuda tras fallo/cierre.
3. Admin ve documento y marcador antes de decidir.
4. Aprobar/rechazar/deshabilitar requieren confirmación; rechazo requiere motivo.
5. Cuenta deshabilitada no inicia ni renueva sesión.
6. Configuración final es obligatoria al primer ingreso aprobado.
7. Operaciones de espacios mantienen conteos correctos y borrado lógico.
8. Polling refleja cambios en 5-10 segundos con vista activa.
9. Estancia de 61 minutos usa 2 horas y precio snapshot.
10. Clientes no consultan DB/OSM API para parqueaderos.

## Plataforma

- Clon limpio instala backend en `backend/venv`, migra y pasa checks.
- Web despliega en Cloudflare Pages.
- API despliega en Render y usa Supabase PostgreSQL.
- Móvil compila y consume HTTPS sin IP local.
- No quedan WebSockets/Channels/Redis de disponibilidad.
- Documentos son privados y secretos están fuera de Git.
