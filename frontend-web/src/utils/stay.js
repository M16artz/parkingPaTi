export function tarifaInicialEstancia(tarifas, tarifaPredeterminadaId) {
  const activas = tarifas.filter((tarifa) => tarifa.activa);
  const predeterminada = activas.find((tarifa) => tarifa.id === tarifaPredeterminadaId);
  if (predeterminada) return predeterminada.id;
  return activas.find((tarifa) => tarifa.codigo === 'NORMAL')?.id ?? activas[0]?.id ?? '';
}

export function tarifaAplicadaEspacio(espacio) {
  if (espacio?.estado === 'OCUPADO') {
    return espacio.estancia_tarifa_codigo || espacio.tarifa_codigo || espacio.tarifa || '';
  }
  return espacio?.tarifa_codigo || espacio?.tarifa || '';
}

export function formatearCostoInformativo(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? `$${numero.toFixed(2)}` : '$0.00';
}
