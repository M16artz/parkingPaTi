import { useState } from 'react';
import { authService } from '../services/authService';
import { extraerErroresApi } from '../utils/apiError';

export const useRegisterController = () => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    tipoIdentificacion: '',
    identificacion: '',
    correo: '',
    password: '',
    nombreParqueadero: '',
    callePrincipal: '',
    calleSecundaria: '',
    numeroLote: '',
    ubicacion: '',
    archivoDocumento: null,
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'identificacion') {
      let valorLimpio = value;

      if (formData.tipoIdentificacion === 'CEDULA' || formData.tipoIdentificacion === 'RUC') {
        valorLimpio = value.replace(/[^0-9]/g, '');
        const maximoDigitos = formData.tipoIdentificacion === 'CEDULA' ? 10 : 13;
        valorLimpio = valorLimpio.slice(0, maximoDigitos);
      } else if (formData.tipoIdentificacion === 'PASAPORTE') {
        valorLimpio = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      }

      setFormData((prev) => ({ ...prev, [name]: valorLimpio }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, archivoDocumento: file }));

      if (errors.archivoDocumento) {
        setErrors((prev) => ({ ...prev, archivoDocumento: null }));
      }
    }
  };

  // handleSubmit ahora llama de verdad a POST /api/auth/register/ y
  // encadena un login automático para dejar al usuario con sesión activa.
  // Antes: console.log + await new Promise(setTimeout, 1500) simulado.
  //
  // IMPORTANTE - lo que este handler NO hace todavía, y por qué:
  // nombreParqueadero / callePrincipal / calleSecundaria / numeroLote /
  // ubicacion / archivoDocumento no se envían aquí. /api/auth/register/
  // (RegistroDTO) no los acepta - solo crea Persona + Cuenta. Crear el
  // parqueadero requiere latitud/longitud numéricas
  // (ParqueaderoCrearDTO), y el campo `ubicacion` actual del formulario es
  // un solo string de texto libre, no un par de coordenadas: hace falta
  // agregar un selector de mapa (o geocodificar la dirección) antes de
  // poder completar automáticamente ese segundo paso con
  // parqueaderoService.crear(...) y documentoService.subir(...).
  // Ver el informe adjunto, sección "Gaps pendientes".
  const handleSubmit = async (e, onSuccess) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setErrors({});

    try {
      await authService.register(formData);
      await authService.login({ correo: formData.correo, password: formData.password });

      if (onSuccess) onSuccess();
    } catch (error) {
      setErrors(extraerErroresApi(error));
    } finally {
      setIsSaving(false);
    }
  };

  return {
    formData,
    errors,
    isSaving,
    handleChange,
    handleFileChange,
    handleSubmit,
  };
};
