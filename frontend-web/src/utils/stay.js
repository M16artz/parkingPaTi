export function tarifaInicialEstancia(tarifas) {
  const activas = tarifas.filter((tarifa) => tarifa.activa);
  return activas.find((tarifa) => tarifa.codigo === 'NORMAL')?.id ?? activas[0]?.id ?? '';
}

export function formatearCostoInformativo(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? `$${numero.toFixed(2)}` : '$0.00';
}
