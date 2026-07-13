import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  pending = false,
  disabled = false,
  danger = false,
  children,
  onCancel,
  onConfirm,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-slate-950/45 p-4" role="presentation">
      <section
        aria-labelledby="confirm-title"
        aria-modal="true"
        className="w-full max-w-md border border-slate-200 bg-white p-6 shadow-xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <AlertTriangle className={danger ? 'text-red-600' : 'text-amber-600'} aria-hidden="true" />
          <button className="minimum-touch-target grid place-items-center text-slate-500" type="button" onClick={onCancel} aria-label="Cerrar confirmación">
            <X size={20} />
          </button>
        </div>
        <h2 id="confirm-title" className="mt-3 text-xl font-bold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-6 flex justify-end gap-3">
          <button className="minimum-touch-target border border-slate-300 px-4 font-semibold text-slate-700" type="button" onClick={onCancel} disabled={pending}>Cancelar</button>
          <button
            className={`minimum-touch-target px-4 font-semibold text-white ${danger ? 'bg-red-600' : 'bg-sky-700'}`}
            type="button"
            onClick={onConfirm}
            disabled={disabled || pending}
          >
            {pending ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
};
