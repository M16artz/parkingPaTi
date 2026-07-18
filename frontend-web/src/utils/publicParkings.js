import { LOJA_BBOX } from '../config/loja.js';

export const PUBLIC_POLLING_MS = 5000;
export const PUBLIC_BBOX_DEBOUNCE_MS = 400;

export const PARKING_STATUS = {
  OPEN: { label: 'Abierto', marker: '#00bf63' },
  FULL: { label: 'Lleno', marker: '#ff7c00' },
  CLOSED: { label: 'Cerrado', marker: '#64748b' },
  OUT_OF_SERVICE: { label: 'Fuera de servicio', marker: '#991b1b' },
};

export const SPACE_STATUS = {
  FREE: { label: 'Libre', color: '#00bf63' },
  OCCUPIED: { label: 'Ocupado', color: '#0a878b' },
  DISABLED: { label: 'Inhabilitado', color: '#ff7c00' },
};

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

const normalizarTexto = (value = '') => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

export function calcularDistanciaKm(origen, parqueadero) {
  if (!origen || !Number.isFinite(Number(parqueadero?.latitude)) || !Number.isFinite(Number(parqueadero?.longitude))) return null;
  const rad = (value) => value * (Math.PI / 180);
  const lat1 = rad(Number(origen.latitude));
  const lat2 = rad(Number(parqueadero.latitude));
  const deltaLat = lat2 - lat1;
  const deltaLng = rad(Number(parqueadero.longitude) - Number(origen.longitude));
  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatearDistancia(kilometros) {
  if (!Number.isFinite(kilometros)) return 'Distancia no disponible';
  if (kilometros < 1) return `${Math.max(1, Math.round(kilometros * 1000))} m`;
  return `${kilometros.toFixed(kilometros < 10 ? 1 : 0)} km`;
}

export function formatearMoneda(value) {
  if (value === null || value === undefined || value === '') return 'No configurada';
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'No configurada';
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function filtrarParqueaderos(parqueaderos, { search = '', filter = 'ALL', userLocation = null } = {}) {
  const term = normalizarTexto(search);
  const results = parqueaderos
    .filter((parking) => !term || normalizarTexto(`${parking.name} ${parking.address}`).includes(term))
    .filter((parking) => filter !== 'OPEN' || parking.status === 'OPEN')
    .filter((parking) => filter !== 'AVAILABLE' || (parking.status === 'OPEN' && parking.available_spaces > 0))
    .map((parking) => ({
      ...parking,
      distance_km: calcularDistanciaKm(userLocation, parking),
    }));

  if (filter === 'PRICE') {
    return results.sort((a, b) => {
      const first = a.normal_rate == null ? Number.POSITIVE_INFINITY : Number(a.normal_rate);
      const second = b.normal_rate == null ? Number.POSITIVE_INFINITY : Number(b.normal_rate);
      return first - second || a.name.localeCompare(b.name, 'es');
    });
  }
  if (filter === 'DISTANCE' && userLocation) {
    return results.sort((a, b) => a.distance_km - b.distance_km);
  }
  return results;
}

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

const partesFechaGuayaquil = (date) => {
  const parts = new Intl.DateTimeFormat('es-EC', {
    timeZone: 'America/Guayaquil',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const day = normalizarTexto(values.weekday).toUpperCase();
  return {
    day,
    minutes: Number(values.hour) * 60 + Number(values.minute),
  };
};

const minutosHorario = (value) => {
  const [hours, minutes] = String(value ?? '').slice(0, 5).split(':').map(Number);
  return hours * 60 + minutes;
};

export function obtenerHorarioHoy(schedules = [], status, date = new Date()) {
  if (status === 'OUT_OF_SERVICE') {
    return { title: 'Fuera de servicio', detail: 'Este parqueadero no está atendiendo actualmente.', schedule: null };
  }
  const current = partesFechaGuayaquil(date);
  const schedule = schedules.find((item) => item.day === current.day);
  if (!schedule) return { title: 'Hoy no hay atención', detail: 'No existe un horario configurado para hoy.', schedule: null };
  const opens = minutosHorario(schedule.opens_at);
  const closes = minutosHorario(schedule.closes_at);
  const range = `${String(schedule.opens_at).slice(0, 5)} – ${String(schedule.closes_at).slice(0, 5)}`;
  if (status === 'CLOSED') return { title: 'Cerrado temporalmente', detail: `Horario de hoy: ${range}`, schedule };
  if (current.minutes >= opens && current.minutes < closes) {
    return { title: `Abierto ahora · Cierra a las ${String(schedule.closes_at).slice(0, 5)}`, detail: range, schedule };
  }
  if (current.minutes < opens) return { title: `Cerrado · Abre hoy a las ${String(schedule.opens_at).slice(0, 5)}`, detail: range, schedule };
  return { title: 'Cerrado por horario', detail: `La atención de hoy terminó a las ${String(schedule.closes_at).slice(0, 5)}`, schedule };
}

export function ordenarHorarios(schedules = []) {
  return [...schedules].sort((a, b) => DIAS.indexOf(a.day) - DIAS.indexOf(b.day));
}

export function resumirEspaciosPublicos(parking) {
  const spaces = parking?.spaces ?? [];
  if (!spaces.length) {
    return {
      detailed: false,
      total: Number(parking?.total_spaces ?? 0),
      free: Number(parking?.available_spaces ?? 0),
      occupied: null,
      disabled: null,
    };
  }
  return spaces.reduce((summary, space) => {
    summary.total += 1;
    if (space.status === 'FREE') summary.free += 1;
    if (space.status === 'OCCUPIED') summary.occupied += 1;
    if (space.status === 'DISABLED') summary.disabled += 1;
    return summary;
  }, { detailed: true, total: 0, free: 0, occupied: 0, disabled: 0 });
}
