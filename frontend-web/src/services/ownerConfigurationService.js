import { apiClient } from './apiClient';

export const ownerConfigurationService = {
  async obtener() {
    const { data } = await apiClient.get('/owner/configuration/');
    return data;
  },
  async guardar(payload) {
    const { data } = await apiClient.put('/owner/configuration/', payload);
    return data;
  },
  async agregarEspacios(cantidad) {
    const { data } = await apiClient.post('/owner/spaces/bulk/', { cantidad });
    return data;
  },
  async editarEspacio(espacioId, payload) {
    const { data } = await apiClient.patch(`/owner/spaces/${espacioId}/`, payload);
    return data;
  },
  async eliminarEspacio(espacioId) {
    await apiClient.delete(`/owner/spaces/${espacioId}/`);
  },
  async reactivarEspacio(espacioId) {
    const { data } = await apiClient.post(`/owner/spaces/${espacioId}/reactivate/`);
    return data;
  },
  async iniciarEstancia(espacioId, tarifaId) {
    const { data } = await apiClient.post(`/owner/spaces/${espacioId}/stays/start/`, {
      tarifa_id: tarifaId,
    });
    return data;
  },
  async obtenerEstanciaActual(espacioId) {
    const { data } = await apiClient.get(`/owner/spaces/${espacioId}/stays/current/`);
    return data;
  },
  async finalizarEstancia(espacioId) {
    const { data } = await apiClient.post(`/owner/spaces/${espacioId}/stays/finish/`);
    return data;
  },
};
