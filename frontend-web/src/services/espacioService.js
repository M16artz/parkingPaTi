// src/services/espacioService.js
//
// apps/parqueaderos.Espacio SOLO tiene numero_espacio + estado
// (LIBRE | OCUPADO | INHABILITADO) - no tiene ningún campo de tarifa.
// EspacioCambiarEstadoDTO únicamente acepta `estado`; enviar cualquier
// otra clave (como la "tarifa" por espacio que maneja OwnerConfigEspacios.jsx
// hoy) simplemente se ignora en el backend. Ver el informe, "Gap de
// negocio: tarifas por espacio".

import { apiClient } from './apiClient';

export const espacioService = {
  /** GET /api/espacios/?parqueadero=<id> (requiere auth) */
  async listarPorParqueadero(parqueaderoId) {
    const { data } = await apiClient.get('/espacios/', {
      params: { parqueadero: parqueaderoId },
    });
    return data.results ?? data;
  },

  /** POST /api/espacios/ - { parqueadero, numero_espacio } (nace en estado LIBRE) */
  async crear(parqueaderoId, numeroEspacio) {
    const { data } = await apiClient.post('/espacios/', {
      parqueadero: parqueaderoId,
      numero_espacio: numeroEspacio,
    });
    return data;
  },

  /** PATCH /api/espacios/{id}/ - { estado } */
  async cambiarEstado(espacioId, estado) {
    const { data } = await apiClient.patch(`/espacios/${espacioId}/`, { estado });
    return data;
  },

  async eliminar(espacioId) {
    await apiClient.delete(`/espacios/${espacioId}/`);
  },
};
