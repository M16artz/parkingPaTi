import { apiClient } from './apiClient';

const limpiarParametros = (params) => Object.fromEntries(
  Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null),
);

export const adminService = {
  async listarSolicitudes(params) {
    const { data } = await apiClient.get('/admin/applications/', { params: limpiarParametros(params) });
    return data;
  },

  async obtenerSolicitud(cuentaId) {
    const { data } = await apiClient.get(`/admin/applications/${cuentaId}/`);
    return data;
  },

  async abrirDocumento(cuentaId) {
    const { data } = await apiClient.get(`/admin/applications/${cuentaId}/document/`);
    return data;
  },

  async aprobar(cuentaId) {
    const { data } = await apiClient.post(`/admin/applications/${cuentaId}/approve/`);
    return data;
  },

  async rechazar(cuentaId, motivo) {
    const { data } = await apiClient.post(`/admin/applications/${cuentaId}/reject/`, { motivo });
    return data;
  },

  async listarCuentas(params) {
    const { data } = await apiClient.get('/admin/accounts/', { params: limpiarParametros(params) });
    return data;
  },

  async deshabilitar(cuentaId) {
    const { data } = await apiClient.post(`/admin/accounts/${cuentaId}/disable/`);
    return data;
  },

  async rehabilitar(cuentaId) {
    const { data } = await apiClient.post(`/admin/accounts/${cuentaId}/enable/`);
    return data;
  },
};
