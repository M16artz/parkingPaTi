---
name: security-secrets-auth
description: Aplicar o revisar seguridad de ParkingPaTi para secretos, JWT, verificación de correo, documentos Drive, archivos, throttling, permisos y deshabilitación. Usar en fases con identidad, proveedores externos, administración o despliegue.
---

# Seguridad, secretos y autenticación

## Cuándo usarlo

Usar ante cualquier cambio que maneje credenciales, sesiones, documentos, correo, roles o datos personales.

## Reglas obligatorias

- Nunca escribir valores secretos en repo, logs, docs o respuestas.
- Usar `is_active` para bloqueo real.
- Tokens de correo: aleatorios, hash, expiración, un uso.
- Aplicar throttling a registro/login/verificación/reenvío.
- Mantener Drive privado y servir acceso solo autorizado.
- Validar extensión, MIME, firma, tamaño y nombre de archivo.
- Revocar/invalidar sesión al deshabilitar.
- Aplicar permisos backend y service; frontend solo mejora UX.
- Evitar enumeración de cuentas.

## Antipatrones prohibidos

- `.env` real o credenciales plausibles.
- `anyone/reader` en documentos.
- Confiar en extensión o validación cliente.
- Autorización solo en rutas React.
- Estado de negocio separado de `is_active` sin política.
- Tokens/contraseñas/file IDs en logs.
- Acceso directo a DB desde clientes.

## Checklist de salida

- [ ] Threats del cambio están identificados.
- [ ] Secretos/proveedores usan variables seguras.
- [ ] Permisos, throttling y revocación tienen tests.
- [ ] Archivos/documentos no son públicos.
- [ ] Errores no filtran existencia o datos internos.
- [ ] Scans/checks aplicables pasan.
