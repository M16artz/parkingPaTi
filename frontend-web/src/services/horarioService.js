// src/services/horarioService.js
//
// apps/horarios: cada día de la semana es un registro independiente
// (unique_together = parqueadero+dia), no un blob único por parqueadero.
// Por eso "guardar horarios" no es un solo POST: es crear los días
// nuevos, actualizar los que cambiaron y borrar los que se desactivaron.
// useOwnerConfigGController.js hace ese diffing antes de llamar aquí.

import { apiClient } from './apiClient';

export const horarioService = {
  /** GET /api/horarios/?parqueadero=<id> (público, no requiere auth) */
  async listarPorParqueadero(parqueaderoId) {
    const { data } = await apiClient.get('/horarios/', {
      params: { parqueadero: parqueaderoId },
    });
    return data;
  },

  /** POST /api/horarios/ - { parqueadero, dia, hora_apertura, hora_cierre } */
  async crear(parqueaderoId, dia, horaApertura, horaCierre) {
    const { data } = await apiClient.post('/horarios/', {
      parqueadero: parqueaderoId,
      dia,
      hora_apertura: horaApertura,
      hora_cierre: horaCierre,
    });
    return data;
  },

  /** PATCH /api/horarios/{id}/ - solo dia/hora_apertura/hora_cierre (whitelist del backend) */
  async actualizar(horarioId, horaApertura, horaCierre) {
    const { data } = await apiClient.patch(`/horarios/${horarioId}/`, {
      hora_apertura: horaApertura,
      hora_cierre: horaCierre,
    });
    return data;
  },

  async eliminar(horarioId) {
    await apiClient.delete(`/horarios/${horarioId}/`);
  },
};
