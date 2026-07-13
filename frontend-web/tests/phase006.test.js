import test from 'node:test';
import assert from 'node:assert/strict';

import { formatearCostoInformativo, tarifaInicialEstancia } from '../src/utils/stay.js';

test('la estancia propone NORMAL aunque otra tarifa aparezca primero', () => {
  const tarifas = [
    { id: 8, codigo: 'DESCUENTO', activa: true },
    { id: 4, codigo: 'NORMAL', activa: true },
  ];
  assert.equal(tarifaInicialEstancia(tarifas), 4);
});

test('la tarifa inicial ignora opciones inactivas', () => {
  assert.equal(tarifaInicialEstancia([{ id: 4, codigo: 'NORMAL', activa: false }]), '');
});

test('el costo informativo mantiene dos decimales', () => {
  assert.equal(formatearCostoInformativo('2.5'), '$2.50');
});
