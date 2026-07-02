import { useState } from 'react';
import { validarHorarioDia, validarTarifasConfig } from '../utils/validators/ownerConfigGValidator';

export const useOwnerConfigGController = () => {
  const [horarios, setHorarios] = useState({
    lunes:     { inicio: '00:00', fin: '00:00', activo: true, label: 'Lunes' },
    martes:    { inicio: '00:00', fin: '00:00', activo: true, label: 'Martes' },
    miercoles: { inicio: '00:00', fin: '00:00', activo: true, label: 'Miércoles' },
    jueves:    { inicio: '00:00', fin: '00:00', activo: true, label: 'Jueves' },
    viernes:   { inicio: '00:00', fin: '00:00', activo: true, label: 'Viernes' },
    sabado:    { inicio: '00:00', fin: '00:00', activo: true, label: 'Sábado' },
    domingo:   { inicio: '00:00', fin: '00:00', activo: true, label: 'Domingo' }
  });

  // 🌟 Estados para el Horario Maestro de clonación
  const [maestroInicio, setMaestroInicio] = useState('');
  const [maestroFin, setMaestroFin] = useState('');

  const [tarifas, setTarifas] = useState({
    general: '',
    descuento: '',
    grandes: ''
  });

  const [disponibilidad, setDisponibilidad] = useState('ABIERTO');
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleDayChange = (diaKey, campo, valor) => {
    setHorarios(prev => ({
      ...prev,
      [diaKey]: { ...prev[diaKey], [campo]: valor }
    }));
    setErrors(prev => ({ ...prev, [diaKey]: null, formulario: null }));
  };

  // 🌟 Función para aplicar el horario maestro a toda la semana
  const aplicarHorarioATodos = () => {
    if (!maestroInicio || !maestroFin) return;

    setHorarios(prev => {
      const nuevoHorario = { ...prev };
      Object.keys(nuevoHorario).forEach(key => {
        nuevoHorario[key] = {
          ...nuevoHorario[key],
          inicio: maestroInicio,
          fin: maestroFin
        };
      });
      return nuevoHorario;
    });

    // Limpiar errores viejos de rangos de días individuales si existían
    setErrors(prev => {
      const nuevosErrores = { ...prev };
      Object.keys(horarios).forEach(key => delete nuevosErrores[key]);
      return nuevosErrores;
    });
  };

  const handleTarifaChange = (tarifaKey, valor) => {
    setTarifas(prev => ({ ...prev, [tarifaKey]: valor }));
    if (errors[`tarifa_${tarifaKey}`]) {
      setErrors(prev => ({ ...prev, [`tarifa_${tarifaKey}`]: null }));
    }
  };

  const validateConfig = () => {
    let localErrors = {};

    const algunDiaActivo = Object.values(horarios).some(dia => dia.activo);
    if (!algunDiaActivo) {
      localErrors.formulario = "Debes activar y configurar al menos un día de atención para guardar.";
    }

    Object.keys(horarios).forEach((key) => {
      const errorDia = validarHorarioDia(horarios[key]);
      if (errorDia) {
        localErrors[key] = errorDia;
      }
    });

    const erroresTarifas = validarTarifasConfig(tarifas);
    localErrors = { ...localErrors, ...erroresTarifas };

    setErrors(localErrors);
    return Object.keys(localErrors).length === 0;
  };

  const preSubmitCheck = () => {
    if (validateConfig()) {
      setShowConfirmModal(true);
    }
  };

  const executeSubmit = (onSuccess) => {
    setShowConfirmModal(false);
    setIsSaving(true);
    
    const cleanData = { horarios, tarifas, disponibilidad };
    console.log("Guardando Configuración General:", cleanData);
    
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccessModal(true);
      if (onSuccess) onSuccess(cleanData);
    }, 600);
  };

  return {
    horarios,
    tarifas,
    disponibilidad,
    setDisponibilidad,
    errors,
    isSaving,
    handleDayChange,
    handleTarifaChange,
    preSubmitCheck,
    executeSubmit,
    showConfirmModal,
    setShowConfirmModal,
    showSuccessModal,
    setShowSuccessModal,
    // Exports nuevos
    maestroInicio,
    setMaestroInicio,
    maestroFin,
    setMaestroFin,
    aplicarHorarioATodos
  };
};