// src/utils/validators/authValidator.js

/**
 * Valida los datos del formulario de Login.
 */
export const validateLogin = (data) => {
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validar Correo
  if (!data.correo || String(data.correo).trim() === '') {
    errors.correo = "El correo electrónico es obligatorio.";
  } else if (!emailRegex.test(data.correo)) {
    errors.correo = "Por favor, ingresa un correo electrónico válido.";
  }

  // Validar Contraseña
  if (!data.password || String(data.password).trim() === '') {
    errors.password = "La contraseña es obligatoria.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Valida los datos del formulario de Registro (Propietario/Parqueadero).
 */
export const validateRegister = (data) => {
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // 1. Nombres y Apellidos
  if (!data.nombres || String(data.nombres).trim() === '') {
    errors.nombres = "Los nombres son obligatorios.";
  }
  if (!data.apellidos || String(data.apellidos).trim() === '') {
    errors.apellidos = "Los apellidos son obligatorios.";
  }

  // 2. Correo y Contraseña para Registro
  if (!data.correo || String(data.correo).trim() === '') {
    errors.correo = "El correo electrónico es obligatorio.";
  } else if (!emailRegex.test(data.correo)) {
    errors.correo = "Ingresa un correo válido.";
  }
  if (!data.password || String(data.password).trim() === '') {
    errors.password = "La contraseña es obligatoria.";
  } else if (String(data.password).length < 6) {
    errors.password = "La contraseña debe tener al menos 6 caracteres.";
  }

  // 3. Tipo y Número de Identificación (Cédula, RUC, Pasaporte)
  if (!data.tipoIdentificacion || String(data.tipoIdentificacion).trim() === '') {
    errors.tipoIdentificacion = "Debes seleccionar un tipo de identificación.";
  } else {
    const txtIdentificacion = String(data.identificacion || '').trim();

    if (!txtIdentificacion) {
      errors.identificacion = "El número de identificación es obligatorio.";
    } else {
      switch (data.tipoIdentificacion.toUpperCase()) {
        case 'CEDULA':
          // Cédula ecuatoriana clásica: 10 dígitos numéricos
          if (!/^\d{10}$/.test(txtIdentificacion)) {
            errors.identificacion = "La cédula debe contener exactamente 10 dígitos numéricos.";
          }
          break;
        case 'RUC':
          // RUC ecuatoriano: 13 dígitos numéricos
          if (!/^\d{13}$/.test(txtIdentificacion)) {
            errors.identificacion = "El RUC debe contener exactamente 13 dígitos numéricos.";
          }
          break;
        case 'PASAPORTE':
          // Pasaporte: Alfanumérico, usualmente entre 6 y 15 caracteres
          if (txtIdentificacion.length < 6 || txtIdentificacion.length > 15) {
            errors.identificacion = "El pasaporte debe tener entre 6 y 15 caracteres alfanuméricos.";
          }
          break;
        default:
          errors.tipoIdentificacion = "Tipo de identificación no reconocido.";
      }
    }
  }

  // 4. Datos del Parqueadero y Ubicación
  if (!data.nombreParqueadero || String(data.nombreParqueadero).trim() === '') {
    errors.nombreParqueadero = "El nombre del parqueadero es obligatorio.";
  }
  if (!data.ubicacion || String(data.ubicacion).trim() === '') {
    errors.ubicacion = "La ubicación general es obligatoria.";
  }
  if (!data.callePrincipal || String(data.callePrincipal).trim() === '') {
    errors.callePrincipal = "La calle principal es obligatoria.";
  }
  if (!data.calleSecundaria || String(data.calleSecundaria).trim() === '') {
    errors.calleSecundaria = "La calle secundaria es obligatoria.";
  }
  
  // NOTA: El campo "numeroLote" no se valida aquí por ser OPCIONAL.

  // 5. Validación del Archivo (Evitar archivos corruptos o vacíos)
  if (!data.archivoDocumento) {
    errors.archivoDocumento = "Debes seleccionar un archivo (documento/licencia).";
  } else {
    const file = data.archivoDocumento;
    // Validación nativa del objeto File del navegador
    if (file.size === 0) {
      errors.archivoDocumento = "El archivo está vacío o corrupto.";
    }
    // Opcional: Validar formatos permitidos (ej. PDF, PNG, JPG)
    const formatosPermitidos = ['application/pdf', 'image/jpeg', 'image/png'];
    if (file.type && !formatosPermitidos.includes(file.type)) {
      errors.archivoDocumento = "Formato no permitido. Solo se aceptan PDF, JPG o PNG.";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};