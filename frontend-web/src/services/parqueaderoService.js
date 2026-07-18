// src/services/parqueaderoService.js
//
// El formulario de registro también captura nombreParqueadero,
// callePrincipal, calleSecundaria, numeroLote y ubicacion, pero
// POST /api/auth/register/ (RegistroDTO) NO acepta esos campos - solo crea
// Persona + Cuenta. El parqueadero se crea aparte, ya autenticado, contra
// /api/parqueaderos/ (ParqueaderoCrearDTO), que exige:
//   nombre, calle_principal, calle_secundaria?, numero_lote?, latitud, longitud
//
// NOTA sobre "ubicacion": el formulario actual maneja `ubicacion` como un
// solo campo de texto (ver src/views/auth/RegisterView.jsx / useRegisterController.js).
// El backend necesita latitud y longitud numéricas por separado
// (apps/parqueaderos/models.py -> Ubicacion). Este es un gap de UI real:
// falta un selector de mapa (o geocodificar la dirección) antes de poder
// enviar este request. Ver el informe para más detalle.

import { apiClient } from './apiClient';

export const parqueaderoService = {
  /**
   * POST /api/parqueaderos/
   * @param {{nombre: string, callePrincipal: string, calleSecundaria?: string,
   *          numeroLote?: string, latitud: number, longitud: number}} datos
   */
  async crear(datos) {
    const payload = {
      nombre: datos.nombre,
      calle_principal: datos.callePrincipal,
      calle_secundaria: datos.calleSecundaria ?? '',
      numero_lote: datos.numeroLote ?? '',
      latitud: datos.latitud,
      longitud: datos.longitud,
    };
    const { data } = await apiClient.post('/parqueaderos/', payload);
    return data; // ParqueaderoDetalleDTO
  },

  async listarDisponibles() {
    const { data } = await apiClient.get('/parqueaderos/');
    return data;
  },

  /**
   * GET /api/parqueaderos/mios/ (requiere el patch de backend adjunto:
   * apps/parqueaderos/controllers_patch.py + services_patch.py).
   * Devuelve el/los parqueadero(s) del propietario autenticado.
   */
  async obtenerMios() {
    const { data } = await apiClient.get('/parqueaderos/mios/');
    return data;
  },

  /** PATCH /api/parqueaderos/{id}/ - nombre y descripcion; ubicacion es solo lectura */
  async actualizar(id, datos) {
    const { data } = await apiClient.patch(`/parqueaderos/${id}/`, datos);
    return data;
  },
};
