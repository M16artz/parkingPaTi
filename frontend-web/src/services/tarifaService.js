// src/services/tarifaService.js
//
// Maneja las tarifas por categoria de vehiculo y conserva los metodos de
// tarifa normal existentes para compatibilidad con /api/tarifas/.

import { apiClient } from './apiClient';

const CODIGO_POR_CLAVE_UI = {
  general: 'GENERAL',
  descuento: 'PREFERENCIAL',
  grandes: 'PESADOS',
};

export const tarifaService = {
  async obtenerCategoriasPorParqueadero(parqueaderoId) {
    const { data } = await apiClient.get('/categorias-tarifa/', {
      params: { parqueadero: parqueaderoId },
    });
    const resultados = data.results ?? data;

    const porCodigo = {};
    resultados.forEach((cat) => {
      porCodigo[cat.codigo] = cat;
    });

    return Object.fromEntries(
      Object.entries(CODIGO_POR_CLAVE_UI).map(([claveUi, codigo]) => [
        claveUi,
        porCodigo[codigo] ? { id: porCodigo[codigo].id, precio_hora: porCodigo[codigo].precio_hora } : null,
      ])
    );
  },

  async guardarCategoria(parqueaderoId, claveUi, precioHora) {
    const codigo = CODIGO_POR_CLAVE_UI[claveUi];
    const { data } = await apiClient.post('/categorias-tarifa/', {
      parqueadero: parqueaderoId,
      codigo,
      precio_hora: precioHora,
    });
    return data;
  },

  /** GET /api/tarifas/?parqueadero=<id> -> respuesta paginada (paginación manual del backend) */
  async obtenerNormalPorParqueadero(parqueaderoId) {
    const { data } = await apiClient.get('/tarifas/', {
      params: { parqueadero: parqueaderoId },
    });
    const resultados = data.results ?? data;
    return resultados[0] ?? null;
  },

  async crearNormal(parqueaderoId, precioHora) {
    const { data } = await apiClient.post('/tarifas/', {
      parqueadero: parqueaderoId,
      precio_hora: precioHora,
    });
    return data;
  },

  async actualizarNormal(tarifaId, precioHora) {
    const { data } = await apiClient.patch(`/tarifas/${tarifaId}/`, {
      precio_hora: precioHora,
    });
    return data;
  },
};
