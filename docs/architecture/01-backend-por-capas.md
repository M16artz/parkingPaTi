# Backend modular por capas

## Flujo obligatorio

```text
controller/view -> DTO/serializer -> service -> repository -> model/PostgreSQL
```

## Controller/view

- Seleccionar permisos y DTO.
- Extraer transporte y llamar un caso de uso.
- Transformar resultado en respuesta HTTP.
- No importar modelos/repositorios para consultar ORM.

## DTO/serializer

- Validar campos, tipos, enums y restricciones locales.
- Separar entrada/salida cuando los contratos difieran.
- No coordinar Drive, correo ni transacciones.

## Service

- Aplicar reglas de negocio y transiciones de estado.
- Autorizar propiedad/admin como defensa en profundidad.
- Delimitar transacciones y coordinar repositorios/adapters.
- Lanzar excepciones de dominio traducibles a HTTP.

## Repository

- Encapsular ORM, filtros, locks e índices.
- Usar `select_related/prefetch_related` según contrato.
- No decidir roles, onboarding o mensajes de UI.

## Model

- Declarar relaciones, constraints, enums e índices.
- Evitar dos fuentes de verdad.
- Mantener invariantes simples; la orquestación vive en services.

## Adapters

Drive y correo se aíslan detrás de interfaces. Los services no importan SDKs externos directamente.

## Revisión

- Prueba unitaria por regla crítica de service.
- Prueba API por permiso/contrato.
- Migración por cambio de modelo.
- Ningún acceso de cliente a DB.
