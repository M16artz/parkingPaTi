import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, LayoutGrid, Plus, Car, Play, Eye, Pencil, RotateCcw, Trash2, Ban, X } from 'lucide-react';
import { obtenerEspaciosReversibles } from '../../../utils/ownerConfiguration';
import { tarifaAplicadaEspacio } from '../../../utils/stay';

export const SpaceGrid = ({
  spaces = [],
  deletedSpaces = [],
  onAddSpaces = () => {},
  onDeleteSpace = () => {},
  onReactivateSpace = () => {},
  onToggleDisable = () => {},
  onEditSpace = () => {},
  onStartSession = () => {},
  onViewStay = () => {},
}) => {
  const [quantityToAdd, setQuantityToAdd] = useState(1);
  const [confirmation, setConfirmation] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!deletedSpaces.some((space) => space.deletedAt)) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [deletedSpaces]);

  const requestConfirmation = (options) => setConfirmation(options);
  const confirmAction = () => {
    confirmation?.onConfirm();
    setConfirmation(null);
  };

  // Manejar adición de plazas enviando la cantidad al manejador padre/API
  const handleAddSpaces = () => {
    const qty = parseInt(quantityToAdd, 10);
    if (isNaN(qty) || qty <= 0) return;
    requestConfirmation({
      title: 'Agregar espacios',
      message: `¿Confirmas que deseas agregar ${qty} ${qty === 1 ? 'espacio' : 'espacios'}?`,
      confirmLabel: 'Sí, agregar',
      onConfirm: () => {
        onAddSpaces(qty);
        setQuantityToAdd(1);
      },
    });
  };

  const visibleDeletedSpaces = obtenerEspaciosReversibles(deletedSpaces, now);

  // Contadores
  const countLibres = spaces.filter((s) => s?.estado === 'LIBRE').length;
  const countOcupados = spaces.filter((s) => s?.estado === 'OCUPADO').length;
  const countInhabilitados = spaces.filter((s) => s?.estado === 'INHABILITADO').length;

  return (
    /* CONTENEDOR PRINCIPAL: Única sección Celeste Pastel */
    <section className="bg-[#e2f2fe] rounded-[28px] p-6 sm:p-8 shadow-sm border border-blue-100/60 font-sans select-none">
      
      {/* ENCABEZADO PRINCIPAL */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <LayoutGrid className="text-blue-600 w-5 h-5" />
          <div>
            <h2 className="text-base font-black tracking-wider text-slate-800 uppercase font-headline">
              DISTRIBUCIÓN DE ESPACIOS
            </h2>
          </div>
        </div>
      </div>

      {/* TARJETA BLANCA INTERNA */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-50 space-y-6">
        
        {/* BARRA DE ESTADOS Y CONTROL DE AGREGAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          
          {/* Píldoras de Estado */}
          <div className="flex items-center gap-2 text-xs font-extrabold">
            <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100/80">
              {countLibres} libres
            </span>
            <span className="bg-rose-50 text-rose-700 px-3 py-1.5 rounded-xl border border-rose-100/80">
              {countOcupados} ocupados
            </span>
            <span className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl border border-amber-100/80">
              {countInhabilitados} inhabilitados
            </span>
          </div>

          {/* Agregar espacios */}
          <div className="bg-slate-50 p-1.5 pl-3 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              CANTIDAD
            </span>
            <input
              type="number"
              min="1"
              value={quantityToAdd}
              onChange={(e) => setQuantityToAdd(e.target.value)}
              className="w-12 h-8 rounded-xl border border-slate-200 bg-white text-center font-extrabold text-xs text-slate-700 outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleAddSpaces}
              className="bg-[#2b62d9] hover:bg-[#1f4bb3] text-white text-xs font-bold px-4 h-8 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Plus size={14} />
              <span>Agregar espacios</span>
            </button>
          </div>
        </div>

        {/* GRILLA DE ESPACIOS */}
        {spaces.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              No hay espacios registrados actualmente
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {spaces.map((space) => {
              const isLibre = space.estado === 'LIBRE';
              const isOcupado = space.estado === 'OCUPADO';
              const isInhabilitado = space.estado === 'INHABILITADO';

              return (
                <div
                  key={space.id || space.code}
                  className={`bg-white rounded-2xl p-5 border-2 shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                    isLibre
                      ? 'border-emerald-400/80'
                      : isOcupado
                      ? 'border-rose-400/80'
                      : 'border-amber-300'
                  }`}
                >
                  {/* Cabecera */}
                  <div className="flex justify-between items-start">
                    <Car
                      className={`w-5 h-5 ${
                        isLibre
                          ? 'text-emerald-500'
                          : isOcupado
                          ? 'text-rose-500'
                          : 'text-amber-500'
                      }`}
                    />
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isLibre
                          ? 'bg-emerald-100/80 text-emerald-700'
                          : isOcupado
                          ? 'bg-rose-100/80 text-rose-700'
                          : 'bg-amber-100/80 text-amber-700'
                      }`}
                    >
                      {space.estado}
                    </span>
                  </div>

                  {/* Código y Tarifa */}
                  <div>
                    <h3 className="text-xl font-black text-slate-800">
                      {space.nombre || space.code || `Espacio ${space.id}`}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 mt-0.5">
                      Tarifa: {tarifaAplicadaEspacio(space) || 'Sin configurar'}
                    </p>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex items-center gap-2 pt-1">
                    {isLibre && (
                      <>
                        <button
                          type="button"
                          onClick={() => onStartSession(space)}
                          className="flex-1 bg-emerald-100/70 hover:bg-emerald-200/70 text-emerald-800 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        >
                          <Play size={13} />
                          Iniciar
                        </button>
                        <button
                          type="button"
                          onClick={() => requestConfirmation({
                            title: 'Inhabilitar espacio',
                            message: `¿Deseas inhabilitar ${space.nombre || space.code}? No podrá recibir vehículos hasta que lo reactives.`,
                            confirmLabel: 'Sí, inhabilitar',
                            tone: 'amber',
                            onConfirm: () => onToggleDisable(space.id),
                          })}
                          className="p-2 text-slate-400 hover:text-amber-600 rounded-xl hover:bg-amber-50 border border-slate-100 transition-all cursor-pointer"
                          title="Inhabilitar espacio"
                        >
                          <Ban size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => requestConfirmation({
                            title: 'Marcar como no disponible',
                            message: `¿Deseas retirar ${space.nombre || space.code}? Tendrás 15 segundos para revertir esta acción.`,
                            confirmLabel: 'Sí, retirar',
                            danger: true,
                            onConfirm: () => onDeleteSpace(space.id),
                          })}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 border border-slate-100 transition-all cursor-pointer"
                          title="Eliminar espacio"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}

                    {isOcupado && (
                      <button
                        type="button"
                        onClick={() => onViewStay(space)}
                        className="w-full bg-rose-100/70 hover:bg-rose-200/70 text-rose-800 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      >
                        <Eye size={13} />
                        Ver Estancia
                      </button>
                    )}

                    {isInhabilitado && (
                      <>
                        <button
                          type="button"
                          onClick={() => requestConfirmation({
                            title: 'Reactivar espacio',
                            message: `¿Deseas reactivar ${space.nombre || space.code}? Volverá a estar disponible para recibir vehículos.`,
                            confirmLabel: 'Sí, reactivar',
                            tone: 'amber',
                            onConfirm: () => onToggleDisable(space.id),
                          })}
                          className="flex-1 bg-amber-100/70 hover:bg-amber-200/70 text-amber-800 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        >
                          <RotateCcw size={13} />
                          Reactivar
                        </button>
                        <button
                          type="button"
                          onClick={() => requestConfirmation({
                            title: 'Marcar como no disponible',
                            message: `¿Deseas retirar ${space.nombre || space.code}? Tendrás 15 segundos para revertir esta acción.`,
                            confirmLabel: 'Sí, retirar',
                            danger: true,
                            onConfirm: () => onDeleteSpace(space.id),
                          })}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 border border-slate-100 transition-all cursor-pointer"
                          title="Eliminar espacio"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => onEditSpace(space)}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 transition-all hover:bg-blue-100 hover:text-blue-800 active:scale-95"
                      title={`Editar nombre de ${space.nombre || space.code}`}
                      aria-label={`Editar nombre de ${space.nombre || space.code}`}
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ESPACIOS ELIMINADOS */}
        {visibleDeletedSpaces.length > 0 && (
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Trash2 size={14} className="text-slate-400" />
              <span className="text-xs font-extrabold text-slate-600">Inoperativos</span>
              <span className="bg-slate-100 text-slate-600 text-[11px] font-black px-2 py-0.5 rounded-full">
                {visibleDeletedSpaces.length}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              {visibleDeletedSpaces.map((delItem) => (
                <div
                  key={delItem.id || delItem.code}
                  className="bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2.5 flex items-center gap-4"
                >
                  <div>
                    <span className="text-xs font-black text-slate-800 block">{delItem.code}</span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      Espacio no disponible · {delItem.remaining}s para revertir
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onReactivateSpace(delItem.id)}
                    className="bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <RotateCcw size={12} />
                    Revertir
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {confirmation && createPortal(
        <div className="fixed inset-0 z-[1200] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <section
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="space-confirmation-title"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
              <div className="flex gap-3">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                  confirmation.tone === 'amber'
                    ? 'bg-amber-100 text-amber-700'
                    : confirmation.danger
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-blue-100 text-blue-700'
                }`}>
                  <AlertTriangle size={21} />
                </span>
                <div>
                  <h2 id="space-confirmation-title" className="text-lg font-black text-slate-900">
                    {confirmation.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{confirmation.message}</p>
                </div>
              </div>
              <button type="button" aria-label="Cerrar" onClick={() => setConfirmation(null)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            <div className="flex justify-end gap-3 bg-slate-50 px-6 py-4">
              <button type="button" onClick={() => setConfirmation(null)} className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 font-bold text-slate-700">
                Cancelar
              </button>
              <button type="button" onClick={confirmAction} className={`min-h-11 rounded-xl px-5 font-bold text-white ${
                confirmation.tone === 'amber'
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : confirmation.danger
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-blue-600 hover:bg-blue-700'
              }`}>
                {confirmation.confirmLabel}
              </button>
            </div>
          </section>
        </div>,
        document.body,
      )}
    </section>
  );
};

export default SpaceGrid;
