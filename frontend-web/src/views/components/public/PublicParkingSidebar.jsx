import React from 'react';
import { ArrowLeft, Clock3, MapPin, RefreshCw } from 'lucide-react';

const STATUS = {
  OPEN: ['Abierto', 'text-emerald-700'],
  FULL: ['Lleno', 'text-red-700'],
  CLOSED: ['Cerrado', 'text-slate-600'],
};

const UpdatedAt = ({ value }) => (
  <p className="flex items-center gap-2 text-xs text-slate-500">
    <Clock3 size={14} /> Actualizado {new Date(value).toLocaleTimeString()}
  </p>
);

export const PublicParkingSidebar = ({ listQuery, detailQuery, selectedId, onSelect, onClear }) => {
  if (selectedId) {
    return <aside className="h-full overflow-y-auto bg-white p-5">
      <button className="inline-flex min-h-11 items-center gap-2 font-semibold text-sky-800" type="button" onClick={onClear}><ArrowLeft size={18} /> Volver a resultados</button>
      {detailQuery.isPending && <p className="mt-8 text-slate-600">Cargando detalle...</p>}
      {detailQuery.isError && <div className="mt-8"><p className="text-red-700">No se pudo cargar el parqueadero.</p><button className="mt-3 inline-flex min-h-11 items-center gap-2 font-bold text-sky-800" type="button" onClick={() => detailQuery.refetch()}><RefreshCw size={18} /> Reintentar</button></div>}
      {detailQuery.data && <div className="mt-5">
        <p className={`text-sm font-bold ${STATUS[detailQuery.data.status][1]}`}>{STATUS[detailQuery.data.status][0]}</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-950">{detailQuery.data.name}</h2>
        <p className="mt-3 flex gap-2 text-sm text-slate-600"><MapPin className="shrink-0" size={18} /> {detailQuery.data.address}</p>
        {detailQuery.data.description && <p className="mt-4 text-sm leading-6 text-slate-700">{detailQuery.data.description}</p>}
        <dl className="mt-5 grid grid-cols-2 border-y border-slate-200 py-4"><div><dt className="text-xs text-slate-500">Disponibles</dt><dd className="text-2xl font-bold">{detailQuery.data.available_spaces}</dd></div><div><dt className="text-xs text-slate-500">Total</dt><dd className="text-2xl font-bold">{detailQuery.data.total_spaces}</dd></div></dl>
        <section className="mt-5"><h3 className="font-bold">Tarifas informativas</h3><div className="mt-2 divide-y divide-slate-200">{detailQuery.data.rates.map((rate) => <div className="flex justify-between py-3 text-sm" key={rate.code}><span>{rate.name}</span><strong>${rate.price_per_hour}/h</strong></div>)}</div></section>
        <section className="mt-5"><h3 className="font-bold">Horarios</h3><div className="mt-2 divide-y divide-slate-200">{detailQuery.data.schedules.map((schedule) => <div className="flex justify-between py-3 text-sm" key={schedule.day}><span>{schedule.day}</span><span>{schedule.opens_at.slice(0, 5)} - {schedule.closes_at.slice(0, 5)}</span></div>)}</div></section>
        <div className="mt-5"><UpdatedAt value={detailQuery.data.updated_at} /></div>
      </div>}
    </aside>;
  }

  return <aside className="h-full overflow-y-auto bg-white">
    <div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-5"><h2 className="text-lg font-bold">Parqueaderos en el mapa</h2>{listQuery.data && <div className="mt-2"><UpdatedAt value={listQuery.data.updated_at} /></div>}</div>
    {listQuery.isPending && <p className="p-5 text-slate-600">Consultando disponibilidad...</p>}
    {listQuery.isError && <div className="p-5"><p className="text-red-700">No se pudo consultar la disponibilidad.</p><button className="mt-3 inline-flex min-h-11 items-center gap-2 font-bold text-sky-800" type="button" onClick={() => listQuery.refetch()}><RefreshCw size={18} /> Reintentar</button></div>}
    {listQuery.data?.results.length === 0 && <p className="p-5 text-slate-600">No hay parqueaderos visibles en esta zona.</p>}
    <div className="divide-y divide-slate-200">{listQuery.data?.results.map((parking) => <button className="block w-full p-5 text-left hover:bg-slate-50 focus:bg-sky-50" type="button" onClick={() => onSelect(parking.id)} key={parking.id}><div className="flex items-start justify-between gap-3"><strong className="text-slate-950">{parking.name}</strong><span className={`text-xs font-bold ${STATUS[parking.status][1]}`}>{STATUS[parking.status][0]}</span></div><p className="mt-2 text-sm text-slate-600">{parking.address}</p><p className="mt-3 text-sm"><strong>{parking.available_spaces}</strong> de {parking.total_spaces} disponibles</p></button>)}</div>
  </aside>;
};
