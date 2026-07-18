import test from 'node:test';
import assert from 'node:assert/strict';

import {
  crearFormularioConfiguracion,
  crearPayloadConfiguracion,
  limpiarDecimalPositivo,
  limpiarEnteroPositivo,
  validarConfiguracion,
  validarConfiguracionPorCampo,
} from '../src/utils/ownerConfiguration.js';
import { extraerErroresApi } from '../src/utils/apiError.js';
import { destinoSesion } from '../src/utils/adminAccess.js';
import {
  calcularOcupacion,
  obtenerHorarioHoy,
  pendientesConfiguracion,
  resumirEspacios,
} from '../src/utils/ownerDashboard.js';

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
    'Ingresa un precio mayor que 0 usando punto decimal.',
  );
});

test('validacion identifica el dia exacto cuyo horario es invalido', () => {
  const form = crearFormularioConfiguracion(null);
  form.horarios.MARTES = {
    activo: true,
    hora_apertura: '18:00',
    hora_cierre: '08:00',
  };
  form.tarifas.NORMAL.precio_hora = '1.25';
  const errores = validarConfiguracionPorCampo(form);
  assert.equal(errores.horarios.MARTES, 'En Martes, la apertura debe ser anterior al cierre.');
});

test('campos numericos eliminan signos, letras y decimales extra', () => {
  assert.equal(limpiarDecimalPositivo('-1e.2.34abc'), '1.23');
  assert.equal(limpiarDecimalPositivo('12.5'), '12.5');
  assert.equal(limpiarEnteroPositivo('-12e.5abc'), '125');
});

test('inicio calcula ocupacion usando solamente espacios activos reales', () => {
  const resumen = resumirEspacios([
    { is_active: true, estado: 'LIBRE' },
    { is_active: true, estado: 'OCUPADO' },
    { is_active: true, estado: 'INHABILITADO' },
    { is_active: false, estado: 'OCUPADO' },
  ]);
  assert.deepEqual(resumen, { total: 3, libres: 1, ocupados: 1, inhabilitados: 1 });
  assert.equal(calcularOcupacion(resumen), 33);
});

test('inicio obtiene horario del dia y detecta configuracion pendiente', () => {
  assert.equal(
    obtenerHorarioHoy([{ dia: 'LUNES', hora_apertura: '08:00', hora_cierre: '18:00' }], new Date('2026-07-13T12:00:00')).dia,
    'LUNES',
  );
  const pendientes = pendientesConfiguracion(
    { nombre: 'Parking', direccion: { calle_principal: 'Bolivar' }, ubicacion: { latitud: '-3.9', longitud: '-79.2' } },
    { horarios: [], tarifas: [], espacios: [] },
  );
  assert.deepEqual(pendientes.map((item) => item.view), ['configGeneral', 'configGeneral', 'configEspacios']);
});

test('precio cero no es positivo y errores anidados de API son legibles', () => {
  const form = crearFormularioConfiguracion(null);
  form.horarios.LUNES.activo = true;
  form.tarifas.NORMAL.precio_hora = '0';
  assert.equal(
    validarConfiguracionPorCampo(form).tarifas.NORMAL,
    'Ingresa un precio mayor que 0 usando punto decimal.',
  );
  const errores = extraerErroresApi({
    response: { data: { fields: { horarios: [{ non_field_errors: ['Horario inválido.'] }] } } },
  });
  assert.equal(errores.horarios, 'Horario inválido.');
});
