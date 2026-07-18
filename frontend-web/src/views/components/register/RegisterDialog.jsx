import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const RegisterDialog = ({ open, title, children, actions, onClose, closeable = true }) => {
  const panelRef = useRef(null);
  const returnFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    returnFocusRef.current = document.activeElement;
    const panel = panelRef.current;
    panel?.querySelector('button')?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && closeable) onClose();
      if (event.key !== 'Tab') return;
      const focusable = [...panel.querySelectorAll('button, a, input, [tabindex]:not([tabindex="-1"])')].filter((element) => !element.disabled);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('keydown', onKeyDown); returnFocusRef.current?.focus?.(); };
  }, [closeable, onClose, open]);

  if (!open) return null;
  return createPortal(<div className="fixed inset-0 z-[999999] grid place-items-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => closeable && event.target === event.currentTarget && onClose()}>
    <section ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="register-dialog-title" className="my-auto w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <h2 id="register-dialog-title" className="text-2xl font-black text-slate-900">{title}</h2>
        {closeable && <button type="button" onClick={onClose} aria-label="Cerrar diálogo" className="grid min-h-10 min-w-10 place-items-center rounded-full text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><X aria-hidden="true" size={20} /></button>}
      </div>
      <div className="mt-4 text-sm leading-6 text-slate-600">{children}</div>
      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{actions}</div>
    </section>
  </div>, document.body);
};
