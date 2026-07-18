import { estaEnLoja } from '../../config/loja.js';

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
  else if (String(data.nombres).trim().length > 100) errors.nombres = 'Los nombres no pueden superar 100 caracteres.';
  if (!String(data.apellidos || '').trim()) errors.apellidos = 'Los apellidos son obligatorios.';
  else if (String(data.apellidos).trim().length > 100) errors.apellidos = 'Los apellidos no pueden superar 100 caracteres.';
  if (!['CEDULA', 'RUC', 'PASAPORTE'].includes(data.tipoIdentificacion)) {
    errors.tipoIdentificacion = 'Selecciona un tipo de identificación.';
  }
  if (!String(data.identificacion || '').trim()) {
    errors.identificacion = 'El número de identificación es obligatorio.';
  } else if (data.tipoIdentificacion === 'CEDULA' && !/^\d{10}$/.test(data.identificacion || '')) {
    errors.identificacion = 'La cédula debe tener 10 dígitos.';
  } else if (data.tipoIdentificacion === 'RUC' && !/^\d{13}$/.test(data.identificacion || '')) {
    errors.identificacion = 'El RUC debe tener 13 dígitos.';
  } else if (data.tipoIdentificacion === 'PASAPORTE' && !/^[A-Z0-9]{6,15}$/.test(data.identificacion || '')) {
    errors.identificacion = 'El pasaporte debe tener entre 6 y 15 caracteres alfanuméricos.';
  }
  if (!EMAIL.test(String(data.correo || '').trim())) errors.correo = 'Ingresa un correo válido.';
  const correo = String(data.correo || '').trim().toLowerCase();
  const confirmarCorreo = String(data.confirmarCorreo || '').trim().toLowerCase();
  if (!confirmarCorreo) errors.confirmarCorreo = 'Confirma tu correo electrónico.';
  else if (!EMAIL.test(confirmarCorreo)) errors.confirmarCorreo = 'Ingresa una confirmación de correo válida.';
  else if (correo !== confirmarCorreo) errors.confirmarCorreo = 'Los correos electrónicos no coinciden.';
  if (String(data.password || '').length < 8) errors.password = 'La contraseña debe tener al menos 8 caracteres.';
  else if (/^\d+$/.test(data.password)) errors.password = 'La contraseña no puede contener solamente números.';
  if (!data.confirmarPassword) errors.confirmarPassword = 'Repite la contraseña.';
  else if (data.password !== data.confirmarPassword) errors.confirmarPassword = 'Las contraseñas no coinciden.';
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateParkingRegistration(data) {
  const errors = {};
  if (!String(data.nombreParqueadero || '').trim()) errors.nombreParqueadero = 'El nombre del parqueadero es obligatorio.';
  else if (String(data.nombreParqueadero).trim().length > 150) errors.nombreParqueadero = 'El nombre no puede superar 150 caracteres.';
  if (!String(data.callePrincipal || '').trim()) errors.callePrincipal = 'La calle principal es obligatoria.';
  else if (String(data.callePrincipal).trim().length > 200) errors.callePrincipal = 'La calle principal no puede superar 200 caracteres.';
  if (String(data.calleSecundaria || '').length > 200) errors.calleSecundaria = 'La calle secundaria no puede superar 200 caracteres.';
  if (String(data.numeroLote || '').length > 50) errors.numeroLote = 'El número de lote no puede superar 50 caracteres.';
  if (!data.latitud || !data.longitud) errors.ubicacion = 'Selecciona la ubicación del parqueadero en el mapa.';
  else if (!estaEnLoja(Number(data.latitud), Number(data.longitud))) errors.ubicacion = 'La ubicación debe estar dentro del área admitida de Loja.';
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateRegistrationDocument(file) {
  if (!file) return { isValid: false, errors: { archivo: 'Selecciona un documento.' } };
  if (!file.size) return { isValid: false, errors: { archivo: 'El documento no puede estar vacío.' } };
  if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
    return { isValid: false, errors: { archivo: 'Adjunta un PDF, JPG o PNG.' } };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { isValid: false, errors: { archivo: 'El documento no puede superar los 5 MB.' } };
  }
  const extension = String(file.name || '').split('.').pop().toLowerCase();
  if (!['pdf', 'jpg', 'jpeg', 'png'].includes(extension)) {
    return { isValid: false, errors: { archivo: 'La extensión del archivo no está permitida.' } };
  }
  return { isValid: true, errors: {} };
}
