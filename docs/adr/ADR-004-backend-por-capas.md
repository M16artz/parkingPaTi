# ADR-004: Backend modular por capas

- Estado: Aceptada
- Fecha: 2026-07-12

## Contexto

El backend ya expresa controllers, DTOs, services y repositories, pero existen cruces que causaron contratos rotos y lógica en capas incorrectas.

## Decisión

Aplicar estrictamente:

```text
controller/view -> DTO/serializer -> service -> repository -> model/PostgreSQL
```

Adapters aíslan Drive/correo. Autorización/reglas/transacciones viven en services; ORM en repositories.

## Consecuencias

- Más archivos y disciplina, con límites testeables.
- Los cambios verticales deben recorrer y probar todas las capas pertinentes.
- No se permiten atajos ORM en controllers.

## Alternativas descartadas

- `ModelViewSet` con negocio implícito: límites insuficientes para estos flujos.
- Services que acceden directamente a SDK/ORM en cualquier forma: dificulta pruebas y compensación.
- Acceso DB desde frontend: rompe seguridad y dominio central.
