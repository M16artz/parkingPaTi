import test from 'node:test';
import assert from 'node:assert/strict';

import { destinoSesion, esSesionAdministradora } from '../src/utils/adminAccess.js';

test('solo el rol administrador satisface la guarda administrativa', () => {
  assert.equal(esSesionAdministradora({ rol: 'ADMINISTRADOR' }), true);
  assert.equal(esSesionAdministradora({ rol: 'PROPIETARIO' }), false);
  assert.equal(esSesionAdministradora(null), false);
});

test('login dirige administrador al panel y propietario a su flujo', () => {
  assert.equal(destinoSesion({ rol: 'ADMINISTRADOR' }), '/admin/applications');
  assert.equal(destinoSesion({ rol: 'PROPIETARIO', onboarding_estado: 'ACTIVO' }), '/owner/configuration');
  assert.equal(
    destinoSesion({ rol: 'PROPIETARIO', onboarding_estado: 'REVISION_PENDIENTE' }),
    '/owner/onboarding',
  );
});
