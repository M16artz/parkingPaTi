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

  const outside = validateParkingRegistration({
    nombreParqueadero: 'Parking Centro', callePrincipal: 'Bolivar', latitud: '-4.200000', longitud: '-79.200000',
  });
  assert.equal(outside.isValid, false);
  assert.ok(outside.errors.ubicacion);
});

test('paso final exige documento permitido de hasta 5 MB', () => {
  assert.equal(validateRegistrationDocument(null).isValid, false);
  assert.equal(validateRegistrationDocument({ name: 'documento.txt', type: 'text/plain', size: 10 }).isValid, false);
  assert.equal(validateRegistrationDocument({ name: 'documento.pdf', type: 'application/pdf', size: 1024 }).isValid, true);
  assert.equal(validateRegistrationDocument({ name: 'vacio.pdf', type: 'application/pdf', size: 0 }).isValid, false);
  assert.equal(validateRegistrationDocument({ name: 'documento.exe', type: 'application/pdf', size: 1024 }).isValid, false);
});

test('pasaporte conserva letras y exige formato alfanumerico', () => {
  const result = validateRegister({
    nombres: 'Ana', apellidos: 'Paredes', tipoIdentificacion: 'PASAPORTE',
    identificacion: 'AB123456', correo: 'ana@example.invalid',
    confirmarCorreo: 'ana@example.invalid', password: 'segura-123', confirmarPassword: 'segura-123',
  });
  assert.equal(result.isValid, true);
});

test('paso personal exige ocho campos y normaliza la comparación de correos', () => {
  const empty = validateRegister({});
  const expected = ['nombres', 'apellidos', 'tipoIdentificacion', 'identificacion', 'correo', 'confirmarCorreo', 'password', 'confirmarPassword'];
  expected.forEach((field) => assert.ok(empty.errors[field], `Falta error para ${field}`));

  const valid = validateRegister({
    nombres: 'Ana María', apellidos: 'Paredes', tipoIdentificacion: 'RUC', identificacion: '1101234567001',
    correo: 'Propietaria@Example.Invalid ', confirmarCorreo: ' propietaria@example.invalid',
    password: 'segura-123', confirmarPassword: 'segura-123',
  });
  assert.equal(valid.isValid, true);
});

test('contraseña exclusivamente numérica respeta el validador real de Django', () => {
  const result = validateRegister({
    nombres: 'Ana', apellidos: 'Paredes', tipoIdentificacion: 'CEDULA', identificacion: '1100000000',
    correo: 'ana@example.invalid', confirmarCorreo: 'ana@example.invalid',
    password: '12345678', confirmarPassword: '12345678',
  });
  assert.equal(result.isValid, false);
  assert.ok(result.errors.password);
});
