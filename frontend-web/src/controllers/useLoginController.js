import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { validateLogin } from '../utils/validators/authValidator';
import { authService } from '../services/authService';
import { extraerErroresApi } from '../utils/apiError';

export const useLoginController = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    correo: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  // NUEVO: antes no existía ningún estado de carga porque no había
  // ninguna llamada asíncrona real que esperar.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const limpiarCachePrivada = () => {
    queryClient.removeQueries({
      predicate: (query) => query.queryKey[0] !== 'auth',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // handleSubmit ahora es async y llama de verdad a POST /api/auth/token/.
  // Antes: validaba y ejecutaba onSuccess(formData) sin tocar la red.
  const handleSubmit = async (e, onSuccess) => {
    if (e) e.preventDefault();

    const { isValid, errors: validationErrors } = validateLogin(formData);
    if (!isValid) {
      setErrors(validationErrors);
      return false;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      // Una misma pestaña puede iniciar sesión con cuentas de roles distintos.
      // Elimina primero toda la información privada de la cuenta anterior y usa
      // /auth/me/ como fuente autoritativa antes de decidir la redirección.
      limpiarCachePrivada();
      await authService.login({ ...formData, correo: formData.correo.trim() });
      const sesion = await authService.me();
      queryClient.setQueryData(['auth', 'me'], sesion);
      if (onSuccess) onSuccess(sesion);
      return true;
    } catch (error) {
      authService.clearLocalSession();
      limpiarCachePrivada();
      // Mapea el envelope {error, detail, code} de core/exceptions.py a
      // errores por campo / mensaje general del formulario.
      setErrors(extraerErroresApi(error));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  };
};
