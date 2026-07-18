import React, { useEffect, useState } from 'react';
import { CircleStop, Play, X } from 'lucide-react';
import { formatearCostoInformativo, tarifaInicialEstancia } from '../../../utils/stay';

const Resumen = ({ stay }) => (
  <div className="mt-5 border-y border-slate-200 py-4">
    <p className="text-xs font-bold uppercase text-sky-800">Valor informativo</p>
    <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
      <div><dt className="text-slate-500">Tiempo</dt><dd className="font-bold">{stay.minutos_reales} min</dd></div>
      <div><dt className="text-slate-500">Horas aplicadas</dt><dd className="font-bold">{stay.horas_cobradas}</dd></div>
      <div><dt className="text-slate-500">Tarifa</dt><dd className="font-bold">{stay.tarifa_tipo_snapshot}</dd></div>
      <div><dt className="text-slate-500">Precio por hora</dt><dd className="font-bold">{formatearCostoInformativo(stay.precio_hora_snapshot)}</dd></div>
    </dl>
    <p className="mt-4 text-2xl font-bold text-slate-950">{formatearCostoInformativo(stay.costo_total)}</p>
  </div>
);

export const StayDialog = ({ mode, space, rates, stay, pending, onClose, onStart, onFinish }) => {
  const [rateId, setRateId] = useState('');
  useEffect(() => {
    if (mode === 'start') setRateId(tarifaInicialEstancia(rates));
  }, [mode, rates, space]);
  if (!mode || !space) return null;
  const starting = mode === 'start';
  const final = mode === 'final';
  return <div className="fixed inset-0 z-[1000] grid place-items-center bg-slate-950/45 p-4" role="presentation">
    <section className="w-full max-w-md border border-slate-200 bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="stay-title">
      <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-sky-800">{space.nombre}</p><h2 className="mt-1 text-xl font-bold" id="stay-title">{starting ? 'Iniciar estancia' : final ? 'Estancia finalizada' : 'Estancia actual'}</h2></div><button className="minimum-touch-target grid place-items-center text-slate-500" type="button" onClick={onClose} aria-label="Cerrar"><X size={20} /></button></div>
      {starting ? <label className="mt-5 block text-sm font-semibold">Tarifa informativa<select className="mt-2 h-11 w-full border border-slate-300 bg-white px-3" value={rateId} onChange={(event) => setRateId(Number(event.target.value))}>{rates.filter((rate) => rate.activa).map((rate) => <option value={rate.id} key={rate.id}>{rate.nombre_visible} · {formatearCostoInformativo(rate.precio_hora)}/h</option>)}</select></label> : <Resumen stay={stay} />}
      <div className="mt-6 flex justify-end gap-3"><button className="minimum-touch-target border border-slate-300 px-4 font-semibold" type="button" onClick={onClose} disabled={pending}>{final ? 'Cerrar' : 'Cancelar'}</button>{starting && <button className="inline-flex minimum-touch-target items-center gap-2 bg-sky-700 px-4 font-bold text-white disabled:opacity-50" type="button" disabled={pending || !rateId} onClick={() => onStart(rateId)}><Play size={18} /> Confirmar inicio</button>}{mode === 'current' && <button className="inline-flex minimum-touch-target items-center gap-2 bg-red-600 px-4 font-bold text-white disabled:opacity-50" type="button" disabled={pending} onClick={onFinish}><CircleStop size={18} /> Finalizar estancia</button>}</div>
    </section>
  </div>;
};
