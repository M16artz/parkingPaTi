import { useState } from 'react';
import { validateLogin } from '../utils/validators/authValidator';
import { authService } from '../services/authService';
import { extraerErroresApi } from '../utils/apiError';

export const useLoginController = () => {
  const [formData, setFormData] = useState({
    correo: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  // NUEVO: antes no existía ningún estado de carga porque no había
  // ninguna llamada asíncrona real que esperar.
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const sesion = await authService.login(formData);
      if (onSuccess) onSuccess(sesion);
      return true;
    } catch (error) {
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
