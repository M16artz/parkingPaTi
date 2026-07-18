import test from 'node:test';
import assert from 'node:assert/strict';

import { LOJA_BOUNDS, estaEnLoja } from '../src/config/loja.js';
import {
  validateParkingRegistration,
  validateRegister,
  validateRegistrationDocument,
} from '../src/utils/validators/authValidator.js';

test('registro exige confirmaciones coincidentes', () => {
  const result = validateRegister({
    nombres: 'Ana', apellidos: 'Paredes', tipoIdentificacion: 'CEDULA',
    identificacion: '1100000000', correo: 'ana@example.invalid',
    confirmarCorreo: 'otra@example.invalid', password: 'segura-123',
    confirmarPassword: 'distinta-123',
  });
  assert.equal(result.isValid, false);
  assert.ok(result.errors.confirmarCorreo);
  assert.ok(result.errors.confirmarPassword);
});

test('confirmaciones no forman parte de una validacion fallida cuando coinciden', () => {
  const result = validateRegister({
    nombres: 'Ana', apellidos: 'Paredes', tipoIdentificacion: 'CEDULA',
    identificacion: '1100000000', correo: 'ana@example.invalid',
    confirmarCorreo: 'ana@example.invalid', password: 'segura-123',
    confirmarPassword: 'segura-123',
  });
  assert.equal(result.isValid, true);
});

test('selector usa el bbox aprobado de Loja', () => {
  assert.deepEqual(LOJA_BOUNDS, [[-4.08, -79.277], [-3.895, -79.13]]);
  assert.equal(estaEnLoja(-3.99, -79.2), true);
  assert.equal(estaEnLoja(-4.2, -79.2), false);
});

test('segundo paso exige parqueadero, calle principal y ubicacion', () => {
  const invalid = validateParkingRegistration({ nombreParqueadero: '', callePrincipal: '' });
  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.nombreParqueadero);
  assert.ok(invalid.errors.callePrincipal);
  assert.ok(invalid.errors.ubicacion);

  const valid = validateParkingRegistration({
    nombreParqueadero: 'Parking Centro',
    callePrincipal: 'Bolivar',
    latitud: '-3.990000',
    longitud: '-79.200000',
  });
  assert.equal(valid.isValid, true);
});

test('paso final exige documento permitido de hasta 5 MB', () => {
  assert.equal(validateRegistrationDocument(null).isValid, false);
  assert.equal(validateRegistrationDocument({ type: 'text/plain', size: 10 }).isValid, false);
  assert.equal(validateRegistrationDocument({ type: 'application/pdf', size: 1024 }).isValid, true);
});
