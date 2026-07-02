import { useState } from 'react';

export const useRegisterController = () => {
  // 1. ESTRUCTURA COMPLETA DEL ESTADO DEL FORMULARIO
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
    archivoDocumento: null
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // 2. MANEJADOR DE CAMBIOS CON FILTRO EN TIEMPO REAL
  const handleChange = (e) => {
    const { name, value } = e.target;

    //  FILTRO EN TIEMPO REAL PARA EL NÚMERO DE DOCUMENTO
    if (name === 'identificacion') {
      let valorLimpio = value;

      // Evaluamos según el tipo de identificación seleccionado
      if (formData.tipoIdentificacion === 'CEDULA' || formData.tipoIdentificacion === 'RUC') {
        // Bloqueo estricto: Elimina letras, guiones, espacios y signos negativos
        valorLimpio = value.replace(/[^0-9]/g, '');
        
        // Candado opcional de longitud máxima para Ecuador (Cédula 10 dígitos, RUC 13)
        const maximoDigitos = formData.tipoIdentificacion === 'CEDULA' ? 10 : 13;
        valorLimpio = valorLimpio.slice(0, maximoDigitos);

      } else if (formData.tipoIdentificacion === 'PASAPORTE') {
        // Bloqueo Pasaporte: Alfanumérico sin caracteres especiales ni signos negativos
        valorLimpio = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      }

      setFormData((prev) => ({ ...prev, [name]: valorLimpio }));

    } else {
      // Procesamiento normal para todos los demás campos
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Limpiamos los errores visuales del campo actual mientras el usuario escribe
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // 3. MANEJADOR PARA CARGA DE ARCHIVOS / DOCUMENTACIÓN
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, archivoDocumento: file }));
      
      if (errors.archivoDocumento) {
        setErrors((prev) => ({ ...prev, archivoDocumento: null }));
      }
    }
  };

  // 4. ENVÍO FINAL DE LOS DATOS A LA API
  const handleSubmit = async (e, onSuccess) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      console.log("Enviando toda la información del registro a la API...", formData);
      
      // Simulación de retraso de respuesta del servidor (Sustituir por Axios / Fetch / Firebase)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Si la petición fue exitosa, disparamos el callback de la vista para mostrar el modal de éxito
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error al procesar el registro en el servidor:", error);
      setErrors((prev) => ({ ...prev, formulario: "Ocurrió un error inesperado al procesar el registro." }));
    } finally {
      setIsSaving(false);
    }
  };

  // 5. RETORNO DE PROPIEDADES Y FUNCIONES (Sincronizado con la Vista)
  return {
    formData,
    errors,
    isSaving,
    handleChange,
    handleFileChange, 
    handleSubmit
  };
};