---
name: backend-django-layered
description: Implementar o revisar cambios Django/DRF de ParkingPaTi respetando controller, DTO, service, repository y model. Usar en cualquier tarea backend, modelo, migración, endpoint, permiso o integración de dominio del proyecto.
---

# Backend Django por capas

## Cuándo usarlo

Usar para tareas backend de las fases 001-010. Leer la spec activa y `docs/architecture/01-backend-por-capas.md` antes de editar.

## Flujo

1. Identificar caso de uso y contrato.
2. Confirmar decisiones pendientes relacionadas.
3. Diseñar cambios verticales por capa.
4. Implementar desde model/repository hacia service/DTO/controller cuando corresponda.
5. Añadir migraciones y pruebas.
6. Actualizar OpenAPI/documentación.

## Reglas obligatorias

- Respetar `controller/view -> DTO/serializer -> service -> repository -> model/PostgreSQL`.
- Mantener ORM en repositories.
- Mantener negocio, autorización y transacciones en services.
- Usar DTOs distintos para entrada/salida cuando convenga.
- Aislar Drive/correo en adapters.
- Aplicar propiedad/admin también en service.
- Usar `backend/venv` y requirements del repo.
- Usar excepciones/códigos uniformes.

## Antipatrones prohibidos

- ORM en controller, serializer o cliente.
- Reglas críticas solo en frontend.
- `request.data` enviado sin whitelist al modelo.
- Mutaciones relacionadas sin transacción.
- Dos fuentes de verdad para tarifa/disponibilidad.
- Agregar WebSockets, Channels o Redis de disponibilidad.
- Acceso directo de clientes a Supabase.

## Checklist de salida

- [ ] Caso de uso pertenece a fase activa.
- [ ] Capas y dependencias apuntan en dirección correcta.
- [ ] Permisos/errores/atomicidad están cubiertos.
- [ ] Migraciones/checks pasan.
- [ ] Tests de service y API pasan.
- [ ] OpenAPI/docs están alineados.
