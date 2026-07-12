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
  // id de la EstrategiaTarifa (normal) existente, o null si aún no hay una.
  const [tarifaId, setTarifaId] = useState(null);

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

        const [horariosResp, tarifaNormal] = await Promise.all([
          horarioService.listarPorParqueadero(parqueadero.id),
          tarifaService.obtenerNormalPorParqueadero(parqueadero.id),
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

        if (tarifaNormal) {
          setTarifaId(tarifaNormal.id);
          setTarifas((prev) => ({ ...prev, general: String(tarifaNormal.precio_hora) }));
        }
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

  // executeSubmit ahora hace 3 cosas de verdad contra el backend:
  //  1. Sincroniza horarios (crea/actualiza/borra por día, porque cada
  //     día es un registro independiente en el backend).
  //  2. Crea o actualiza la tarifa NORMAL (precio_hora) - es la única de
  //     las 3 tarifas de la UI que tiene un endpoint 1:1 hoy. "descuento"
  //     y "grandes" quedan solo en el estado local: el modelo actual solo
  //     permite UNA estrategia de tarifa por parqueadero (normal, o
  //     incremento %, o descuento %; no las tres al mismo tiempo). Ver el
  //     informe para las opciones de rediseño de este punto.
  //  3. Actualiza disponibilidad del parqueadero si cambió (nota: el
  //     backend también la recalcula solo cuando cambian espacios; esto
  //     es la anulación manual del propietario).
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

      if (tarifas.general !== '') {
        const precio = Number(tarifas.general);
        if (tarifaId) {
          await tarifaService.actualizarNormal(tarifaId, precio);
        } else {
          const creada = await tarifaService.crearNormal(parqueaderoId, precio);
          setTarifaId(creada.id);
        }
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
