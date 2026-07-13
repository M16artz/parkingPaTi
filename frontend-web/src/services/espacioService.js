// src/services/espacioService.js
//
// Espacio permite guardar estado y categoria_tarifa.

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

  /** PATCH /api/espacios/{id}/ - { estado?, categoria_tarifa? } */
  async actualizar(espacioId, { estado, categoriaTarifaId } = {}) {
    const payload = {};
    if (estado !== undefined) payload.estado = estado;
    if (categoriaTarifaId !== undefined) payload.categoria_tarifa = categoriaTarifaId;

    const { data } = await apiClient.patch(`/espacios/${espacioId}/`, payload);
    return data;
  },

  async eliminar(espacioId) {
    await apiClient.delete(`/espacios/${espacioId}/`);
  },
};
