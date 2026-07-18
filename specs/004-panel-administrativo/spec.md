# Fase 004: Panel administrativo

## Objetivo

Permitir a administradores revisar solicitudes/cuentas y ejecutar decisiones confirmadas de forma segura.

## Incluye

- Listas paginadas y detalle.
- Datos personales, documento privado y marcador.
- Aprobar y rechazar con confirmación; motivo obligatorio al rechazar.
- Deshabilitar cuenta y ocultar parqueadero.
- Rehabilitar una cuenta deshabilitada y restaurar el paso de onboarding coherente.
- Correo de resultado sin revertir la decisión si falla.

## No incluye

- Configuración de espacios/tarifas.

## Criterios de aceptación

- Solo admin accede a endpoints/vistas.
- Acciones repetidas/concurrentes no duplican transición.
- Cuenta deshabilitada no inicia ni renueva sesión.
