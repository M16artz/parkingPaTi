import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Car, Clock3, Grid3X3, X } from 'lucide-react';
import {
  SPACE_STATUS,
  formatearMoneda,
  resumirEspaciosPublicos,
} from '../../../utils/publicParkings';

export const ParkingSpacesModal = ({ parking, returnFocusElement, onClose }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const focusable = () => [...dialog.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')];
    focusable()[0]?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        const items = focusable();
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      returnFocusElement?.focus?.();
    };
  }, [onClose, returnFocusElement]);

  const summary = resumirEspaciosPublicos(parking);
  return createPortal(<div className="fixed inset-0 z-[2000] grid place-items-center overflow-y-auto bg-slate-950/55 p-3 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="spaces-dialog-title" aria-describedby="spaces-dialog-description" className="my-auto w-full max-w-4xl overflow-hidden rounded-[1.75rem] border border-white/30 bg-white shadow-2xl motion-safe:animate-[owner-view-enter_180ms_ease-out]">
      <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6"><div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-800"><Grid3X3 aria-hidden="true" /></span><div><h2 id="spaces-dialog-title" className="text-lg font-black text-slate-950">Disponibilidad de espacios</h2><p id="spaces-dialog-description" className="mt-1 text-sm text-slate-600">Estado actual de los espacios de {parking.name}</p></div></div><button type="button" onClick={onClose} aria-label="Cerrar disponibilidad de espacios" className="grid min-h-11 min-w-11 place-items-center rounded-xl text-slate-500 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"><X aria-hidden="true" /></button></header>
      <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-4">{[['FREE', summary.free], ['OCCUPIED', summary.occupied], ['DISABLED', summary.disabled]].map(([status, value]) => <div key={status} className="rounded-xl border border-slate-200 p-3"><p className="flex items-center gap-2 text-xs text-slate-500"><span aria-hidden="true" className="h-2.5 w-2.5 rounded" style={{ backgroundColor: SPACE_STATUS[status].color }} />{SPACE_STATUS[status].label}</p><p className="mt-1 text-xl font-black text-slate-950">{value}</p></div>)}<div className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-slate-500">Total</p><p className="mt-1 text-xl font-black text-slate-950">{summary.total}</p></div></div>
        <div className="mt-4 flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold">{Object.entries(SPACE_STATUS).map(([key, meta]) => <span key={key} className="flex items-center gap-2"><span aria-hidden="true" className="h-3 w-3 rounded" style={{ backgroundColor: meta.color }} />{meta.label}</span>)}</div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">{parking.spaces.map((space) => {
          const meta = SPACE_STATUS[space.status] ?? SPACE_STATUS.DISABLED;
          return <article key={space.id} className="min-h-32 rounded-2xl border-2 bg-white p-3 shadow-sm" style={{ borderColor: meta.color }} aria-label={`${space.name}, ${meta.label}, ${space.rate_name ?? 'sin tarifa'}`}>
            <div className="flex items-start justify-between gap-2"><Car aria-hidden="true" size={18} style={{ color: meta.color }} /><strong className="text-lg text-slate-950">{space.name}</strong></div>
            <p className="mt-3 text-xs font-black uppercase tracking-wide" style={{ color: meta.color }}>{meta.label}</p>
            <p className="mt-2 text-xs text-slate-600">{space.rate_name ?? 'Tarifa no configurada'}</p>
            <p className="mt-1 text-sm font-black text-slate-900">{space.price_per_hour == null ? 'Precio no configurado' : `${formatearMoneda(space.price_per_hour)}/h`}</p>
          </article>;
        })}</div>
        <div className="mt-5 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900"><Clock3 aria-hidden="true" className="mt-0.5 shrink-0" size={16} /><p>Actualizado {new Date(parking.updated_at).toLocaleTimeString('es-EC')}. La disponibilidad puede cambiar antes de tu llegada.</p></div>
      </div>
      <footer className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6"><button type="button" onClick={onClose} className="min-h-11 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700">Cerrar</button></footer>
    </section>
  </div>, document.body);
};
