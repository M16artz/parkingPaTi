import { useState } from 'react';
import { validateLogin } from '../utils/validators/authValidator';

export const useLoginController = () => {
  // Estado inicial del formulario de Login
  const [formData, setFormData] = useState({
    correo: '',
    password: ''
  });

  // Estado para capturar los errores de validación
  const [errors, setErrors] = useState({});

  // Manejador genérico para los inputs de la vista
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Limpieza de error en tiempo real mientras el usuario escribe
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Manejador del envío del formulario
  const handleSubmit = (e, onSuccess) => {
    if (e) e.preventDefault();

    // Ejecutamos la validación del paquete de utilitarios
    const { isValid, errors: validationErrors } = validateLogin(formData);

    if (!isValid) {
      setErrors(validationErrors);
      return false; // Detiene el flujo si hay errores
    }

    setErrors({});
    console.log("Login válido, enviando a la API de servicios...", formData);
    
    // Aquí se llamará al servicio en el siguiente paso
    if (onSuccess) onSuccess(formData);
    return true;
  };

  return {
    formData,
    errors,
    handleChange,
    handleSubmit
  };
};