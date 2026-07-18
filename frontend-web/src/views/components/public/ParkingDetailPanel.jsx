import React, { useMemo } from 'react';
import {
  Building2,
  CalendarDays,
  Car,
  Clock3,
  ExternalLink,
  LogIn,
  MapPin,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  SPACE_STATUS,
  calcularDistanciaKm,
  formatearDistancia,
  formatearMoneda,
  obtenerHorarioHoy,
  ordenarHorarios,
  resumirEspaciosPublicos,
} from '../../../utils/publicParkings';
import { ParkingStatusBadge } from './ParkingResultsList';

const DAY_LABELS = {
  LUNES: 'Lunes', MARTES: 'Martes', MIERCOLES: 'Miércoles', JUEVES: 'Jueves',
  VIERNES: 'Viernes', SABADO: 'Sábado', DOMINGO: 'Domingo',
};

const UpdatedAt = ({ value }) => <p className="flex items-center gap-2 text-xs text-slate-500"><Clock3 aria-hidden="true" size={14} />Última actualización: {value ? new Date(value).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' }) : 'No disponible'}</p>;

const Availability = ({ parking }) => {
  const summary = resumirEspaciosPublicos(parking);
  const safeTotal = Math.max(summary.total, 1);
  return <section aria-labelledby="availability-title" className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <div className="flex items-end justify-between gap-3"><div><p className="text-xs font-bold text-slate-500">Disponibilidad actual</p><h3 id="availability-title" className="mt-1 text-xl font-black text-slate-950">{summary.free} disponibles de {summary.total}</h3></div><Car aria-hidden="true" className="text-sky-700" /></div>
    {summary.detailed ? <>
      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-200" aria-label={`${summary.free} libres, ${summary.occupied} ocupados y ${summary.disabled} inhabilitados`}>
        <span style={{ width: `${(summary.free / safeTotal) * 100}%`, backgroundColor: SPACE_STATUS.FREE.color }} />
        <span style={{ width: `${(summary.occupied / safeTotal) * 100}%`, backgroundColor: SPACE_STATUS.OCCUPIED.color }} />
        <span style={{ width: `${(summary.disabled / safeTotal) * 100}%`, backgroundColor: SPACE_STATUS.DISABLED.color }} />
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">{[['FREE', summary.free], ['OCCUPIED', summary.occupied], ['DISABLED', summary.disabled]].map(([status, value]) => <div key={status}><dt className="flex items-center gap-1 text-slate-500"><span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ backgroundColor: SPACE_STATUS[status].color }} />{SPACE_STATUS[status].label}</dt><dd className="mt-1 font-black text-slate-900">{value}</dd></div>)}</dl>
    </> : <p className="mt-3 text-xs leading-5 text-slate-500">La API solo reportó los conteos generales para este parqueadero.</p>}
  </section>;
};

export const ParkingDetailPanel = ({ detailQuery, selectedId, userLocation, onDeselect, onLogin }) => {
  const parking = detailQuery.data;
  const distance = useMemo(() => calcularDistanciaKm(userLocation, parking), [parking, userLocation]);

  if (!selectedId) return <aside className="grid min-h-96 place-items-center bg-white p-8 text-center lg:h-full"><div><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-sky-50 text-sky-700"><MapPin aria-hidden="true" size={30} /></span><h2 className="mt-5 text-xl font-black text-slate-950">Selecciona un parqueadero</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">Haz clic en un marcador o elige una opción de la lista para consultar su información.</p></div></aside>;
  if (detailQuery.isPending && !parking) return <aside className="h-full space-y-5 overflow-hidden bg-white p-5" aria-label="Cargando detalle"><div className="h-44 animate-pulse rounded-2xl bg-slate-200" /><div className="h-8 w-3/4 animate-pulse rounded bg-slate-200" /><div className="h-28 animate-pulse rounded-2xl bg-slate-100" /><div className="h-28 animate-pulse rounded-2xl bg-slate-100" /></aside>;
  if (detailQuery.isError && !parking) return <aside className="grid min-h-96 place-items-center bg-white p-8 text-center"><div><h2 className="font-black text-slate-950">No pudimos cargar este parqueadero.</h2><p className="mt-2 text-sm text-slate-600">Revisa tu conexión e inténtalo nuevamente.</p><button type="button" onClick={() => detailQuery.refetch()} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-sky-700 px-5 font-bold text-white"><RefreshCw aria-hidden="true" size={17} />Reintentar</button></div></aside>;

  const today = obtenerHorarioHoy(parking.schedules, parking.status);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${parking.latitude},${parking.longitude}`)}`;

  return <aside className="h-full overflow-y-auto bg-white" aria-label={`Detalles de ${parking.name}`}>
    <div className="relative grid h-48 place-items-center overflow-hidden bg-gradient-to-br from-sky-800 via-sky-700 to-cyan-600 text-white">
      <Building2 aria-hidden="true" size={68} className="opacity-35" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
      <div className="absolute left-4 top-4"><ParkingStatusBadge status={parking.status} /></div>
      <button type="button" onClick={onDeselect} aria-label="Cerrar detalle y ver todos los parqueaderos" className="absolute right-4 top-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-white/95 px-3 text-xs font-black text-slate-800 shadow-md transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"><X aria-hidden="true" size={17} />Ver todos</button>
      <span className="absolute bottom-4 left-4 rounded-xl bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-800">{formatearDistancia(distance)}</span>
    </div>
    <div className="space-y-5 p-5 sm:p-6">
      {detailQuery.isFetching && <p className="text-xs font-bold text-sky-700" role="status">Actualizando disponibilidad…</p>}
      <div><h2 className="font-headline text-2xl font-black leading-tight text-slate-950">{parking.name}</h2><p className="mt-3 flex items-start gap-2 text-sm leading-6 text-slate-600"><MapPin aria-hidden="true" className="mt-0.5 shrink-0 text-sky-700" size={18} />{parking.address}</p>{parking.description && <p className="mt-3 text-sm leading-6 text-slate-600">{parking.description}</p>}</div>
      <Availability parking={parking} />
      <div className="grid gap-2">
        <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sky-700 px-3 text-sm font-bold text-white shadow-sm hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"><ExternalLink aria-hidden="true" size={17} />Cómo llegar</a>
      </div>
      <section className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-800"><Clock3 aria-hidden="true" size={19} /></span><div><p className="text-xs font-bold text-slate-500">Horario de hoy</p><h3 className="mt-1 font-black text-slate-950">{today.title}</h3><p className="mt-1 text-sm text-slate-600">{today.detail}</p></div></div><details className="mt-4 border-t border-slate-100 pt-3"><summary className="cursor-pointer rounded font-bold text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600">Ver horario semanal</summary><div className="mt-3 divide-y divide-slate-100">{ordenarHorarios(parking.schedules).map((schedule) => <div key={schedule.day} className="flex justify-between gap-3 py-2 text-sm"><span>{DAY_LABELS[schedule.day] ?? schedule.day}</span><span className="font-bold">{schedule.opens_at.slice(0, 5)} – {schedule.closes_at.slice(0, 5)}</span></div>)}</div></details></section>
      <section aria-labelledby="rates-title"><div className="flex items-center gap-2"><CalendarDays aria-hidden="true" className="text-sky-700" size={19} /><h3 id="rates-title" className="font-black text-slate-950">Tarifas por hora</h3></div>{parking.rates.length ? <div className="mt-3 grid gap-2">{parking.rates.map((rate) => <div key={rate.code} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-3"><div><p className="font-bold text-slate-900">{rate.name}</p><p className="text-xs text-slate-500">Tarifa informativa por hora</p></div><strong className="text-lg text-sky-800">{formatearMoneda(rate.price_per_hour)}</strong></div>)}</div> : <p className="mt-3 text-sm text-slate-600">No hay tarifas públicas configuradas.</p>}</section>
      <button type="button" onClick={onLogin} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white"><LogIn aria-hidden="true" size={17} />Iniciar sesión para acceder a funciones privadas</button>
      <UpdatedAt value={parking.updated_at} />
      <p className="text-xs leading-5 text-slate-500">La disponibilidad es informativa y puede cambiar antes de tu llegada.</p>
    </div>
  </aside>;
};
