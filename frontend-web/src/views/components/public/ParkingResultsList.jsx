import React from 'react';
import { MapPin, Navigation, ParkingSquare, RotateCcw } from 'lucide-react';
import {
  PARKING_STATUS,
  formatearDistancia,
  formatearMoneda,
} from '../../../utils/publicParkings';

export const ParkingStatusBadge = ({ status }) => {
  const meta = PARKING_STATUS[status] ?? PARKING_STATUS.CLOSED;
  return <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-slate-700"><span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.marker }} />{meta.label}</span>;
};

const ParkingResultCard = ({ parking, selected, onSelect }) => <button type="button" onClick={() => onSelect(parking.id)} aria-current={selected ? 'true' : undefined} className={`w-full rounded-2xl border p-4 text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${selected ? 'border-sky-600 bg-sky-50 ring-1 ring-sky-200' : 'border-slate-200 bg-white hover:border-sky-300 hover:shadow-md'}`}>
  <div className="flex items-start justify-between gap-3"><h3 className="min-w-0 text-sm font-black leading-5 text-slate-950 sm:text-base">{parking.name}</h3><ParkingStatusBadge status={parking.status} /></div>
  <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-slate-600"><MapPin aria-hidden="true" className="mt-0.5 shrink-0 text-sky-700" size={15} />{parking.address}</p>
  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-xs">
    <span><strong className="block text-sm text-slate-950">{parking.available_spaces}/{parking.total_spaces}</strong> disponibles</span>
    <span><strong className="block text-sm text-slate-950">{formatearDistancia(parking.distance_km)}</strong> distancia</span>
    <span><strong className="block text-sm text-slate-950">{formatearMoneda(parking.normal_rate)}</strong> por hora</span>
  </div>
</button>;

export const ParkingResultsList = ({ results, selectedId, loading, onSelect, onClear, onResetArea }) => <section aria-labelledby="parking-results-title" className="bg-slate-50">
  <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4 sm:px-5"><div><p className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">Lista accesible</p><h2 id="parking-results-title" className="mt-1 text-lg font-black text-slate-950">Parqueaderos encontrados</h2></div><ParkingSquare aria-hidden="true" className="text-sky-700" /></div>
  {loading && !results.length && <div className="space-y-3 px-4 pb-5 sm:px-5" aria-label="Cargando resultados">{[1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}</div>}
  {!loading && !results.length && <div className="mx-4 mb-5 rounded-2xl border border-slate-200 bg-white p-5 text-center sm:mx-5"><Navigation aria-hidden="true" className="mx-auto text-slate-400" /><h3 className="mt-3 font-bold text-slate-950">No encontramos parqueaderos con estos filtros.</h3><p className="mt-2 text-sm text-slate-600">Limpia los filtros o vuelve a mostrar toda el área de Loja.</p><div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row"><button type="button" onClick={onClear} className="min-h-10 rounded-xl bg-sky-700 px-4 text-sm font-bold text-white">Limpiar filtros</button><button type="button" onClick={onResetArea} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-bold text-slate-700"><RotateCcw aria-hidden="true" size={16} />Ampliar zona</button></div></div>}
  <div className="grid gap-3 px-4 pb-5 sm:grid-cols-2 sm:px-5 2xl:grid-cols-3">{results.map((parking) => <ParkingResultCard key={parking.id} parking={parking} selected={selectedId === parking.id} onSelect={onSelect} />)}</div>
</section>;
