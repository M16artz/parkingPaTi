import React, { useEffect, useState } from 'react';
import { Clock, DollarSign, Save, Copy, Car } from 'lucide-react';
import {
  aplicarHorarioRapido,
  crearFormularioConfiguracion,
  crearPayloadConfiguracion,
  DIAS,
  limpiarDecimalPositivo,
  limpiarEnteroPositivo,
  validarConfiguracionPorCampo,
} from '../../../utils/ownerConfiguration';

const TARIFAS = [
  ['NORMAL', 'Estándar / Normal', 'Tarifa base por hora para vehículos livianos.'],
  ['DESCUENTO', 'Preferencial', 'Aplica para motos, discapacidad o convenios.'],
  ['INCREMENTO', 'Vehículos Pesados', 'Aplica para camionetas, camiones o vans.'],
];

const EMPTY_ERRORS = { formulario: '', cantidad_espacios: '', horarios: {}, tarifas: {} };

export const FinalConfigurationForm = ({ 
  data = {}, 
  pending = false, 
  onSave = () => {}, 
  operationalOnly = false, 
  children 
}) => {
  const [form, setForm] = useState(() => crearFormularioConfiguracion(data));
  const [errors, setErrors] = useState(EMPTY_ERRORS);

  // Estado para el Horario Rápido
  const [quickTime, setQuickTime] = useState({
    hora_apertura: '08:00',
    hora_cierre: '18:00',
  });

  useEffect(() => {
    setForm(crearFormularioConfiguracion(data));
    setErrors(EMPTY_ERRORS);
  }, [data]);

  // Aplicar el Horario Rápido y activar todos los días de la semana.
  const handleApplyQuickTime = () => {
    setErrors((current) => ({ ...current, formulario: '', horarios: {} }));
    setForm((current) => ({
      ...current,
      horarios: aplicarHorarioRapido(current.horarios, quickTime),
    }));
  };

  const changeSchedule = (day, field, value) => {
    setErrors((current) => ({
      ...current,
      formulario: '',
      horarios: { ...current.horarios, [day]: '' },
    }));
    setForm((current) => ({
      ...current,
      horarios: { 
        ...current.horarios, 
        [day]: { ...current.horarios[day], [field]: value } 
      },
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

    const hasErrors =
      validation.formulario ||
      validation.cantidad_espacios ||
      Object.keys(validation.horarios || {}).length ||
      Object.keys(validation.tarifas || {}).length;

    if (!hasErrors) {
      onSave(crearPayloadConfiguracion(form));
    }
  };

  return (
    <form className="space-y-6 font-sans select-none" onSubmit={submit} noValidate>
      
      {/* ------------------------------------------------------------- */}
      {/* SECCIÓN 1: HORARIOS DE OPERACIÓN                              */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-[#e2f2fe] rounded-[28px] p-6 sm:p-8 shadow-sm border border-blue-100/60">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Clock className="text-blue-600 w-5 h-5" />
            <h2 className="text-base font-black tracking-wider text-slate-800 uppercase font-headline">
              HORARIOS DE OPERACIÓN <span className="text-rose-500">*</span>
            </h2>
          </div>

          {/* Widget Horario Rápido */}
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-2xl flex items-center gap-2.5 shadow-sm border border-white">
            <span className="text-[11px] font-black text-slate-400 tracking-wider uppercase">
              HORARIO RÁPIDO:
            </span>

            <input
              type="time"
              value={quickTime.hora_apertura}
              onChange={(e) => setQuickTime((prev) => ({ ...prev, hora_apertura: e.target.value }))}
              className="h-8 rounded-xl border border-slate-200 bg-slate-50 px-2 text-xs font-extrabold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
            />

            <span className="text-xs font-bold text-slate-400 px-0.5">a</span>

            <input
              type="time"
              value={quickTime.hora_cierre}
              onChange={(e) => setQuickTime((prev) => ({ ...prev, hora_cierre: e.target.value }))}
              className="h-8 rounded-xl border border-slate-200 bg-slate-50 px-2 text-xs font-extrabold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
            />

            <button
              type="button"
              onClick={handleApplyQuickTime}
              className="bg-slate-200/80 hover:bg-blue-600 hover:text-white text-slate-600 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ml-1"
            >
              <Copy size={13} />
              Aplicar a todos
            </button>
          </div>
        </div>

        {/* Tarjetas Blancas para Días */}
        <div className="flex flex-col gap-3">
          {(DIAS || []).map(([code, label]) => {
            const schedule = form.horarios?.[code] || { activo: false, hora_apertura: '08:00', hora_cierre: '18:00' };
            const dayError = errors.horarios?.[code];
            return (
              <div key={code} className="flex flex-col gap-1">
                <div
                  className={`bg-white rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between shadow-sm border transition-all gap-3 ${
                    dayError
                      ? 'border-red-400 bg-red-50/30'
                      : schedule.activo
                      ? 'border-slate-50 hover:shadow-md'
                      : 'border-slate-100 bg-slate-50/50 opacity-60'
                  }`}
                >
                  {/* Checkbox y Nombre del día */}
                  <label className="flex items-center gap-3.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={schedule.activo}
                      onChange={(event) => changeSchedule(code, 'activo', event.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                    />
                    <span
                      className={`text-base font-extrabold ${
                        schedule.activo ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {label}
                    </span>
                  </label>

                  {/* Input Selector de Horas */}
                  {schedule.activo ? (
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500">
                      <input
                        aria-label={`Apertura ${label}`}
                        type="time"
                        value={schedule.hora_apertura}
                        onChange={(event) => changeSchedule(code, 'hora_apertura', event.target.value)}
                        className="h-9 rounded-xl border border-slate-200 bg-slate-50/80 px-3 font-bold text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none cursor-pointer"
                      />

                      <span className="text-xs font-bold text-slate-400 px-1">hasta las</span>

                      <input
                        aria-label={`Cierre ${label}`}
                        type="time"
                        value={schedule.hora_cierre}
                        onChange={(event) => changeSchedule(code, 'hora_cierre', event.target.value)}
                        className="h-9 rounded-xl border border-slate-200 bg-slate-50/80 px-3 font-bold text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none cursor-pointer"
                      />
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 italic pr-2">Cerrado</span>
                  )}
                </div>

                {dayError && (
                  <p className="px-4 text-xs font-semibold text-red-600" role="alert">
                    {dayError}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECCIÓN 2: ESTRUCTURA TARIFARIA                                */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-[#e2f2fe] rounded-[28px] p-6 sm:p-8 shadow-sm border border-blue-100/60">
        <div className="flex items-center gap-3 mb-6">
          <DollarSign className="text-blue-600 w-5 h-5" />
          <h2 className="text-base font-black tracking-wider text-slate-800 uppercase font-headline">
            ESTRUCTURA TARIFARIA
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TARIFAS.map(([code, label, help]) => {
            const tarifa = form.tarifas?.[code] || { activa: false, precio_hora: '' };
            const tarifaError = errors.tarifas?.[code];

            return (
              <div
                key={code}
                className={`bg-white rounded-2xl p-6 shadow-sm border flex flex-col justify-between transition-all ${
                  tarifaError
                    ? 'border-red-400 bg-red-50/20'
                    : tarifa.activa
                    ? 'border-slate-50 hover:shadow-md'
                    : 'border-slate-100 bg-slate-50/50 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-black text-slate-800 text-xs uppercase tracking-wider font-headline">
                      {label} {code === 'NORMAL' && <span className="text-rose-500">*</span>}
                    </span>

                    {code === 'NORMAL' ? (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-black text-blue-600 tracking-wider uppercase border border-blue-100">
                        REQUERIDO
                      </span>
                    ) : (
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-600">
                        <input
                          type="checkbox"
                          checked={tarifa.activa}
                          disabled={code === 'NORMAL'}
                          onChange={(event) => changeRate(code, 'activa', event.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                        />
                        <span>Activo</span>
                      </label>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 font-medium min-h-[32px] leading-relaxed">
                    {help}
                  </p>
                </div>

                <div className="mt-4">
                  <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
                    Tarifa General por Hora ($) {code === 'NORMAL' && <span className="text-rose-500">*</span>}
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-sm font-black text-slate-400">$</span>
                    <input
                      aria-invalid={Boolean(tarifaError)}
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]+(\.[0-9]{1,2})?"
                      placeholder="0.00"
                      disabled={!tarifa.activa}
                      value={tarifa.precio_hora}
                      onChange={(event) => changeRate(code, 'precio_hora', limpiarDecimalPositivo(event.target.value))}
                      className={`h-10 w-full rounded-xl border bg-slate-50 pl-8 pr-3 text-sm font-extrabold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50 ${
                        tarifaError ? 'border-red-400 bg-red-50' : 'border-slate-100'
                      }`}
                    />
                  </div>
                  {tarifaError && (
                    <p className="mt-1.5 text-xs font-semibold text-red-600" role="alert">
                      {tarifaError}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECCIÓN 3: ESPACIOS TOTALES INICIALES                           */}
      {/* ------------------------------------------------------------- */}
      {!operationalOnly && !data?.configuracion_completa && (
        <section className="bg-[#e2f2fe] rounded-[28px] p-6 sm:p-8 shadow-sm border border-blue-100/60">
          <div className="flex items-center gap-3 mb-6">
            <Car className="text-blue-600 w-5 h-5" />
            <h2 className="text-base font-black tracking-wider text-slate-800 uppercase font-headline">
              ESPACIOS TOTALES INICIALES
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-50">
            <div className="mb-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider font-headline">
                Cantidad de Plazas Iniciales <span className="text-rose-500">*</span>
              </h3>
              <p className="mt-0.5 text-xs text-slate-400 font-medium">
                Define la capacidad total de estacionamientos disponibles en tu local.
              </p>
            </div>

            <div className="max-w-xs">
              <input
                aria-invalid={Boolean(errors.cantidad_espacios)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="10"
                disabled={data?.configuracion_completa}
                value={form.cantidad_espacios}
                onChange={(event) => changeQuantity(event.target.value)}
                className={`h-10 w-full rounded-xl border bg-slate-50 px-4 font-extrabold text-slate-700 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all disabled:opacity-60 disabled:bg-slate-100 ${
                  errors.cantidad_espacios ? 'border-red-400 bg-red-50' : 'border-slate-100'
                }`}
              />
              {errors.cantidad_espacios && (
                <p className="mt-1.5 text-xs font-semibold text-red-600" role="alert">
                  {errors.cantidad_espacios}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CONTENIDO EXTRA PASADO DESDE LA VISTA PADRE */}
      {children}

      {/* BOTÓN ÚNICO GUARDAR */}
      <div className="flex justify-end pt-2">
        <button
          className="bg-[#2b62d9] hover:bg-[#1f4bb3] text-white font-bold text-xs px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
          type="submit"
          disabled={pending}
        >
          <Save size={16} />
          <span>{pending ? 'Guardando...' : 'Guardar Cambios del Sistema'}</span>
        </button>
      </div>

      {errors.formulario && (
        <p className="border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-600 rounded-2xl" role="alert">
          {errors.formulario}
        </p>
      )}
    </form>
  );
};

export default FinalConfigurationForm;
