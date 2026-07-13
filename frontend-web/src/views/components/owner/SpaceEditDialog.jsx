import React, { useEffect, useState } from 'react';
import { Save, X } from 'lucide-react';

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
  return <div className="fixed inset-0 z-[1000] grid place-items-center bg-slate-950/45 p-4">
    <section className="w-full max-w-md border border-slate-200 bg-white p-5 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="space-edit-title">
      <div className="flex items-center justify-between"><h2 id="space-edit-title" className="text-lg font-bold">Editar {space.nombre}</h2><button className="minimum-touch-target grid place-items-center" type="button" aria-label="Cerrar" onClick={onClose}><X size={19} /></button></div>
      <label className="mt-5 block text-sm font-semibold">Nombre<input className="mt-1 h-11 w-full border border-slate-300 px-3" maxLength={50} value={form.nombre} onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))} /></label>
      <label className="mt-4 block text-sm font-semibold">Estado<select className="mt-1 h-11 w-full border border-slate-300 bg-white px-3" disabled={occupied} value={form.estado} onChange={(event) => setForm((current) => ({ ...current, estado: event.target.value }))}>{occupied && <option value="OCUPADO">Ocupado</option>}<option value="LIBRE">Libre</option><option value="INHABILITADO">Inhabilitado</option></select></label>
      {occupied && <p className="mt-2 text-xs text-slate-500">El estado ocupado solo cambia mediante una estancia.</p>}
      <label className="mt-4 block text-sm font-semibold">Tarifa predeterminada<select className="mt-1 h-11 w-full border border-slate-300 bg-white px-3" value={form.tarifa_predeterminada} onChange={(event) => setForm((current) => ({ ...current, tarifa_predeterminada: Number(event.target.value) }))}>{rates.filter((rate) => rate.activa).map((rate) => <option key={rate.id} value={rate.id}>{rate.nombre_visible} · ${rate.precio_hora}</option>)}</select></label>
      <div className="mt-6 flex justify-end gap-3"><button className="minimum-touch-target border border-slate-300 px-4 font-semibold" type="button" onClick={onClose}>Cancelar</button><button className="inline-flex min-h-11 items-center gap-2 bg-sky-700 px-4 font-bold text-white disabled:opacity-50" type="button" disabled={pending || !form.nombre.trim()} onClick={() => onSave({ ...form, ...(occupied ? { estado: undefined } : {}) })}><Save size={17} /> Guardar</button></div>
    </section>
  </div>;
};
