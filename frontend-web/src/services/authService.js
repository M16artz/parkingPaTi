// src/services/authService.js
//
// Antes: NINGÚN controlador llamaba al backend. useLoginController.js
// terminaba en `if (onSuccess) onSuccess(formData)` y
// useRegisterController.js hacía `await new Promise(r => setTimeout(r, 1500))`
// como simulación. No había fetch/axios a /api/auth/... en todo el repo.
//
// Mapeos importantes con el backend (apps/usuarios):
//
// 1) LOGIN usa username, no correo.
//    CustomTokenObtainPairSerializer hereda de TokenObtainPairSerializer sin
//    tocar USERNAME_FIELD, y el modelo Cuenta(AbstractUser) tampoco lo
//    redefine -> el campo que exige POST /api/auth/token/ es "username",
//    no "correo". El formulario de login solo pide correo/password, así
//    que reusamos el correo COMO username (ver punto 2: en el registro
//    igual se guarda username = correo, así que siempre coincide).
//
// 2) REGISTRO no tiene campo "username" en la UI.
//    RegistroDTO exige nombre, apellido, tipo_identificacion, identificacion,
//    username, correo, password. Como el formulario de registro no pide un
//    username aparte, se envía username = correo. Es válido para Django
//    (el validador por defecto de username acepta @ . + - _), y mantiene
//    login/registro consistentes.
//
// 3) tipo_identificacion: el <select> del frontend usa 'CEDULA', pero
//    TipoIdentificacion en el backend define 'CI' (no 'CEDULA'). Sin este
//    mapeo, cualquier registro con cédula falla con 400
//    ("«CEDULA» no es una elección válida.").
//
// 4) El registro público SIEMPRE crea rol PROPIETARIO (RegistroDTO no
//    acepta "rol" - ver comentario de seguridad en el propio serializer).
//    Los datos de parqueadero/documento del formulario de registro NO
//    forman parte de este request: se crean después, autenticado, contra
//    /api/parqueaderos/ y /api/documentos/ (ver parqueaderoService.js /
//    documentoService.js). Este archivo solo cubre auth.

import { apiClient, tokenStorage } from './apiClient';

const TIPO_IDENTIFICACION_MAP = {
  CEDULA: 'CI',
  RUC: 'RUC',
  PASAPORTE: 'PASAPORTE',
};

export const authService = {
  /**
   * POST /api/auth/token/
   * @param {{correo: string, password: string}} credenciales
   */
  async login({ correo, password }) {
    const { data } = await apiClient.post('/auth/token/', {
      username: correo,
      password,
    });
    // Respuesta real: { refresh, access, username, rol }
    tokenStorage.setTokens(data.access, data.refresh);
    return {
      accessToken: data.access,
      refreshToken: data.refresh,
      username: data.username,
      rol: data.rol,
    };
  },

  /**
   * POST /api/auth/register/
   * Recibe el formData tal cual lo produce useRegisterController y lo
   * traduce al contrato exacto de RegistroDTO.
   */
  async register(formData) {
    const payload = {
      nombre: formData.nombres,
      apellido: formData.apellidos,
      tipo_identificacion:
        TIPO_IDENTIFICACION_MAP[formData.tipoIdentificacion] ?? formData.tipoIdentificacion,
      identificacion: formData.identificacion,
      username: formData.correo,
      correo: formData.correo,
      password: formData.password,
    };

    // Respuesta real: CuentaDetalleDTO -> { id, username, correo, persona, rol, rol_display, estado, date_joined }
    const { data } = await apiClient.post('/auth/register/', payload);
    return data;
  },

  logout() {
    tokenStorage.clear();
  },
};
