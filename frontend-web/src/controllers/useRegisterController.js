import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { extraerErroresApi } from '../utils/apiError';
import { REGISTER_DRAFT_KEY, sanitizarBorradorRegistro } from '../utils/registerDraft';
import { validateParkingRegistration, validateRegister, validateRegistrationDocument } from '../utils/validators/authValidator';

export { REGISTER_DRAFT_KEY, sanitizarBorradorRegistro } from '../utils/registerDraft';
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;
const INITIAL_FORM = {
  nombres: '', apellidos: '', tipoIdentificacion: '', identificacion: '', correo: '', confirmarCorreo: '',
  password: '', confirmarPassword: '', nombreParqueadero: '', descripcion: '', callePrincipal: '',
  calleSecundaria: '', numeroLote: '', latitud: '', longitud: '',
};
const leerBorrador = () => {
  try {
    const raw = globalThis.sessionStorage?.getItem(REGISTER_DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (!draft.savedAt || Date.now() - draft.savedAt > DRAFT_TTL_MS) {
      globalThis.sessionStorage?.removeItem(REGISTER_DRAFT_KEY);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
};

const focusFirstError = (errors) => {
  const first = Object.keys(errors)[0];
  if (!first) return;
  globalThis.setTimeout(() => {
    const alert = globalThis.document?.querySelector('[data-register-alert]');
    alert?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    const element = globalThis.document?.querySelector(`[name="${first}"]`);
    if (!element) return;
    element.focus?.({ preventScroll: true });
  }, 0);
};

const scrollToRegisterAlert = () => globalThis.setTimeout(() => {
  globalThis.document?.querySelector('[data-register-alert]')?.scrollIntoView?.({
    behavior: 'smooth', block: 'start',
  });
}, 0);

export const useRegisterController = () => {
  const [draft] = useState(leerBorrador);
  const [formData, setFormData] = useState(() => ({ ...INITIAL_FORM, ...(draft?.data || {}) }));
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(() => Math.min(Math.max(Number(draft?.step) || 1, 1), 3));
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [locationError, setLocationError] = useState('');
  const [recovered, setRecovered] = useState(Boolean(draft));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [success, setSuccess] = useState(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [validatedEmail, setValidatedEmail] = useState('');
  const mutation = useMutation({ mutationFn: () => authService.registerComplete(formData, file) });

  useEffect(() => {
    if (success) return;
    const hasProgress = Object.values(sanitizarBorradorRegistro(formData)).some(Boolean);
    if (!hasProgress) return;
    globalThis.sessionStorage?.setItem(REGISTER_DRAFT_KEY, JSON.stringify({
      savedAt: Date.now(), step, data: sanitizarBorradorRegistro(formData),
    }));
  }, [formData, step, success]);

  const handleChange = ({ target: { name, value } }) => {
    let next = value;
    if (name === 'identificacion') {
      next = formData.tipoIdentificacion === 'PASAPORTE'
        ? value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 15)
        : value.replace(/\D/g, '').slice(0, formData.tipoIdentificacion === 'RUC' ? 13 : 10);
    }
    const nextData = { ...formData, [name]: next };
    setFormData(nextData);
    if (name === 'correo' || name === 'confirmarCorreo') {
      setValidatedEmail('');
      setMaxStep(1);
    }
    setErrors((current) => ({
      ...current,
      [name]: null,
      ...(name === 'tipoIdentificacion' ? { identificacion: null } : {}),
      ...(['correo', 'confirmarCorreo'].includes(name) && nextData.confirmarCorreo ? {
        confirmarCorreo: nextData.correo.trim().toLowerCase() === nextData.confirmarCorreo.trim().toLowerCase()
          ? null : 'Los correos electrónicos no coinciden.',
      } : {}),
      ...(['password', 'confirmarPassword'].includes(name) && nextData.confirmarPassword ? {
        confirmarPassword: nextData.password === nextData.confirmarPassword ? null : 'Las contraseñas no coinciden.',
      } : {}),
      formulario: null,
    }));
  };

  const validateStep = (targetStep) => {
    let validation = { isValid: true, errors: {} };
    if (targetStep === 1) validation = validateRegister(formData);
    if (targetStep === 2) validation = validateParkingRegistration(formData);
    if (targetStep === 3) validation = validateRegistrationDocument(file);
    if (!validation.isValid) {
      setErrors((current) => ({ ...current, ...validation.errors, formulario: 'Revisa los campos marcados antes de continuar.' }));
      focusFirstError(validation.errors);
    }
    return validation.isValid;
  };

  const ensureEmailAvailable = async () => {
    const normalizedEmail = formData.correo.trim().toLowerCase();
    if (validatedEmail === normalizedEmail) return true;
    setIsCheckingEmail(true);
    try {
      const result = await authService.checkEmailAvailability(normalizedEmail);
      if (!result.disponible) {
        const message = 'Este correo electrónico ya está registrado. Inicia sesión o utiliza otro correo.';
        setErrors((current) => ({ ...current, correo: message, formulario: message }));
        focusFirstError({ correo: message });
        return false;
      }
      setValidatedEmail(normalizedEmail);
      return true;
    } catch (error) {
      const apiErrors = extraerErroresApi(error);
      setErrors((current) => ({
        ...current,
        ...apiErrors,
        formulario: apiErrors.formulario || 'No pudimos verificar el correo. Intenta nuevamente.',
      }));
      scrollToRegisterAlert();
      return false;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const continueStep = async (event) => {
    event?.preventDefault();
    if (!validateStep(step)) return;
    if (step === 1 && !(await ensureEmailAvailable())) return;
    const next = Math.min(step + 1, 3);
    setErrors({});
    setStep(next);
    setMaxStep((current) => Math.max(current, next));
  };

  const requestSubmit = async (event) => {
    event?.preventDefault();
    if (!validateStep(1)) { setStep(1); return; }
    if (!(await ensureEmailAvailable())) { setStep(1); return; }
    if (!validateStep(2)) { setStep(2); return; }
    if (!validateStep(3)) { setStep(3); return; }
    setConfirmOpen(true);
  };

  const confirmSubmit = async () => {
    if (mutation.isPending) return;
    setErrors({});
    try {
      const result = await mutation.mutateAsync();
      setConfirmOpen(false);
      setSuccess({
        detail: result.detail,
        correo: formData.correo,
        parqueadero: formData.nombreParqueadero,
      });
      globalThis.sessionStorage?.removeItem(REGISTER_DRAFT_KEY);
      setFormData(INITIAL_FORM);
      setFile(null);
      setStep(1);
      setMaxStep(1);
      setRecovered(false);
    } catch (error) {
      const apiErrors = extraerErroresApi(error);
      setErrors({
        ...apiErrors,
        nombres: apiErrors.nombres || apiErrors.nombre,
        apellidos: apiErrors.apellidos || apiErrors.apellido,
        tipoIdentificacion: apiErrors.tipoIdentificacion || apiErrors.tipo_identificacion,
        nombreParqueadero: apiErrors.nombreParqueadero || apiErrors.nombre_parqueadero,
        callePrincipal: apiErrors.callePrincipal || apiErrors.calle_principal,
        archivo: apiErrors.archivo,
      });
      setConfirmOpen(false);
      scrollToRegisterAlert();
    }
  };

  const discardDraft = () => {
    globalThis.sessionStorage?.removeItem(REGISTER_DRAFT_KEY);
    setFormData(INITIAL_FORM);
    setFile(null);
    setErrors({});
    setLocationError('');
    setStep(1);
    setMaxStep(1);
    setRecovered(false);
  };

  return {
    formData, step, maxStep, file, errors, locationError, recovered, confirmOpen, success,
    isSaving: mutation.isPending || isCheckingEmail, isCheckingEmail, handleChange, continueStep, requestSubmit, confirmSubmit,
    closeConfirm: () => setConfirmOpen(false), previousStep: () => setStep((current) => Math.max(1, current - 1)),
    goToStep: (next) => { if (next <= maxStep) { setErrors({}); setStep(next); } },
    setLocation: (latitud, longitud) => { setFormData((current) => ({ ...current, latitud, longitud })); setErrors((current) => ({ ...current, ubicacion: null })); setLocationError(''); },
    rejectLocation: () => setLocationError('El prototipo admite ubicaciones dentro de Loja. Conservamos tu selección anterior.'),
    handleFile: (nextFile) => {
      setFile(nextFile);
      const validation = nextFile ? validateRegistrationDocument(nextFile) : { isValid: true, errors: {} };
      setErrors((current) => ({ ...current, archivo: validation.errors.archivo || null, formulario: null }));
    },
    discardDraft,
  };
};
