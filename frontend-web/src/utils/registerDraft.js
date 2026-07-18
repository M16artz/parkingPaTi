export const REGISTER_DRAFT_KEY = 'parkingpati:register-draft';

const SAFE_DRAFT_FIELDS = [
  'nombres', 'apellidos', 'tipoIdentificacion', 'correo', 'confirmarCorreo', 'nombreParqueadero',
  'descripcion', 'callePrincipal', 'calleSecundaria', 'numeroLote', 'latitud', 'longitud',
];

export const sanitizarBorradorRegistro = (formData) => Object.fromEntries(
  SAFE_DRAFT_FIELDS.map((key) => [key, formData[key] ?? '']),
);
