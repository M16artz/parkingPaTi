import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

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

test('dashboard consulta y presenta las metricas informativas de hoy', async () => {
  const [service, dashboard, summary] = await Promise.all([
    readFile(new URL('../src/services/ownerConfigurationService.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/views/owner/OwnerDashboardView.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/views/components/owner/OwnerDashboardSummary.jsx', import.meta.url), 'utf8'),
  ]);
  assert.match(service, /\/owner\/stays\/metrics\/today\//);
  assert.match(dashboard, /dashboard-metrics/);
  assert.match(summary, /ingresosFinalizados/);
  assert.match(summary, /ingresosEnCurso/);
});
