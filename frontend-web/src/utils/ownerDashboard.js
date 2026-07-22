const normalizarDia = (value = '') => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toUpperCase();

export const resumirEspacios = (espacios = []) => espacios
  .filter((espacio) => espacio.is_active)
  .reduce((resumen, espacio) => {
    resumen.total += 1;
    if (espacio.estado === 'LIBRE') resumen.libres += 1;
    if (espacio.estado === 'OCUPADO') resumen.ocupados += 1;
    if (espacio.estado === 'INHABILITADO') resumen.inhabilitados += 1;
    return resumen;
  }, { total: 0, libres: 0, ocupados: 0, inhabilitados: 0 });

export const calcularOcupacion = ({ total, ocupados }) => total > 0
  ? Math.round((ocupados / total) * 100)
  : 0;

export const obtenerHorarioHoy = (horarios = [], fecha = new Date()) => {
  const dia = new Intl.DateTimeFormat('es-EC', {
    timeZone: 'America/Guayaquil',
    weekday: 'long',
  }).format(fecha);
  return horarios.find((horario) => horario.dia === normalizarDia(dia)) || null;
};

export const obtenerTarifa = (tarifas = [], codigo) => tarifas
  .find((tarifa) => tarifa.codigo === codigo && tarifa.activa) || null;

export const formatearMoneda = (valor) => {
  if (valor === null || valor === undefined || valor === '') return 'Sin configurar';
  return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(Number(valor));
};

export const pendientesConfiguracion = (parqueadero, configuracion) => {
  const pendientes = [];
  if (!parqueadero?.nombre || !parqueadero?.direccion?.calle_principal || !parqueadero?.ubicacion) pendientes.push({ label: 'Información del parqueadero', view: 'infoGeneral' });
  if (!configuracion?.horarios?.length) pendientes.push({ label: 'Horarios', view: 'configGeneral' });
  if (!obtenerTarifa(configuracion?.tarifas, 'NORMAL')) pendientes.push({ label: 'Tarifa general', view: 'configGeneral' });
  if (!configuracion?.espacios?.some((espacio) => espacio.is_active)) pendientes.push({ label: 'Espacios', view: 'configEspacios' });
  return pendientes;
};

export const etiquetaEstado = (estado) => ({
  ABIERTO: 'Abierto', CERRADO: 'Cerrado', LLENO: 'Lleno',
  FUERA_DE_SERVICIO: 'Fuera de servicio', INACTIVO: 'Inactivo',
}[estado] || estado || 'No disponible');
