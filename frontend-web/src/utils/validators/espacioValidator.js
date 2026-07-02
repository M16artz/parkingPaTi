// src/utils/validators/espacioValidator.js

/**
 * Valida los datos de la configuración de espacios del parqueadero.
 * @param {Object} data - Objeto con los datos a validar ({ numEspacios, estado, tarifa })
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateEspacioConfig = (data) => {
  const errors = {};

  // 1. Validar número de espacios totales
  if (data.numEspacios !== undefined) {
    if (!data.numEspacios || String(data.numEspacios).trim() === '') {
      errors.numEspacios = "El número de espacios es requerido.";
    } else {
      const num = parseInt(data.numEspacios, 10);
      if (isNaN(num) || num < 1) {
        errors.numEspacios = "Debe haber al menos 1 espacio disponible.";
      } else if (num > 200) { 
        errors.numEspacios = "El límite máximo de espacios permitido es 200.";
      }
    }
  }

  // 2. Validar estado seleccionado (para el Modal)
  if (data.estado) {
    const estadosPermitidos = ['LIBRE', 'OCUPADO', 'INHABILITADO'];
    if (!estadosPermitidos.includes(data.estado)) {
      errors.estado = "El estado seleccionado no es válido.";
    }
  }

  // 3. Validar tarifa seleccionada (para el Modal)
  if (data.tarifa) {
    const tarifasPermitidas = ['GENERAL', 'PREFERENCIAL', 'PESADOS'];
    if (!tarifasPermitidas.includes(data.tarifa)) {
      errors.tarifa = "La estructura tarifaria seleccionada no es válida.";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};