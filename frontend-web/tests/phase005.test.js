import test from 'node:test';
import assert from 'node:assert/strict';

import {
  crearFormularioConfiguracion,
  crearPayloadConfiguracion,
  validarConfiguracion,
} from '../src/utils/ownerConfiguration.js';
import { destinoSesion } from '../src/utils/adminAccess.js';

test('propietario aprobado entra a configuracion final obligatoria', () => {
  assert.equal(
    destinoSesion({ rol: 'PROPIETARIO', onboarding_estado: 'CONFIGURACION_PENDIENTE' }),
    '/owner/configuration',
  );
});

test('payload compuesto omite dias y tarifas opcionales inactivos', () => {
  const form = crearFormularioConfiguracion(null);
  form.cantidad_espacios = 4;
  form.horarios.LUNES.activo = true;
  form.tarifas.NORMAL.precio_hora = '1.25';
  const payload = crearPayloadConfiguracion(form);
  assert.equal(payload.cantidad_espacios, 4);
  assert.deepEqual(payload.horarios.map((item) => item.dia), ['LUNES']);
  assert.deepEqual(payload.tarifas.map((item) => item.codigo), ['NORMAL']);
  assert.equal(validarConfiguracion(form), '');
});

test('configuracion exige horario y tarifa normal validos', () => {
  const form = crearFormularioConfiguracion(null);
  assert.equal(validarConfiguracion(form), 'Configura al menos un día de atención.');
  form.horarios.LUNES.activo = true;
  assert.equal(
    validarConfiguracion(form),
    'La tarifa NORMAL es obligatoria y no puede ser negativa.',
  );
});
