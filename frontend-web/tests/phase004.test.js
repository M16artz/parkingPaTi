import test from 'node:test';
import assert from 'node:assert/strict';

import {
  destinoSesion,
  esSesionAdministradora,
  redireccionRutaPropietario,
} from '../src/utils/adminAccess.js';
import { FILTRO_ACCESO, normalizarFiltroActivo } from '../src/utils/adminFilters.js';

test('solo el rol administrador satisface la guarda administrativa', () => {
  assert.equal(esSesionAdministradora({ rol: 'ADMINISTRADOR' }), true);
  assert.equal(esSesionAdministradora({ rol: 'PROPIETARIO' }), false);
  assert.equal(esSesionAdministradora(null), false);
});

test('login dirige administrador al panel y propietario a su flujo', () => {
  assert.equal(destinoSesion({ rol: 'ADMINISTRADOR' }), '/admin/applications');
  assert.equal(destinoSesion({ rol: 'PROPIETARIO', onboarding_estado: 'ACTIVO' }), '/owner/dashboard');
  assert.equal(
    destinoSesion({ rol: 'PROPIETARIO', onboarding_estado: 'REVISION_PENDIENTE' }),
    '/owner/onboarding',
  );
});

test('una cuenta activa no vuelve a configuracion y una pendiente no entra al dashboard', () => {
  assert.equal(
    redireccionRutaPropietario(
      { rol: 'PROPIETARIO', onboarding_estado: 'ACTIVO' },
      '/owner/configuration',
    ),
    '/owner/dashboard',
  );
  assert.equal(
    redireccionRutaPropietario(
      { rol: 'PROPIETARIO', onboarding_estado: 'CONFIGURACION_PENDIENTE' },
      '/owner/dashboard',
    ),
    '/owner/configuration',
  );
  assert.equal(
    redireccionRutaPropietario(
      { rol: 'PROPIETARIO', onboarding_estado: 'ACTIVO' },
      '/owner/dashboard',
    ),
    null,
  );
});

test('filtro Todas omite activo y los filtros específicos envían booleanos', () => {
  assert.equal(normalizarFiltroActivo(FILTRO_ACCESO.TODOS), undefined);
  assert.equal(normalizarFiltroActivo(FILTRO_ACCESO.HABILITADAS), true);
  assert.equal(normalizarFiltroActivo(FILTRO_ACCESO.DESHABILITADAS), false);
});
