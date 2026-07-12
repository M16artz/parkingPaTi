// src/config/env.ts
// Antes: archivo vacío. Nada inyectaba la URL del backend en las llamadas
// porque, de hecho, no existían llamadas (ver informe).
//
// Vite solo expone variables que empiecen con VITE_. Crea/edita tu .env
// (o .env.development / .env.production) con:
//
//   VITE_API_BASE_URL=http://localhost:8000/api
//
// En producción (deploy/environments/.env.production.example) debe apuntar
// al dominio real, ej: https://api.parkingpati.com/api

export const API_BASE_URL: string =
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';
