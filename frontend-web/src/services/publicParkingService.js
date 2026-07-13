import { apiClient } from './apiClient';
import { serializarBbox } from '../utils/publicParkings';

export const publicParkingService = {
  async listar(bbox, signal) {
    const { data } = await apiClient.get('/public/parkings/', {
      params: { bbox: serializarBbox(bbox) },
      signal,
    });
    return data;
  },
  async obtener(parqueaderoId, signal) {
    const { data } = await apiClient.get(`/public/parkings/${parqueaderoId}/`, { signal });
    return data;
  },
};
