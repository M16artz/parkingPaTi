import { LOJA_BBOX } from '../config/loja.js';

export const PUBLIC_POLLING_MS = 5000;
export const PUBLIC_BBOX_DEBOUNCE_MS = 400;

export function normalizarBbox(bbox) {
  const [minLng, minLat, maxLng, maxLat] = bbox;
  return [
    Math.max(LOJA_BBOX[0], minLng),
    Math.max(LOJA_BBOX[1], minLat),
    Math.min(LOJA_BBOX[2], maxLng),
    Math.min(LOJA_BBOX[3], maxLat),
  ].map((value) => Number(value.toFixed(6)));
}

export function bboxDesdeLimites(bounds) {
  return normalizarBbox([
    bounds.getWest(),
    bounds.getSouth(),
    bounds.getEast(),
    bounds.getNorth(),
  ]);
}

export function serializarBbox(bbox) {
  return bbox.map((value) => Number(value).toFixed(6)).join(',');
}

export function opcionesPollingPublico(visible) {
  return {
    refetchInterval: visible ? PUBLIC_POLLING_MS : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 3000,
    retry: 2,
  };
}
