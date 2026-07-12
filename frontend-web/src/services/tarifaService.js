// src/services/tarifaService.js
//
// IMPORTANTE - esto NO es un catálogo de precios por categoría de
// vehículo. apps/tarifas modela una única "estrategia de tarifa" por
// parqueadero (OneToOne real, reforzado también en el service:
// "Este parqueadero ya tiene una tarifa o estrategia configurada"),
// que puede ser de un solo tipo a la vez:
//   - EstrategiaTarifa (normal):     /api/tarifas/      { precio_hora }
//   - IncrementoTarifa (recargo %):  /api/incrementos/  { precio_hora, porcentaje }
//   - DescuentoTarifa  (descuento %):/api/descuentos/   { precio_hora, porcentaje }
//
// El formulario actual (OwnerConfigGeneral.jsx) pide TRES precios fijos
// simultáneos ("general", "descuento" 3ra edad, "grandes" vehículos
// pesados) - eso no tiene dónde mapearse 1:1 en el modelo actual. Ver el
// informe, sección "Gap de negocio: tarifas", para las opciones de
// solución. Mientras tanto, este servicio solo cubre la tarifa NORMAL
// (precio_hora), que sí tiene un endpoint real y es la que
// useOwnerConfigGController.js sincroniza.

import { apiClient } from './apiClient';

export const tarifaService = {
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
