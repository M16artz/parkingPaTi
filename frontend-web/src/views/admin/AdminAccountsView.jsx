import React, { useState, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, UserX, UserCheck, ChevronLeft, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import { adminService } from '../../services/adminService';

const normalizarCuenta = (item) => ({
  ...item,
  nombre: `${item.persona?.nombre || ''} ${item.persona?.apellido || ''}`.trim(),
  activa: item.is_active,
  rol: 'PROPIETARIO',
});

// 🎨 COMBOBOX DE ROLES CON INDICADORES DE COLOR
const RolCombobox = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const opciones = [
    { id: '', label: 'TODOS LOS ROLES', dotBg: 'bg-slate-400', textColor: 'text-slate-700' },
    { id: 'PROPIETARIO', label: 'PROPIETARIO', dotBg: 'bg-blue-500', textColor: 'text-blue-700' },
    { id: 'CONDUCTOR', label: 'CONDUCTOR', dotBg: 'bg-indigo-500', textColor: 'text-indigo-700' },
    { id: 'ADMINISTRADOR', label: 'ADMINISTRADOR', dotBg: 'bg-amber-500', textColor: 'text-amber-700' },
  ];

  const seleccionada = opciones.find((opt) => opt.id === value) || opciones[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full sm:w-auto" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-xs transition-all hover:shadow-sm cursor-pointer select-none sm:w-auto sm:rounded-full"
      >
        <span className={`w-3 h-3 rounded-full ${seleccionada.dotBg} shrink-0`} />
        <span className={`text-xs font-extrabold tracking-wider uppercase ${seleccionada.textColor}`}>
          {seleccionada.label}
        </span>
        <ChevronDown
          size={14}
          className={`text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100/80 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          {opciones.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                onChange(opt.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer text-left hover:bg-slate-50 ${
                value === opt.id ? 'bg-slate-50/80' : ''
              }`}
            >
              <span className={`w-3 h-3 rounded-full ${opt.dotBg} shrink-0`} />
              <span className={opt.textColor}>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const AdminAccountsView = ({ accountsList, onToggleStatus }) => {
  const [cuentas, setCuentas] = useState(accountsList || []);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [rol, setRol] = useState('');

  // 🛡️ Petición protegida si las cuentas no vienen por props
  useEffect(() => {
    if (accountsList) {
      setCuentas(accountsList);
      return;
    }

    const fetchCuentas = async () => {
      setLoading(true);
      try {
        const data = await adminService.listarCuentas({});
        setCuentas((data.results || data).map(normalizarCuenta));
      } catch (error) {
        console.error('Error al cargar cuentas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCuentas();
  }, [accountsList]);

  // 🛡️ Cambiar estado de la cuenta con petición HTTP protegida
  const toggleEstado = async (id, estadoActual) => {
    if (onToggleStatus) {
      onToggleStatus(id);
      return;
    }

    try {
      if (estadoActual) await adminService.deshabilitar(id);
      else await adminService.rehabilitar(id);
      setCuentas((prev) =>
        prev.map((acc) => (acc.id === id ? { ...acc, activa: !acc.activa } : acc))
      );
    } catch (error) {
      console.error('Error al cambiar el estado de la cuenta:', error);
    }
  };

  const filtradas = cuentas.filter((item) => {
    const matchRol = rol === '' || item.rol === rol;
    const matchSearch =
      (item.nombre || '').toLowerCase().includes(q.toLowerCase()) ||
      (item.correo || '').toLowerCase().includes(q.toLowerCase());
    return matchRol && matchSearch;
  });

  return (
    <div className="space-y-5 font-sans antialiased">
      {/* FILTROS SUPERIORES */}
      <div className="bg-[#edf4fc] rounded-[24px] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-blue-100/60">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#3262ec] shadow-xs shrink-0">
            <SlidersHorizontal size={18} />
          </div>
          <div>
            <h2 className="text-xs font-black tracking-wider text-slate-800 uppercase font-headline">
              GESTIÓN Y BAJA DE CUENTAS
            </h2>
            <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
              Busca usuarios e inactívalos en el sistema.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end md:w-auto">
          {/* COMBOBOX DE ROL */}
          <div className="flex w-full flex-col gap-1.5 sm:w-auto">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">ROL</span>
            <RolCombobox value={rol} onChange={setRol} />
          </div>

          {/* BUSCADOR */}
          <div className="flex w-full flex-col gap-1.5 sm:flex-1 md:w-72 md:flex-initial">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <Search size={12} /> BUSCAR
            </span>
            <div className="relative w-full">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Nombre o correo..."
                className="w-full bg-white border border-slate-200 text-xs font-bold text-slate-700 pl-8 pr-4 py-2 rounded-full shadow-xs outline-none placeholder:text-slate-400"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* CONTENEDOR DE LA TABLA */}
      <div className="bg-[#edf4fc] rounded-[28px] p-4 sm:p-6 border border-blue-100/60">
        <div className="overflow-hidden rounded-[20px] bg-white p-3 shadow-xs sm:p-6">
          <div className="space-y-3 md:hidden">
            {loading ? (
              <div className="flex min-h-32 items-center justify-center gap-2 text-sm font-bold text-slate-500">
                <Loader2 size={18} className="animate-spin text-[#3262ec]" /> Cargando cuentas...
              </div>
            ) : filtradas.length === 0 ? (
              <p className="py-10 text-center text-xs font-bold uppercase text-slate-500">
                No se encontraron usuarios
              </p>
            ) : filtradas.map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-black text-slate-900">{item.nombre}</h3>
                    <p className="truncate text-xs font-semibold text-slate-500">{item.correo}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-700">
                    {item.rol}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  {item.activa ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-black text-emerald-700">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> ACTIVA
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-black text-rose-700">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> INACTIVA
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleEstado(item.id, item.activa)}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-xs font-black ${
                      item.activa ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {item.activa ? <UserX size={16} /> : <UserCheck size={16} />}
                    {item.activa ? 'Dar de baja' : 'Reactivar'}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[650px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="pb-4 pl-2">USUARIO</th>
                <th className="pb-4">ROL</th>
                <th className="pb-4">ESTADO</th>
                <th className="pb-4 text-right pr-2">ACCIÓN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-10">
                    <div className="inline-flex items-center gap-2 text-slate-500 text-xs font-bold">
                      <Loader2 size={16} className="animate-spin text-[#3262ec]" /> Cargando cuentas...
                    </div>
                  </td>
                </tr>
              ) : filtradas.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-xs font-bold text-slate-500 uppercase">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                filtradas.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-5 pl-2">
                      <span className="block text-xs font-black text-slate-800 tracking-tight">
                        {item.nombre}
                      </span>
                      <span className="block text-[11px] font-semibold text-slate-500">
                        {item.correo}
                      </span>
                    </td>
                    <td className="py-5">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 font-extrabold text-[10px] uppercase rounded-full border border-slate-200/50">
                        {item.rol}
                      </span>
                    </td>
                    <td className="py-5">
                      {item.activa ? (
                        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-[11px] font-black uppercase tracking-wider">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                          ACTIVA
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-rose-50 border border-rose-200 rounded-full text-rose-700 text-[11px] font-black uppercase tracking-wider">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                          INACTIVA
                        </span>
                      )}
                    </td>
                    <td className="py-5 text-right pr-2">
                      {item.activa ? (
                        <button
                          type="button"
                          onClick={() => toggleEstado(item.id, item.activa)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-xs rounded-full border border-rose-200 transition-all cursor-pointer"
                        >
                          <UserX size={14} />
                          <span>Dar de baja</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleEstado(item.id, item.activa)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-black text-xs rounded-full border border-emerald-200 transition-all cursor-pointer"
                        >
                          <UserCheck size={14} />
                          <span>Reactivar</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>

          {/* PAGINACIÓN */}
          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 text-xs font-bold text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
            <span>
              Mostrando <strong className="text-slate-900 font-black">{filtradas.length}</strong> registros
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-black text-slate-800">Página 1</span>
              <button
                type="button"
                className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
