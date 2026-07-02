// ============================================================================
// VALIDACIONES DE CONFIGURACIÓN GENERAL DEL PARQUEADERO - PARKINGPATI
// ============================================================================

export const validarHorarioDia = (dia) => {
  if (!dia.activo) return null;
  
  if (!dia.inicio || !dia.fin) {
    return "Ambas horas son obligatorias si el día está activo.";
  }

  const [hInicio, mInicio] = dia.inicio.split(':').map(Number);
  const [hFin, mFin] = dia.fin.split(':').map(Number);
  
  const minutosInicio = hInicio * 60 + mInicio;
  const minutosFin = hFin * 60 + mFin;

  if (minutosInicio >= minutosFin) {
    return "La hora de fin debe ser posterior a la de inicio.";
  }

  return null;
};

export const validarTarifasConfig = (tarifas) => {
  const erroresTarifas = {};

  // Tarifa General: ESTRICTAMENTE OBLIGATORIA y mayor que 0
  if (!tarifas.general || parseFloat(tarifas.general) <= 0) {
    erroresTarifas.tarifa_general = "Tarifa inválida";
  }
  
  // Tarifa Descuento: OPCIONAL (si tiene algo escrito, debe ser un número válido >= 0)
  if (tarifas.descuento !== "" && (isNaN(tarifas.descuento) || parseFloat(tarifas.descuento) < 0)) {
    erroresTarifas.tarifa_descuento = "Tarifa inválida";
  }
  
  // Tarifa Grandes: OPCIONAL (si tiene algo escrito, debe ser un número válido >= 0)
  if (tarifas.grandes !== "" && (isNaN(tarifas.grandes) || parseFloat(tarifas.grandes) < 0)) {
    erroresTarifas.tarifa_grandes = "Tarifa inválida";
  }

  return erroresTarifas;
};