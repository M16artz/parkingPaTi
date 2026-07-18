import { apiClient, tokenStorage } from './apiClient';
import { crearCredencialesLogin } from '../utils/authLogin';

const TIPOS = { CEDULA: 'CI', CI: 'CI', RUC: 'RUC', PASAPORTE: 'PASAPORTE' };

export const authService = {
  async register(formData) {
    const { data } = await apiClient.post('/auth/register/', {
      nombre: formData.nombres.trim(),
      apellido: formData.apellidos.trim(),
      tipo_identificacion: TIPOS[formData.tipoIdentificacion],
      identificacion: formData.identificacion,
      correo: formData.correo.trim().toLowerCase(),
      password: formData.password,
    });
    return data;
  },

  async registerComplete(formData, archivo) {
    const payload = new FormData();
    const fields = {
      nombre: formData.nombres.trim(),
      apellido: formData.apellidos.trim(),
      tipo_identificacion: TIPOS[formData.tipoIdentificacion],
      identificacion: formData.identificacion,
      correo: formData.correo.trim().toLowerCase(),
      password: formData.password,
      nombre_parqueadero: formData.nombreParqueadero.trim(),
      descripcion: formData.descripcion.trim(),
      calle_principal: formData.callePrincipal.trim(),
      calle_secundaria: formData.calleSecundaria.trim(),
      numero_lote: formData.numeroLote.trim(),
      latitud: formData.latitud,
      longitud: formData.longitud,
    };
    Object.entries(fields).forEach(([key, value]) => payload.append(key, value ?? ''));
    payload.append('archivo', archivo);
    const { data } = await apiClient.post('/auth/register/complete/', payload);
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
    const { data } = await apiClient.post(
      '/auth/token/',
      crearCredencialesLogin({ correo, password }),
    );
    tokenStorage.setAccess(data.access);
    return data;
  },

  async me() {
    const { data } = await apiClient.get('/auth/me/');
    return data;
  },

  clearLocalSession() {
    tokenStorage.clear();
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout/');
    } finally {
      tokenStorage.clear();
    }
  },
};
