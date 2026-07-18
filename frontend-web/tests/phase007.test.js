import test from 'node:test';
import assert from 'node:assert/strict';

import { LOJA_BBOX } from '../src/config/loja.js';
import {
  PUBLIC_BBOX_DEBOUNCE_MS,
  PUBLIC_POLLING_MS,
  calcularDistanciaKm,
  filtrarParqueaderos,
  obtenerHorarioHoy,
  resumirEspaciosPublicos,
  normalizarBbox,
  opcionesPollingPublico,
  serializarBbox,
} from '../src/utils/publicParkings.js';

test('polling público usa 5000 ms y se pausa en background', () => {
  assert.equal(PUBLIC_POLLING_MS, 5000);
  assert.equal(opcionesPollingPublico(true).refetchInterval, 5000);
  assert.equal(opcionesPollingPublico(false).refetchInterval, false);
  assert.equal(opcionesPollingPublico(true).refetchIntervalInBackground, false);
});

test('movimiento del mapa usa debounce dentro del rango aprobado', () => {
  assert.ok(PUBLIC_BBOX_DEBOUNCE_MS >= 300 && PUBLIC_BBOX_DEBOUNCE_MS <= 500);
  assert.deepEqual(normalizarBbox([-80, -5, -78, -3]), LOJA_BBOX);
});

test('bbox se serializa en el orden contractual', () => {
  assert.equal(serializarBbox(LOJA_BBOX), '-79.277000,-4.080000,-79.130000,-3.895000');
});

const PARKINGS = [
  { id: 1, name: 'Central Loja', address: 'Bolívar y Rocafuerte', latitude: -3.995, longitude: -79.202, status: 'OPEN', available_spaces: 4, total_spaces: 10, normal_rate: '1.50' },
  { id: 2, name: 'Terminal', address: 'Avenida Isidro Ayora', latitude: -3.98, longitude: -79.205, status: 'FULL', available_spaces: 0, total_spaces: 8, normal_rate: '1.00' },
];

test('búsqueda y filtros públicos usan nombre, dirección, estado, disponibilidad y tarifa', () => {
  assert.deepEqual(filtrarParqueaderos(PARKINGS, { search: 'bolivar' }).map(({ id }) => id), [1]);
  assert.deepEqual(filtrarParqueaderos(PARKINGS, { search: 'isidro' }).map(({ id }) => id), [2]);
  assert.deepEqual(filtrarParqueaderos(PARKINGS, { filter: 'OPEN' }).map(({ id }) => id), [1]);
  assert.deepEqual(filtrarParqueaderos(PARKINGS, { filter: 'AVAILABLE' }).map(({ id }) => id), [1]);
  assert.deepEqual(filtrarParqueaderos(PARKINGS, { filter: 'PRICE' }).map(({ id }) => id), [2, 1]);
});

test('distancia se calcula con Haversine y permite ordenar por cercanía', () => {
  const location = { latitude: -3.994, longitude: -79.201 };
  assert.ok(calcularDistanciaKm(location, PARKINGS[0]) < calcularDistanciaKm(location, PARKINGS[1]));
  assert.deepEqual(filtrarParqueaderos(PARKINGS, { filter: 'DISTANCE', userLocation: location }).map(({ id }) => id), [1, 2]);
});

test('horario público se calcula en America/Guayaquil sin inventar atención', () => {
  const schedules = [{ day: 'LUNES', opens_at: '08:00:00', closes_at: '20:00:00' }];
  const open = obtenerHorarioHoy(schedules, 'OPEN', new Date('2026-07-20T15:00:00Z'));
  assert.match(open.title, /Abierto ahora/);
  const noSchedule = obtenerHorarioHoy([], 'OPEN', new Date('2026-07-20T15:00:00Z'));
  assert.equal(noSchedule.title, 'Hoy no hay atención');
});

test('resumen de espacios usa distribución real cuando está disponible', () => {
  assert.deepEqual(resumirEspaciosPublicos({ spaces: [
    { status: 'FREE' }, { status: 'OCCUPIED' }, { status: 'DISABLED' },
  ] }), { detailed: true, total: 3, free: 1, occupied: 1, disabled: 1 });
});
