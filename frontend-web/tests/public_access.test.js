import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { sanitizarBorradorRegistro } from '../src/utils/registerDraft.js';
import { validateLogin, validateRegister } from '../src/utils/validators/authValidator.js';

test('borrador de registro excluye datos sensibles', () => {
  const draft = sanitizarBorradorRegistro({ nombres: 'Ana', identificacion: '1100000000', password: 'secreto', confirmarPassword: 'secreto', correo: 'ana@example.invalid' });
  assert.equal(draft.nombres, 'Ana');
  assert.equal(draft.correo, 'ana@example.invalid');
  assert.equal('identificacion' in draft, false);
  assert.equal('password' in draft, false);
  assert.equal('confirmarPassword' in draft, false);
});

test('login valida correo y contraseña sin aceptar espacios como correo', () => {
  const empty = validateLogin({ correo: '   ', password: '' });
  assert.equal(empty.isValid, false);
  assert.ok(empty.errors.correo);
  assert.ok(empty.errors.password);
  assert.equal(validateLogin({ correo: 'persona@example.invalid', password: 'segura' }).isValid, true);
});

test('registro público usa los campos contractuales y confirmaciones', () => {
  const result = validateRegister({
    nombres: 'Ana', apellidos: 'Paredes', tipoIdentificacion: 'CEDULA', identificacion: '1100000000',
    correo: 'ana@example.invalid', confirmarCorreo: 'ana@example.invalid', password: 'segura-123', confirmarPassword: 'segura-123',
  });
  assert.equal(result.isValid, true);
});

test('rutas públicas separan login y registro sin alertas ni enlaces ficticios', async () => {
  const [routes, home, login, register, steps, dialog, authService] = await Promise.all([
    readFile(new URL('../src/config/routes.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/views/auth/HomeView.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/views/auth/LoginView.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/views/auth/RegisterView.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/views/components/register/RegisterSteps.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/views/components/register/RegisterDialog.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/services/authService.js', import.meta.url), 'utf8'),
  ]);
  assert.match(routes, /path: '\/'[^\n]*<HomeView/);
  assert.match(routes, /path: '\/login'[^\n]*<LoginView/);
  assert.match(routes, /path: '\/register'[^\n]*<RegisterView/);
  assert.match(routes, /path: '\*'[^\n]*<Navigate to="\/"/);
  assert.match(login, /searchParams\.get\('mode'\) === 'register'/);
  assert.match(login, /Continuar al registro/);
  assert.match(login, /navigate\('\/register'\)/);
  assert.match(login, /setSearchParams\(\{ mode: 'register' \}\)/);
  assert.match(login, /hidden lg:flex/);
  assert.doesNotMatch(login, /useRegisterController|RegisterForm|MapContainer|FileDropzone/);
  assert.doesNotMatch(`${home}\n${login}\n${register}`, /alert\s*\(/);
  assert.doesNotMatch(login, /href=["']#forgot/);
  assert.doesNotMatch(register, /navigate\(['"]\/home/);
  const personalStep = steps.slice(steps.indexOf('export const PersonalDataStep'), steps.indexOf('export const ParkingDataStep'));
  ['nombres', 'apellidos', 'tipoIdentificacion', 'identificacion', 'correo', 'confirmarCorreo', 'password', 'confirmarPassword'].forEach((field) => assert.match(personalStep, new RegExp(field)));
  assert.equal((personalStep.match(/<AuthField/g) || []).length, 7);
  assert.equal((personalStep.match(/<select/g) || []).length, 1);
  assert.match(dialog, /createPortal/);
  assert.doesNotMatch(authService, /confirmarCorreo|confirmarPassword/);
});

test('login y dashboards ofrecen composiciones específicas para móvil', async () => {
  const [login, owner, admin, applications, accounts] = await Promise.all([
    readFile(new URL('../src/views/auth/LoginView.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/views/owner/OwnerDashboardView.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/views/admin/AdminDashboardView.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/views/admin/AdminApplicationsView.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/views/admin/AdminAccountsView.jsx', import.meta.url), 'utf8'),
  ]);
  assert.match(login, /isSignUp[\s\S]*hidden lg:flex/);
  assert.match(owner, /aria-label="Panel del propietario"/);
  assert.match(owner, /lg:hidden/);
  assert.match(admin, /aria-label="Panel de administración"/);
  assert.match(admin, /lg:hidden/);
  assert.match(applications, /md:hidden/);
  assert.match(applications, /Revisar solicitud/);
  assert.match(accounts, /md:hidden/);
  assert.match(accounts, /Dar de baja/);
});

test('vista fantasma usa ruta pública canónica, API real y navegación pública', async () => {
  const [routes, ghost, detail, service, controller, home] = await Promise.all([
    readFile(new URL('../src/config/routes.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/views/public/GhostDashboard.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/views/components/public/ParkingDetailPanel.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/services/publicParkingService.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/controllers/usePublicParkingsController.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/views/auth/HomeView.jsx', import.meta.url), 'utf8'),
  ]);
  assert.match(routes, /path: '\/parqueaderos'[^\n]*<GhostDashboard/);
  assert.match(routes, /path: '\/parkings'[^\n]*<Navigate to="\/parqueaderos" replace/);
  assert.match(home, /navigate\('\/parqueaderos'\)/);
  assert.match(service, /\/public\/parkings\//);
  assert.match(controller, /navigator\.geolocation\.getCurrentPosition/);
  assert.match(controller, /PUBLIC_BBOX_DEBOUNCE_MS/);
  assert.match(ghost, /ParkingResultsList/);
  assert.match(ghost, /ParkingSearchFilters/);
  assert.match(ghost, /onDeselect=\{\(\) => controller\.selectParking\(null\)\}/);
  assert.match(detail, /Ver todos/);
  assert.doesNotMatch(detail, />Ver espacios<|>Compartir</);
  assert.doesNotMatch(`${ghost}\n${controller}`, /parqueaderosLoja|useState\(\{\s*latitude|alert\s*\(/);
});

test('el mapa conserva el foco elegido durante polling y permite navegación dentro de Loja', async () => {
  const map = await readFile(new URL('../src/views/components/public/PublicParkingMap.jsx', import.meta.url), 'utf8');
  assert.match(map, /maxBounds=\{LOJA_BOUNDS\}/);
  assert.match(map, /minZoom=\{12\}/);
  assert.match(map, /maxZoom=\{19\}/);
  assert.match(map, /scrollWheelZoom doubleClickZoom touchZoom boxZoom keyboard zoomControl/);
  assert.match(map, /const parkingsRef = useRef\(parkings\)/);
  assert.match(map, /parkingsRef\.current\.find/);
  assert.doesNotMatch(map, /\[command, map, parkings, userLocation\]/);
});
