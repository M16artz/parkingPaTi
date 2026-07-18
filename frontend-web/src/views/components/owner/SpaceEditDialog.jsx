import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Pencil, Save, X } from 'lucide-react';

export const SpaceEditDialog = ({ space, rates, pending, onClose, onSave }) => {
  const [form, setForm] = useState({ nombre: '', estado: 'LIBRE', tarifa_predeterminada: '' });
  useEffect(() => {
    if (space) setForm({
      nombre: space.nombre,
      estado: space.estado,
      tarifa_predeterminada: space.tarifa_predeterminada || '',
    });
  }, [space]);
  if (!space) return null;
  const occupied = space.estado === 'OCUPADO';

  return createPortal(<div className="fixed inset-0 z-[1000] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
    <section className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="space-edit-title">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-5">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-100 text-sky-700"><Pencil size={19} /></span><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Configuración</p><h2 id="space-edit-title" className="text-lg font-black text-slate-900">Editar {space.nombre}</h2></div></div>
        <button className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-200 hover:text-slate-800" type="button" aria-label="Cerrar" onClick={onClose}><X size={20} /></button>
      </div>
      <div className="p-6">
        <label className="block text-sm font-bold text-slate-700">Nombre<input className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" maxLength={50} value={form.nombre} onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))} /></label>
        <label className="mt-4 block text-sm font-bold text-slate-700">Estado<select className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" disabled={occupied} value={form.estado} onChange={(event) => setForm((current) => ({ ...current, estado: event.target.value }))}>{occupied && <option value="OCUPADO">Ocupado</option>}<option value="LIBRE">Libre</option><option value="INHABILITADO">Inhabilitado</option></select></label>
        {occupied && <p className="mt-2 rounded-lg bg-teal-50 p-2 text-xs font-semibold text-teal-800">El estado ocupado solo cambia mediante una estancia.</p>}
        <label className="mt-4 block text-sm font-bold text-slate-700">Tarifa predeterminada<select className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" value={form.tarifa_predeterminada} onChange={(event) => setForm((current) => ({ ...current, tarifa_predeterminada: Number(event.target.value) }))}>{rates.filter((rate) => rate.activa).map((rate) => <option key={rate.id} value={rate.id}>{rate.nombre_visible} · ${rate.precio_hora}</option>)}</select></label>
        <div className="mt-6 flex justify-end gap-3"><button className="min-h-11 rounded-xl border border-slate-300 px-4 font-bold text-slate-600 transition hover:bg-slate-50" type="button" onClick={onClose}>Cancelar</button><button className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-sky-700 px-5 font-bold text-white shadow-md shadow-sky-200 transition hover:bg-sky-800 disabled:opacity-50" type="button" disabled={pending || !form.nombre.trim()} onClick={() => onSave({ ...form, ...(occupied ? { estado: undefined } : {}) })}><Save size={17} /> Guardar cambios</button></div>
      </div>
    </section>
  </div>, document.body);
};
