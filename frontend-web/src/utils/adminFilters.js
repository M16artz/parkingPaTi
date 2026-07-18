export const FILTRO_ACCESO = Object.freeze({
  TODOS: 'TODOS',
  HABILITADAS: 'HABILITADAS',
  DESHABILITADAS: 'DESHABILITADAS',
});

export const normalizarFiltroActivo = (filtro) => {
  if (filtro === FILTRO_ACCESO.HABILITADAS) return true;
  if (filtro === FILTRO_ACCESO.DESHABILITADAS) return false;
  return undefined;
};
