import React from 'react';
import { LocateFixed, Search, SlidersHorizontal, X } from 'lucide-react';

const FILTERS = [
  ['ALL', 'Todos'],
  ['OPEN', 'Abiertos'],
  ['AVAILABLE', 'Con disponibilidad'],
  ['PRICE', 'Menor tarifa'],
  ['DISTANCE', 'Más cercanos'],
];

export const ParkingSearchFilters = ({
  search,
  filter,
  resultCount,
  userLocation,
  locationState,
  onSearch,
  onFilter,
  onLocation,
  onClear,
}) => <section aria-label="Buscar y filtrar parqueaderos" className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
  <div className="mx-auto flex max-w-[1800px] flex-col gap-3 xl:flex-row xl:items-center">
    <div className="relative min-w-0 flex-1 xl:max-w-xl">
      <label htmlFor="parking-search" className="sr-only">Buscar por nombre, calle o sector</label>
      <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
      <input id="parking-search" type="search" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Buscar por nombre, calle o sector" className="min-h-12 w-full rounded-2xl border border-slate-300 bg-slate-50 pl-11 pr-11 text-sm text-slate-900 outline-none transition focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100" />
      {search && <button type="button" onClick={() => onSearch('')} aria-label="Limpiar búsqueda" className="absolute right-2 top-1/2 grid min-h-9 min-w-9 -translate-y-1/2 place-items-center rounded-xl text-slate-500 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"><X aria-hidden="true" size={17} /></button>}
    </div>
    <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 xl:pb-0" aria-label="Filtros rápidos">
      <SlidersHorizontal aria-hidden="true" className="shrink-0 text-slate-400" size={18} />
      {FILTERS.map(([value, label]) => <button key={value} type="button" disabled={value === 'DISTANCE' && !userLocation} aria-pressed={filter === value} title={value === 'DISTANCE' && !userLocation ? 'Activa primero tu ubicación' : undefined} onClick={() => onFilter(value)} className={`min-h-10 shrink-0 rounded-xl border px-3 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 disabled:cursor-not-allowed disabled:opacity-45 ${filter === value ? 'border-sky-700 bg-sky-700 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50'}`}>{label}</button>)}
      {(search || filter !== 'ALL') && <button type="button" onClick={onClear} className="min-h-10 shrink-0 rounded-xl px-3 text-xs font-bold text-sky-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600">Limpiar filtros</button>}
    </div>
    <button type="button" disabled={locationState.loading} onClick={onLocation} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 text-sm font-bold text-sky-800 hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 disabled:opacity-60"><LocateFixed aria-hidden="true" size={18} /> {locationState.loading ? 'Obteniendo ubicación…' : userLocation ? 'Actualizar mi ubicación' : 'Usar mi ubicación'}</button>
  </div>
  <div className="mx-auto mt-2 flex max-w-[1800px] flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
    <p aria-live="polite">{resultCount} {resultCount === 1 ? 'parqueadero encontrado' : 'parqueaderos encontrados'}</p>
    {locationState.error && <p role="status" className="text-amber-700">{locationState.error}</p>}
  </div>
</section>;
