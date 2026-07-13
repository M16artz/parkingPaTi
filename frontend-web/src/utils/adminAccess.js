export const esSesionAdministradora = (sesion) => sesion?.rol === 'ADMINISTRADOR';

export const destinoSesion = (sesion) => {
  if (esSesionAdministradora(sesion)) return '/admin/applications';
  if (['CONFIGURACION_PENDIENTE', 'ACTIVO'].includes(sesion?.onboarding_estado)) {
    return '/owner/configuration';
  }
  return '/owner/onboarding';
};
