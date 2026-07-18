import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { extraerErroresApi } from '../utils/apiError';
import {
  validateParkingRegistration,
  validateRegister,
  validateRegistrationDocument,
} from '../utils/validators/authValidator';

const INITIAL_FORM = {
  nombres: '',
  apellidos: '',
  tipoIdentificacion: '',
  identificacion: '',
  correo: '',
  confirmarCorreo: '',
  password: '',
  confirmarPassword: '',
  nombreParqueadero: '',
  descripcion: '',
  callePrincipal: '',
  calleSecundaria: '',
  numeroLote: '',
  latitud: '',
  longitud: '',
};

export const useRegisterController = () => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const mutation = useMutation({
    mutationFn: () => authService.registerComplete(formData, file),
  });

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

  const continuePersonal = (event) => {
    event?.preventDefault();
    const validation = validateRegister(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    setStep(2);
  };

  const continueParking = (event) => {
    event?.preventDefault();
    const validation = validateParkingRegistration(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    setStep(3);
  };

  const handleFile = (nextFile) => {
    setFile(nextFile);
    setErrors((current) => ({ ...current, archivo: null }));
  };

  const setLocation = (latitud, longitud) => {
    setFormData((current) => ({ ...current, latitud, longitud }));
    setErrors((current) => ({ ...current, ubicacion: null }));
  };

  const handleSubmit = async (event, onSuccess) => {
    event?.preventDefault();
    const validation = validateRegistrationDocument(file);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    try {
      const result = await mutation.mutateAsync();
      onSuccess?.(result);
    } catch (error) {
      setErrors(extraerErroresApi(error));
    }
  };

  return {
    formData,
    step,
    file,
    errors,
    isSaving: mutation.isPending,
    handleChange,
    handleFile,
    setLocation,
    continuePersonal,
    continueParking,
    previousStep: () => { setErrors({}); setStep((current) => Math.max(1, current - 1)); },
    handleSubmit,
  };
};
