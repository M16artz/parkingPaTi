import React, { useEffect, useState } from 'react';
import { CalendarClock, Save, Tags } from 'lucide-react';
import {
  crearFormularioConfiguracion,
  crearPayloadConfiguracion,
  DIAS,
  limpiarDecimalPositivo,
  limpiarEnteroPositivo,
  validarConfiguracionPorCampo,
} from '../../../utils/ownerConfiguration';

const TARIFAS = [
  ['NORMAL', 'Normal', 'Obligatoria'],
  ['DESCUENTO', 'Descuento', 'Opcional'],
  ['INCREMENTO', 'Incremento', 'Opcional'],
];

const EMPTY_ERRORS = { formulario: '', cantidad_espacios: '', horarios: {}, tarifas: {} };

export const FinalConfigurationForm = ({ data, pending, onSave, operationalOnly = false }) => {
  const [form, setForm] = useState(() => crearFormularioConfiguracion(data));
  const [errors, setErrors] = useState(EMPTY_ERRORS);

  useEffect(() => {
    setForm(crearFormularioConfiguracion(data));
    setErrors(EMPTY_ERRORS);
  }, [data]);

  const changeSchedule = (day, field, value) => {
    setErrors((current) => ({
      ...current,
      formulario: '',
      horarios: { ...current.horarios, [day]: '' },
    }));
    setForm((current) => ({
      ...current,
      horarios: { ...current.horarios, [day]: { ...current.horarios[day], [field]: value } },
    }));
  };
  const changeRate = (code, field, value) => {
    setErrors((current) => ({
      ...current,
      tarifas: { ...current.tarifas, [code]: '' },
    }));
    setForm((current) => {
      const tarifa = { ...current.tarifas[code], [field]: value };
      if (field === 'activa' && !value) tarifa.precio_hora = '';
      return { ...current, tarifas: { ...current.tarifas, [code]: tarifa } };
    });
  };
  const changeQuantity = (value) => {
    setErrors((current) => ({ ...current, cantidad_espacios: '' }));
    setForm((current) => ({ ...current, cantidad_espacios: limpiarEnteroPositivo(value) }));
  };
  const submit = (event) => {
    event.preventDefault();
    const validation = validarConfiguracionPorCampo(form);
    setErrors(validation);
    const hasErrors = validation.formulario
      || validation.cantidad_espacios
      || Object.keys(validation.horarios).length
      || Object.keys(validation.tarifas).length;
    if (!hasErrors) onSave(crearPayloadConfiguracion(form));
  };

  return (
    <form className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" onSubmit={submit} noValidate>
      <div className="border-b border-slate-200 bg-slate-50 p-5">
        <h2 className="text-lg font-bold">{operationalOnly ? 'Horarios y tarifas' : 'Configuración inicial obligatoria'}</h2>
        <p className="mt-1 text-sm text-slate-600">{operationalOnly ? 'Actualiza la atención y las tarifas vigentes.' : 'Completa los tres pasos. Horarios, tarifas y espacios se guardarán juntos.'}</p>
      </div>
      <section className="border-b border-slate-200 p-5">
        <h3 className="flex items-center gap-2 font-bold"><span className="grid h-7 w-7 place-items-center rounded-full bg-sky-100 text-sm text-sky-800">1</span><CalendarClock size={18} /> Horarios de atención</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {DIAS.map(([code, label]) => {
            const schedule = form.horarios[code];
            const dayError = errors.horarios[code];
            return <div className={`rounded-xl border p-3 ${dayError ? 'border-red-400 bg-red-50' : schedule.activo ? 'border-sky-300 bg-sky-50/40' : 'border-slate-200'}`} key={code}>
              <label className="flex min-h-11 items-center gap-2 font-semibold"><input type="checkbox" checked={schedule.activo} onChange={(event) => changeSchedule(code, 'activo', event.target.checked)} /> {label}</label>
              <div className="mt-2 flex items-center gap-2"><input aria-label={`Apertura ${label}`} className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 px-2" type="time" disabled={!schedule.activo} value={schedule.hora_apertura} onChange={(event) => changeSchedule(code, 'hora_apertura', event.target.value)} /><span>a</span><input aria-label={`Cierre ${label}`} className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 px-2" type="time" disabled={!schedule.activo} value={schedule.hora_cierre} onChange={(event) => changeSchedule(code, 'hora_cierre', event.target.value)} /></div>
              {dayError && <p className="mt-2 text-xs font-semibold text-red-700" role="alert">{dayError}</p>}
            </div>;
          })}
        </div>
      </section>
      <section className="border-b border-slate-200 p-5">
        <h3 className="flex items-center gap-2 font-bold"><span className="grid h-7 w-7 place-items-center rounded-full bg-sky-100 text-sm text-sky-800">2</span><Tags size={18} /> Tarifas por hora</h3>
        <p className="mt-1 text-sm text-slate-500">Usa solo números positivos y punto decimal, por ejemplo: 1.50.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {TARIFAS.map(([code, label, help]) => <div className={`rounded-xl border p-4 ${form.tarifas[code].activa ? 'border-sky-300' : 'border-slate-200 bg-slate-50'}`} key={code}>
            <label className="flex min-h-11 items-center justify-between font-semibold">{label}<input type="checkbox" checked={form.tarifas[code].activa} disabled={code === 'NORMAL'} onChange={(event) => changeRate(code, 'activa', event.target.checked)} /></label>
            <p className="text-xs text-slate-500">{help}</p>
            <label className="mt-3 block text-sm font-semibold">Precio por hora<input aria-invalid={Boolean(errors.tarifas[code])} className={`mt-1 h-11 w-full rounded-lg border px-3 ${errors.tarifas[code] ? 'border-red-400 bg-red-50' : 'border-slate-300'}`} type="text" inputMode="decimal" pattern="[0-9]+(\.[0-9]{1,2})?" placeholder="0.00" disabled={!form.tarifas[code].activa} value={form.tarifas[code].precio_hora} onChange={(event) => changeRate(code, 'precio_hora', limpiarDecimalPositivo(event.target.value))} /></label>
            {errors.tarifas[code] && <p className="mt-2 text-xs font-semibold text-red-700" role="alert">{errors.tarifas[code]}</p>}
          </div>)}
        </div>
      </section>
      <div className="flex flex-wrap items-end justify-between gap-4 p-5">
        {!operationalOnly && <label className="text-sm font-semibold"><span className="mb-1 flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-full bg-sky-100 text-sm text-sky-800">3</span>Cantidad de espacios</span><input aria-invalid={Boolean(errors.cantidad_espacios)} className={`block h-11 w-48 rounded-lg border px-3 ${errors.cantidad_espacios ? 'border-red-400 bg-red-50' : 'border-slate-300'}`} type="text" inputMode="numeric" pattern="[0-9]*" disabled={data.configuracion_completa} value={form.cantidad_espacios} onChange={(event) => changeQuantity(event.target.value)} />{errors.cantidad_espacios && <span className="mt-1 block text-xs font-semibold text-red-700" role="alert">{errors.cantidad_espacios}</span>}</label>}
        <button className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-sky-700 px-5 font-bold text-white shadow-sm transition hover:bg-sky-800 disabled:opacity-50" type="submit" disabled={pending}><Save size={18} /> {pending ? 'Guardando...' : data.configuracion_completa ? 'Actualizar configuración' : 'Completar configuración'}</button>
      </div>
      {errors.formulario && <p className="border-t border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{errors.formulario}</p>}
    </form>
  );
};
