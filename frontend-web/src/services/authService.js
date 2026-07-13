import { apiClient, tokenStorage } from './apiClient';

const TIPOS = { CEDULA: 'CI', CI: 'CI', RUC: 'RUC', PASAPORTE: 'PASAPORTE' };

export const authService = {
  async register(formData) {
    const { data } = await apiClient.post('/auth/register/', {
      nombre: formData.nombres,
      apellido: formData.apellidos,
      tipo_identificacion: TIPOS[formData.tipoIdentificacion],
      identificacion: formData.identificacion,
      correo: formData.correo,
      password: formData.password,
    });
    return data;
  },

  async verifyEmail(token) {
    const { data } = await apiClient.post('/auth/verify-email/', { token });
    return data;
  },

  async resendVerification(correo) {
    const { data } = await apiClient.post('/auth/resend-verification/', { correo });
    return data;
  },

  async login({ correo, password }) {
    const { data } = await apiClient.post('/auth/token/', { username: correo, password });
    tokenStorage.setAccess(data.access);
    return data;
  },

  async me() {
    const { data } = await apiClient.get('/auth/me/');
    return data;
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout/');
    } finally {
      tokenStorage.clear();
    }
  },
};
