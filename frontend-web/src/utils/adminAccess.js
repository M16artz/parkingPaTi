export const esSesionAdministradora = (sesion) => sesion?.rol === 'ADMINISTRADOR';

export const destinoSesion = (sesion) => {
  if (esSesionAdministradora(sesion)) return '/admin/applications';
  if (sesion?.onboarding_estado === 'CONFIGURACION_PENDIENTE') return '/owner/configuration';
  if (sesion?.onboarding_estado === 'ACTIVO') return '/owner/dashboard';
  return '/owner/onboarding';
};

export const redireccionRutaPropietario = (sesion, rutaActual) => {
  const destino = destinoSesion(sesion);
  return rutaActual === destino ? null : destino;
};
