import React, { useState } from 'react';
import { Clock3, Play, Plus, RotateCcw, Settings2, Trash2, Wrench } from 'lucide-react';
import { ConfirmDialog } from '../admin/ConfirmDialog';
import { SpaceEditDialog } from './SpaceEditDialog';

const STATE_STYLE = {
  LIBRE: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  OCUPADO: 'border-teal-300 bg-teal-50 text-teal-900',
  INHABILITADO: 'border-amber-300 bg-amber-50 text-amber-900',
};

export const SpaceGrid = ({ spaces, rates, pending, onAdd, onEdit, onDisable, onDelete, onReactivate, onStartStay, onViewStay }) => {
  const [addCount, setAddCount] = useState(1);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const active = spaces.filter((space) => space.is_active);
  const deleted = spaces.filter((space) => !space.is_active);

  const executeConfirm = () => {
    if (confirm.type === 'disable') onDisable(confirm.space);
    else onDelete(confirm.space);
    setConfirm(null);
  };

  return <section className="border border-slate-200 bg-white">
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 p-5">
      <div><h2 className="text-lg font-bold">Espacios</h2><p className="mt-1 text-sm text-slate-600">Selecciona una celda para renombrar o asignar tarifa.</p></div>
      <div className="flex items-end gap-2"><label className="text-sm font-semibold">Agregar<input className="mt-1 block h-11 w-24 border border-slate-300 px-3" type="number" min="1" max="100" value={addCount} onChange={(event) => setAddCount(event.target.value)} /></label><button className="inline-flex min-h-11 items-center gap-2 bg-sky-700 px-4 font-bold text-white disabled:opacity-50" type="button" disabled={pending || Number(addCount) < 1} onClick={() => onAdd(Number(addCount))}><Plus size={18} /> Crear lote</button></div>
    </div>
    <div className="p-5">
      {active.length === 0 && <p className="border border-dashed border-slate-300 p-8 text-center text-slate-600">No hay espacios activos.</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {active.map((space) => <article className={`flex aspect-square min-h-32 flex-col justify-between border p-3 ${STATE_STYLE[space.estado]}`} key={space.id}>
          <button className="min-h-12 text-left" type="button" onClick={() => space.estado === 'OCUPADO' ? onViewStay(space) : setEditing(space)}><strong className="block break-words text-base">{space.nombre}</strong><span className="mt-1 block text-xs font-semibold">{space.estado}</span></button>
          <div><p className="truncate text-xs">{space.tarifa_codigo || 'Sin tarifa'} · ${space.tarifa_precio_hora || '0.00'}</p><div className="mt-2 flex justify-end gap-1">{space.estado === 'LIBRE' && <button className="minimum-touch-target grid place-items-center" type="button" title="Iniciar estancia" aria-label={`Iniciar estancia en ${space.nombre}`} onClick={() => onStartStay(space)}><Play size={17} /></button>}{space.estado === 'OCUPADO' && <button className="minimum-touch-target grid place-items-center" type="button" title="Ver estancia" aria-label={`Ver estancia de ${space.nombre}`} onClick={() => onViewStay(space)}><Clock3 size={17} /></button>}<button className="minimum-touch-target grid place-items-center" type="button" title="Editar" aria-label={`Editar ${space.nombre}`} onClick={() => setEditing(space)}><Settings2 size={17} /></button>{space.estado !== 'INHABILITADO' && space.estado !== 'OCUPADO' && <button className="minimum-touch-target grid place-items-center" type="button" title="Deshabilitar" aria-label={`Deshabilitar ${space.nombre}`} onClick={() => setConfirm({ type: 'disable', space })}><Wrench size={17} /></button>}{space.estado !== 'OCUPADO' && <button className="minimum-touch-target grid place-items-center text-red-700" type="button" title="Eliminar" aria-label={`Eliminar ${space.nombre}`} onClick={() => setConfirm({ type: 'delete', space })}><Trash2 size={17} /></button>}</div></div>
        </article>)}
      </div>
    </div>
    {deleted.length > 0 && <div className="border-t border-slate-200 p-5"><h3 className="font-bold">Eliminados lógicamente</h3><div className="mt-3 flex flex-wrap gap-2">{deleted.map((space) => <div className="flex min-h-11 items-center gap-3 border border-slate-300 bg-slate-50 px-3" key={space.id}><span className="line-through">{space.nombre}</span><button className="inline-flex min-h-11 items-center gap-1 font-bold text-sky-700" type="button" disabled={pending} onClick={() => onReactivate(space)}><RotateCcw size={16} /> Reactivar</button></div>)}</div></div>}
    <SpaceEditDialog space={editing} rates={rates} pending={pending} onClose={() => setEditing(null)} onSave={(payload) => { onEdit(editing, payload); setEditing(null); }} />
    <ConfirmDialog open={Boolean(confirm)} title={confirm?.type === 'delete' ? 'Eliminar espacio' : 'Deshabilitar espacio'} description={confirm?.type === 'delete' ? `Se conservará ${confirm?.space.nombre} como registro eliminado y dejará de contar en disponibilidad.` : `${confirm?.space.nombre} seguirá activo, pero no estará disponible.`} confirmLabel={confirm?.type === 'delete' ? 'Eliminar lógicamente' : 'Deshabilitar'} danger pending={pending} onCancel={() => setConfirm(null)} onConfirm={executeConfirm} />
  </section>;
};
