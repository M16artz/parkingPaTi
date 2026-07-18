import { apiClient } from './apiClient';

export const onboardingService = {
  async estado() {
    const { data } = await apiClient.get('/owner/onboarding-status/');
    return data;
  },

  async guardarParqueadero(datos) {
    const { data } = await apiClient.put('/owner/parking/initial-data/', datos);
    return data;
  },

  async subirDocumento(archivo) {
    const form = new FormData();
    form.append('archivo', archivo);
    const { data } = await apiClient.put('/owner/document/', form);
    return data;
  },

  async enviarSolicitud() {
    const { data } = await apiClient.post('/owner/application/submit/');
    return data;
  },
};
