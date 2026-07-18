export const crearCredencialesLogin = ({ correo, password }) => ({
  correo: correo.trim().toLowerCase(),
  password,
});
