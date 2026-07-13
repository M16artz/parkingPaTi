import test from 'node:test';
import assert from 'node:assert/strict';

import { LOJA_BBOX } from '../src/config/loja.js';
import {
  PUBLIC_BBOX_DEBOUNCE_MS,
  PUBLIC_POLLING_MS,
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
