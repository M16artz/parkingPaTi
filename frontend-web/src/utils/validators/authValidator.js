const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(data) {
  const errors = {};
  if (!EMAIL.test(String(data.correo || '').trim())) errors.correo = 'Ingresa un correo válido.';
  if (!data.password) errors.password = 'La contraseña es obligatoria.';
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateRegister(data) {
  const errors = {};
  if (!String(data.nombres || '').trim()) errors.nombres = 'Los nombres son obligatorios.';
  if (!String(data.apellidos || '').trim()) errors.apellidos = 'Los apellidos son obligatorios.';
  if (!['CEDULA', 'RUC', 'PASAPORTE'].includes(data.tipoIdentificacion)) {
    errors.tipoIdentificacion = 'Selecciona un tipo de identificación.';
  }
  if (data.tipoIdentificacion === 'CEDULA' && !/^\d{10}$/.test(data.identificacion || '')) {
    errors.identificacion = 'La cédula debe tener 10 dígitos.';
  }
  if (data.tipoIdentificacion === 'RUC' && !/^\d{13}$/.test(data.identificacion || '')) {
    errors.identificacion = 'El RUC debe tener 13 dígitos.';
  }
  if (data.tipoIdentificacion === 'PASAPORTE' && !/^[A-Z0-9]{6,15}$/.test(data.identificacion || '')) {
    errors.identificacion = 'El pasaporte debe tener entre 6 y 15 caracteres alfanuméricos.';
  }
  if (!EMAIL.test(String(data.correo || '').trim())) errors.correo = 'Ingresa un correo válido.';
  if (data.correo !== data.confirmarCorreo) errors.confirmarCorreo = 'Los correos no coinciden.';
  if (String(data.password || '').length < 8) errors.password = 'La contraseña debe tener al menos 8 caracteres.';
  if (data.password !== data.confirmarPassword) errors.confirmarPassword = 'Las contraseñas no coinciden.';
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateParkingRegistration(data) {
  const errors = {};
  if (!String(data.nombreParqueadero || '').trim()) errors.nombreParqueadero = 'El nombre del parqueadero es obligatorio.';
  if (!String(data.callePrincipal || '').trim()) errors.callePrincipal = 'La calle principal es obligatoria.';
  if (!data.latitud || !data.longitud) errors.ubicacion = 'Selecciona la ubicación del parqueadero en el mapa.';
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateRegistrationDocument(file) {
  if (!file) return { isValid: false, errors: { archivo: 'Selecciona un documento.' } };
  if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
    return { isValid: false, errors: { archivo: 'Adjunta un PDF, JPG o PNG.' } };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { isValid: false, errors: { archivo: 'El documento no puede superar los 5 MB.' } };
  }
  return { isValid: true, errors: {} };
}
