import React, { useEffect, useState } from 'react';
import { CalendarClock, Save, Tags } from 'lucide-react';
import {
  crearFormularioConfiguracion,
  crearPayloadConfiguracion,
  DIAS,
  validarConfiguracion,
} from '../../../utils/ownerConfiguration';

const TARIFAS = [
  ['NORMAL', 'Normal', 'Obligatoria'],
  ['DESCUENTO', 'Descuento', 'Opcional'],
  ['INCREMENTO', 'Incremento', 'Opcional'],
];

export const FinalConfigurationForm = ({ data, pending, onSave }) => {
  const [form, setForm] = useState(() => crearFormularioConfiguracion(data));
  const [error, setError] = useState('');

  useEffect(() => setForm(crearFormularioConfiguracion(data)), [data]);

  const changeSchedule = (day, field, value) => setForm((current) => ({
    ...current,
    horarios: { ...current.horarios, [day]: { ...current.horarios[day], [field]: value } },
  }));
  const changeRate = (code, field, value) => setForm((current) => ({
    ...current,
    tarifas: { ...current.tarifas, [code]: { ...current.tarifas[code], [field]: value } },
  }));
  const submit = (event) => {
    event.preventDefault();
    const validation = validarConfiguracion(form);
    setError(validation);
    if (!validation) onSave(crearPayloadConfiguracion(form));
  };

  return (
    <form className="border border-slate-200 bg-white" onSubmit={submit}>
      <div className="border-b border-slate-200 p-5">
        <h2 className="text-lg font-bold">Configuración general</h2>
        <p className="mt-1 text-sm text-slate-600">Horarios, tarifas informativas y cantidad inicial se guardan en una sola operación.</p>
      </div>
      <section className="border-b border-slate-200 p-5">
        <h3 className="flex items-center gap-2 font-bold"><CalendarClock size={18} /> Horarios de atención</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {DIAS.map(([code, label]) => {
            const schedule = form.horarios[code];
            return <div className="border border-slate-200 p-3" key={code}>
              <label className="flex min-h-11 items-center gap-2 font-semibold"><input type="checkbox" checked={schedule.activo} onChange={(event) => changeSchedule(code, 'activo', event.target.checked)} /> {label}</label>
              <div className="mt-2 flex items-center gap-2"><input aria-label={`Apertura ${label}`} className="h-10 min-w-0 flex-1 border border-slate-300 px-2" type="time" disabled={!schedule.activo} value={schedule.hora_apertura} onChange={(event) => changeSchedule(code, 'hora_apertura', event.target.value)} /><span>a</span><input aria-label={`Cierre ${label}`} className="h-10 min-w-0 flex-1 border border-slate-300 px-2" type="time" disabled={!schedule.activo} value={schedule.hora_cierre} onChange={(event) => changeSchedule(code, 'hora_cierre', event.target.value)} /></div>
            </div>;
          })}
        </div>
      </section>
      <section className="border-b border-slate-200 p-5">
        <h3 className="flex items-center gap-2 font-bold"><Tags size={18} /> Tarifas por hora</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {TARIFAS.map(([code, label, help]) => <div className="border border-slate-200 p-4" key={code}>
            <label className="flex min-h-11 items-center justify-between font-semibold">{label}<input type="checkbox" checked={form.tarifas[code].activa} disabled={code === 'NORMAL'} onChange={(event) => changeRate(code, 'activa', event.target.checked)} /></label>
            <p className="text-xs text-slate-500">{help}</p>
            <label className="mt-3 block text-sm font-semibold">Precio por hora<input className="mt-1 h-11 w-full border border-slate-300 px-3" type="number" min="0" step="0.01" disabled={!form.tarifas[code].activa} value={form.tarifas[code].precio_hora} onChange={(event) => changeRate(code, 'precio_hora', event.target.value)} /></label>
          </div>)}
        </div>
      </section>
      <div className="flex flex-wrap items-end justify-between gap-4 p-5">
        <label className="text-sm font-semibold">Cantidad de espacios<input className="mt-1 block h-11 w-40 border border-slate-300 px-3" type="number" min="1" max="500" disabled={data.configuracion_completa} value={form.cantidad_espacios} onChange={(event) => setForm((current) => ({ ...current, cantidad_espacios: event.target.value }))} /></label>
        <button className="inline-flex min-h-11 items-center gap-2 bg-sky-700 px-5 font-bold text-white disabled:opacity-50" type="submit" disabled={pending}><Save size={18} /> {pending ? 'Guardando...' : data.configuracion_completa ? 'Actualizar configuración' : 'Completar configuración'}</button>
      </div>
      {error && <p className="border-t border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    </form>
  );
};
