// src/utils/apiError.js
//
// core/exceptions.py envuelve TODOS los errores de la API en:
//   { "error": true, "detail": <string | objeto-por-campo>, "code": "..." }
//
// "detail" puede ser:
//   - un string           -> ej. PermissionDenied, NotFound
//   - un objeto por campo -> ej. errores de validación de un serializer,
//     como { "correo": ["Este campo ya está en uso."], "non_field_errors": [...] }
//
// Antes: no existía ningún código en el frontend que leyera error.response;
// los controladores atrapaban el error y mostraban un string genérico fijo
// ("Ocurrió un error inesperado..."), perdiendo el detalle real del backend.

export function extraerErroresApi(error) {
  const data = error?.response?.data;

  // Sin respuesta del backend (red caída, CORS, timeout, etc.)
  if (!data) {
    return { formulario: 'No se pudo conectar con el servidor. Intenta nuevamente.' };
  }

  const detail = data.detail ?? data;

  // Caso 1: detail es un string simple (401, 403, 404, 500, etc.)
  if (typeof detail === 'string') {
    return { formulario: detail };
  }

  // Caso 2: detail es un objeto de errores por campo (400 de un serializer)
  if (typeof detail === 'object' && detail !== null) {
    const errores = {};
    Object.entries(detail).forEach(([campo, mensajes]) => {
      const mensaje = Array.isArray(mensajes) ? mensajes.join(' ') : String(mensajes);
      if (campo === 'non_field_errors') {
        errores.formulario = mensaje;
      } else {
        errores[campo] = mensaje;
      }
    });
    return errores;
  }

  return { formulario: 'Ocurrió un error inesperado. Intenta nuevamente más tarde.' };
}
