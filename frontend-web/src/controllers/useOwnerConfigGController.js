import { useState, useEffect } from 'react';
import { validarHorarioDia, validarTarifasConfig } from '../utils/validators/ownerConfigGValidator';
import { parqueaderoService } from '../services/parqueaderoService';
import { horarioService } from '../services/horarioService';
import { tarifaService } from '../services/tarifaService';
import { extraerErroresApi } from '../utils/apiError';

// Antes: no existía ningún estado ni llamada de red aquí. executeSubmit()
// hacía console.log(cleanData) + setTimeout(600ms) simulando un guardado.
//
// Mapeo de claves de día (frontend, minúsculas con tilde en el label) al
// enum real DiasSemana del backend (mayúsculas sin tilde).
const DIA_BACKEND = {
  lunes: 'LUNES',
  martes: 'MARTES',
  miercoles: 'MIERCOLES',
  jueves: 'JUEVES',
  viernes: 'VIERNES',
  sabado: 'SABADO',
  domingo: 'DOMINGO',
};

const diaKeyDesdeBackend = (diaBackend) =>
  Object.keys(DIA_BACKEND).find((key) => DIA_BACKEND[key] === diaBackend);

export const useOwnerConfigGController = () => {
  const [parqueaderoId, setParqueaderoId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [horarios, setHorarios] = useState({
    lunes: { inicio: '00:00', fin: '00:00', activo: false, label: 'Lunes' },
    martes: { inicio: '00:00', fin: '00:00', activo: false, label: 'Martes' },
    miercoles: { inicio: '00:00', fin: '00:00', activo: false, label: 'Miércoles' },
    jueves: { inicio: '00:00', fin: '00:00', activo: false, label: 'Jueves' },
    viernes: { inicio: '00:00', fin: '00:00', activo: false, label: 'Viernes' },
    sabado: { inicio: '00:00', fin: '00:00', activo: false, label: 'Sábado' },
    domingo: { inicio: '00:00', fin: '00:00', activo: false, label: 'Domingo' },
  });
  // id de HorarioAtencion existente en el backend por día (o null si aún
  // no hay registro para ese día). Necesario para saber si al guardar hay
  // que crear, actualizar o borrar.
  const [horarioIds, setHorarioIds] = useState({});

  const [maestroInicio, setMaestroInicio] = useState('');
  const [maestroFin, setMaestroFin] = useState('');

  const [tarifas, setTarifas] = useState({
    general: '',
    descuento: '',
    grandes: '',
  });
  // IDs de CategoriaTarifa existentes por cada campo de la UI.
  const [categoriaIds, setCategoriaIds] = useState({ general: null, descuento: null, grandes: null });

  const [disponibilidad, setDisponibilidad] = useState('ABIERTO');
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- Carga inicial: parqueadero propio + sus horarios/tarifa --------
  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Requiere el patch de backend: GET /api/parqueaderos/mios/
        // (ver apps/parqueaderos/controllers_patch.py + services_patch.py)
        const propios = await parqueaderoService.obtenerMios();
        const parqueadero = propios[0];

        if (!parqueadero) {
          if (!cancelado) {
            setLoadError('Aún no tienes un parqueadero registrado.');
            setIsLoading(false);
          }
          return;
        }
        if (cancelado) return;

        setParqueaderoId(parqueadero.id);
        setDisponibilidad(parqueadero.disponibilidad);

        const [horariosResp, categorias] = await Promise.all([
          horarioService.listarPorParqueadero(parqueadero.id),
          tarifaService.obtenerCategoriasPorParqueadero(parqueadero.id),
        ]);

        if (cancelado) return;

        const listaHorarios = horariosResp.results ?? horariosResp;
        const nuevosHorarios = { ...horarios };
        const nuevosIds = {};
        listaHorarios.forEach((h) => {
          const key = diaKeyDesdeBackend(h.dia);
          if (!key) return;
          nuevosHorarios[key] = {
            ...nuevosHorarios[key],
            inicio: h.hora_apertura.slice(0, 5),
            fin: h.hora_cierre.slice(0, 5),
            activo: true,
          };
          nuevosIds[key] = h.id;
        });
        setHorarios(nuevosHorarios);
        setHorarioIds(nuevosIds);

        setCategoriaIds({
          general: categorias.general?.id ?? null,
          descuento: categorias.descuento?.id ?? null,
          grandes: categorias.grandes?.id ?? null,
        });
        setTarifas({
          general: categorias.general ? String(categorias.general.precio_hora) : '',
          descuento: categorias.descuento ? String(categorias.descuento.precio_hora) : '',
          grandes: categorias.grandes ? String(categorias.grandes.precio_hora) : '',
        });
      } catch (error) {
        if (!cancelado) setLoadError(extraerErroresApi(error).formulario ?? 'No se pudo cargar la configuración.');
      } finally {
        if (!cancelado) setIsLoading(false);
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDayChange = (diaKey, campo, valor) => {
    setHorarios(prev => ({
      ...prev,
      [diaKey]: { ...prev[diaKey], [campo]: valor }
    }));
    setErrors(prev => ({ ...prev, [diaKey]: null, formulario: null }));
  };

  const aplicarHorarioATodos = () => {
    if (!maestroInicio || !maestroFin) return;

    setHorarios(prev => {
      const nuevoHorario = { ...prev };
      Object.keys(nuevoHorario).forEach(key => {
        nuevoHorario[key] = { ...nuevoHorario[key], inicio: maestroInicio, fin: maestroFin };
      });
      return nuevoHorario;
    });

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
      if (errorDia) localErrors[key] = errorDia;
    });

    const erroresTarifas = validarTarifasConfig(tarifas);
    localErrors = { ...localErrors, ...erroresTarifas };

    setErrors(localErrors);
    return Object.keys(localErrors).length === 0;
  };

  const preSubmitCheck = () => {
    if (validateConfig()) setShowConfirmModal(true);
  };

  // executeSubmit sincroniza horarios, categorias de tarifa y disponibilidad.
  const executeSubmit = async (onSuccess) => {
    setShowConfirmModal(false);

    if (!parqueaderoId) {
      setErrors({ formulario: 'No se encontró tu parqueadero. Recarga la página.' });
      return;
    }

    setIsSaving(true);
    try {
      await Promise.all(
        Object.entries(horarios).map(([key, dia]) => {
          const idExistente = horarioIds[key];
          if (dia.activo) {
            return idExistente
              ? horarioService.actualizar(idExistente, dia.inicio, dia.fin)
              : horarioService.crear(parqueaderoId, DIA_BACKEND[key], dia.inicio, dia.fin);
          }
          // Día desactivado: si existía en el backend, se borra.
          return idExistente ? horarioService.eliminar(idExistente) : Promise.resolve();
        })
      );

      const categoriasGuardadas = await Promise.all(
        Object.entries(tarifas)
          .filter(([, valor]) => valor !== '')
          .map(async ([claveUi, valor]) => {
            const categoria = await tarifaService.guardarCategoria(parqueaderoId, claveUi, Number(valor));
            return [claveUi, categoria.id];
          })
      );
      if (categoriasGuardadas.length) {
        setCategoriaIds((prev) => ({ ...prev, ...Object.fromEntries(categoriasGuardadas) }));
      }

      await parqueaderoService.actualizar(parqueaderoId, { disponibilidad });

      setIsSaving(false);
      setShowSuccessModal(true);
      if (onSuccess) onSuccess({ horarios, tarifas, disponibilidad });
    } catch (error) {
      setIsSaving(false);
      setErrors(extraerErroresApi(error));
    }
  };

  return {
    isLoading,
    loadError,
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
    maestroInicio,
    setMaestroInicio,
    maestroFin,
    setMaestroFin,
    aplicarHorarioATodos,
  };
};
