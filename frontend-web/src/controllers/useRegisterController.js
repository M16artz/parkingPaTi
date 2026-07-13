import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { extraerErroresApi } from '../utils/apiError';
import { validateRegister } from '../utils/validators/authValidator';

const INITIAL_FORM = {
  nombres: '',
  apellidos: '',
  tipoIdentificacion: '',
  identificacion: '',
  correo: '',
  confirmarCorreo: '',
  password: '',
  confirmarPassword: '',
};

export const useRegisterController = () => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const mutation = useMutation({ mutationFn: authService.register });

  const handleChange = ({ target: { name, value } }) => {
    let next = value;
    if (name === 'identificacion') {
      next = formData.tipoIdentificacion === 'PASAPORTE'
        ? value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 15)
        : value.replace(/\D/g, '').slice(0, formData.tipoIdentificacion === 'RUC' ? 13 : 10);
    }
    setFormData((current) => ({ ...current, [name]: next }));
    setErrors((current) => ({ ...current, [name]: null }));
  };

  const handleSubmit = async (event, onSuccess) => {
    event?.preventDefault();
    const validation = validateRegister(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    try {
      const result = await mutation.mutateAsync(formData);
      onSuccess?.(result);
    } catch (error) {
      setErrors(extraerErroresApi(error));
    }
  };

  return { formData, errors, isSaving: mutation.isPending, handleChange, handleSubmit };
};
