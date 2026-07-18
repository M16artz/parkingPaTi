import React from 'react';
import { Check, FileCheck2, MapPinned, UserRound } from 'lucide-react';

export const REGISTER_STEPS = [
  { id: 1, label: 'Cuenta y propietario', icon: UserRound },
  { id: 2, label: 'Parqueadero y ubicación', icon: MapPinned },
  { id: 3, label: 'Documento y envío', icon: FileCheck2 },
];

export const RegisterStepper = ({ step, maxStep, errors, onStep }) => {
  const errorFields = [
    ['nombres', 'apellidos', 'tipoIdentificacion', 'identificacion', 'correo', 'confirmarCorreo', 'password', 'confirmarPassword'],
    ['nombreParqueadero', 'callePrincipal', 'ubicacion'],
    ['archivo'],
  ];

  return <nav aria-label="Progreso del registro">
    <div className="sm:hidden">
      <div className="flex items-center justify-between gap-3 text-sm font-bold text-slate-700">
        <span>Paso {step} de {REGISTER_STEPS.length}</span>
        <span className="text-right text-primary">{REGISTER_STEPS[step - 1].label}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
        <div className="h-full rounded-full bg-primary transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${((step - 1) / (REGISTER_STEPS.length - 1)) * 100}%` }} />
      </div>
    </div>

    <ol className="relative hidden grid-cols-3 sm:grid">
      <span className="absolute left-[16.67%] right-[16.67%] top-6 h-0.5 bg-slate-200" aria-hidden="true" />
      <span className="absolute left-[16.67%] top-6 h-0.5 bg-primary transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${((step - 1) / 2) * 66.66}%` }} aria-hidden="true" />
      {REGISTER_STEPS.map(({ id, label, icon: Icon }, index) => {
        const completed = id < step;
        const active = id === step;
        const hasError = errorFields[index].some((field) => errors[field]);
        return <li key={id} className="relative z-10 flex flex-col items-center text-center">
          <button type="button" disabled={id > maxStep} onClick={() => onStep(id)} aria-current={active ? 'step' : undefined} aria-label={`${label}${completed ? ', completado' : active ? ', activo' : hasError ? ', contiene errores' : ', pendiente'}`} className={`relative grid h-12 w-12 place-items-center rounded-full border-2 transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${completed ? 'border-primary bg-primary text-white shadow-md shadow-sky-200' : active ? 'scale-105 border-primary bg-white text-primary shadow-lg ring-4 ring-sky-100' : hasError ? 'border-red-400 bg-slate-100 text-slate-500' : 'border-slate-300 bg-slate-100 text-slate-400'} disabled:cursor-not-allowed`}>
            {completed ? <Check aria-hidden="true" size={18} /> : <Icon aria-hidden="true" size={18} />}
            {hasError && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-red-500" aria-hidden="true" />}
          </button>
          <span className={`mt-2 max-w-40 text-xs font-bold lg:text-sm ${active ? 'text-primary' : hasError ? 'text-red-700' : 'text-slate-600'}`}>{id}. {label}</span>
        </li>;
      })}
    </ol>
  </nav>;
};
