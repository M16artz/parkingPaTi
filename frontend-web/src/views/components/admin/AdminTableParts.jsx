import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ESTILOS = {
  REVISION_PENDIENTE: 'bg-amber-100 text-amber-800',
  RECHAZADO: 'bg-red-100 text-red-800',
  CONFIGURACION_PENDIENTE: 'bg-sky-100 text-sky-800',
  ACTIVO: 'bg-emerald-100 text-emerald-800',
  DESHABILITADO: 'bg-slate-200 text-slate-700',
};

export const EstadoBadge = ({ estado }) => (
  <span className={`inline-flex px-2 py-1 text-xs font-bold ${ESTILOS[estado] || 'bg-slate-100 text-slate-700'}`}>
    {estado?.replaceAll('_', ' ') || 'Sin estado'}
  </span>
);

export const Paginacion = ({ page, count, pageSize = 20, onChange }) => {
  const total = Math.max(1, Math.ceil(count / pageSize));
  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm">
      <span className="text-slate-600">Página {page} de {total} · {count} registros</span>
      <div className="flex gap-2">
        <button className="minimum-touch-target grid place-items-center border border-slate-300 disabled:opacity-40" type="button" aria-label="Página anterior" title="Página anterior" disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft size={18} /></button>
        <button className="minimum-touch-target grid place-items-center border border-slate-300 disabled:opacity-40" type="button" aria-label="Página siguiente" title="Página siguiente" disabled={page >= total} onClick={() => onChange(page + 1)}><ChevronRight size={18} /></button>
      </div>
    </div>
  );
};
