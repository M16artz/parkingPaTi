import React, { useState } from 'react';
import { Ban, CarFront, Clock3, Pencil, Play, Plus, RotateCcw, SquareParking, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../admin/ConfirmDialog';
import { SpaceEditDialog } from './SpaceEditDialog';

const STATE_META = {
  LIBRE: { label: 'Libre', card: 'border-emerald-200 bg-gradient-to-br from-white to-emerald-50/80', badge: 'bg-emerald-100 text-emerald-800', icon: 'bg-emerald-500 text-white shadow-emerald-200', Icon: SquareParking },
  OCUPADO: { label: 'Ocupado', card: 'border-teal-200 bg-gradient-to-br from-white to-teal-50/80', badge: 'bg-teal-100 text-teal-800', icon: 'bg-teal-600 text-white shadow-teal-200', Icon: CarFront },
  INHABILITADO: { label: 'Inhabilitado', card: 'border-orange-200 bg-gradient-to-br from-white to-orange-50/80', badge: 'bg-orange-100 text-orange-800', icon: 'bg-orange-500 text-white shadow-orange-200', Icon: Ban },
};

const IconButton = ({ label, icon: Icon, tone = 'slate', onClick, disabled }) => {
  const tones = {
    slate: 'border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700',
    orange: 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100',
    red: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
  };
  return <button className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border shadow-sm transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-45 ${tones[tone]}`} type="button" title={label} aria-label={label} disabled={disabled} onClick={onClick}><Icon size={17} strokeWidth={2.25} /></button>;
};

export const SpaceGrid = ({ spaces, rates, pending, onAdd, onEdit, onDisable, onDelete, onReactivate, onStartStay, onViewStay }) => {
  const [addCount, setAddCount] = useState(1);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const active = spaces.filter((space) => space.is_active);
  const deleted = spaces.filter((space) => !space.is_active);
  const counts = active.reduce((result, space) => ({ ...result, [space.estado]: result[space.estado] + 1 }), { LIBRE: 0, OCUPADO: 0, INHABILITADO: 0 });

  const executeConfirm = () => {
    if (confirm.type === 'disable') onDisable(confirm.space);
    else onDelete(confirm.space);
    setConfirm(null);
  };

  return <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-sky-50/60 p-5 sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-700 text-white shadow-lg shadow-sky-200"><SquareParking size={23} /></span><div><h2 className="text-xl font-black text-slate-900">Mapa de espacios</h2><p className="mt-0.5 text-sm text-slate-600">Gestiona cada espacio desde su tarjeta.</p></div></div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-800">{counts.LIBRE} libres</span><span className="rounded-full bg-teal-100 px-3 py-1.5 text-teal-800">{counts.OCUPADO} ocupados</span><span className="rounded-full bg-orange-100 px-3 py-1.5 text-orange-800">{counts.INHABILITADO} inhabilitados</span></div>
        </div>
        <div className="flex flex-wrap items-end gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"><label className="text-xs font-bold uppercase tracking-wide text-slate-500">Cantidad<input className="mt-1 block h-11 w-24 rounded-xl border border-slate-300 px-3 text-base font-bold text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" type="number" min="1" max="100" value={addCount} onChange={(event) => setAddCount(event.target.value)} /></label><button className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-sky-700 px-4 font-bold text-white shadow-md shadow-sky-200 transition hover:bg-sky-800 disabled:opacity-50" type="button" disabled={pending || Number(addCount) < 1} onClick={() => onAdd(Number(addCount))}><Plus size={18} strokeWidth={2.5} /> Agregar espacios</button></div>
      </div>
    </div>

    <div className="p-5 sm:p-6">
      {active.length === 0 && <div className="grid min-h-52 place-items-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center"><div><SquareParking className="mx-auto text-slate-400" size={38} /><p className="mt-3 font-bold text-slate-700">No hay espacios activos</p><p className="mt-1 text-sm text-slate-500">Agrega un lote para comenzar.</p></div></div>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {active.map((space) => {
          const meta = STATE_META[space.estado] || STATE_META.INHABILITADO;
          const StateIcon = meta.Icon;
          const appliedRateCode = space.estado === 'OCUPADO' && space.estancia_tarifa_codigo
            ? space.estancia_tarifa_codigo
            : space.tarifa_codigo;
          const appliedRatePrice = space.estado === 'OCUPADO' && space.estancia_precio_hora !== null && space.estancia_precio_hora !== undefined
            ? space.estancia_precio_hora
            : space.tarifa_precio_hora;
          return <article className={`group flex min-h-56 flex-col rounded-2xl border p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg ${meta.card}`} key={space.id}>
            <div className="flex items-start justify-between gap-3"><span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl shadow-lg ${meta.icon}`}><StateIcon size={23} strokeWidth={2.25} /></span><span className={`rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-wide ${meta.badge}`}>{meta.label}</span></div>
            <div className="mt-4 min-w-0"><h3 className="truncate text-xl font-black text-slate-900" title={space.nombre}>{space.nombre}</h3><p className="mt-1 truncate text-sm font-semibold text-slate-500">{appliedRateCode || 'Sin tarifa'} · ${appliedRatePrice ?? '0.00'}/h</p>{space.estado === 'OCUPADO' && space.estancia_tarifa_codigo && <p className="mt-1 text-xs font-bold text-teal-700">Tarifa de la estancia activa</p>}</div>
            <div className="mt-auto flex items-center gap-2 border-t border-slate-200/80 pt-4">
              {space.estado === 'LIBRE' && <button className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50" type="button" disabled={pending} onClick={() => onStartStay(space)}><Play size={16} fill="currentColor" /> Iniciar</button>}
              {space.estado === 'OCUPADO' && <button className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-teal-700 px-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 disabled:opacity-50" type="button" disabled={pending} onClick={() => onViewStay(space)}><Clock3 size={17} /> Ver estancia</button>}
              {space.estado === 'INHABILITADO' && <button className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-700 px-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50" type="button" disabled={pending} onClick={() => setEditing(space)}><Pencil size={16} /> Editar</button>}
              {space.estado !== 'INHABILITADO' && <IconButton label={`Editar ${space.nombre}`} icon={Pencil} disabled={pending} onClick={() => setEditing(space)} />}
              {space.estado === 'LIBRE' && <IconButton label={`Inhabilitar ${space.nombre}`} icon={Ban} tone="orange" disabled={pending} onClick={() => setConfirm({ type: 'disable', space })} />}
              {space.estado !== 'OCUPADO' && <IconButton label={`Eliminar ${space.nombre}`} icon={Trash2} tone="red" disabled={pending} onClick={() => setConfirm({ type: 'delete', space })} />}
            </div>
          </article>;
        })}
      </div>
    </div>

    {deleted.length > 0 && <div className="border-t border-slate-200 bg-slate-50/70 p-5 sm:p-6"><div className="flex items-center gap-2"><Trash2 size={18} className="text-slate-500" /><h3 className="font-black text-slate-800">Espacios eliminados</h3><span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-600">{deleted.length}</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{deleted.map((space) => <article className="flex min-h-16 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm" key={space.id}><div className="min-w-0"><p className="truncate font-bold text-slate-500 line-through">{space.nombre}</p><p className="text-xs text-slate-400">Borrado lógico</p></div><button className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl bg-sky-50 px-3 text-sm font-bold text-sky-700 transition hover:bg-sky-100 disabled:opacity-50" type="button" disabled={pending} onClick={() => onReactivate(space)}><RotateCcw size={16} /> Reactivar</button></article>)}</div></div>}
    <SpaceEditDialog space={editing} rates={rates} pending={pending} onClose={() => setEditing(null)} onSave={(payload) => { onEdit(editing, payload); setEditing(null); }} />
    <ConfirmDialog open={Boolean(confirm)} title={confirm?.type === 'delete' ? 'Eliminar espacio' : 'Inhabilitar espacio'} description={confirm?.type === 'delete' ? `Se conservará ${confirm?.space.nombre} como registro eliminado y dejará de contar en disponibilidad.` : `${confirm?.space.nombre} seguirá activo, pero no estará disponible.`} confirmLabel={confirm?.type === 'delete' ? 'Eliminar lógicamente' : 'Inhabilitar'} danger pending={pending} onCancel={() => setConfirm(null)} onConfirm={executeConfirm} />
  </section>;
};
