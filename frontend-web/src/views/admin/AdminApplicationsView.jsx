import React, { useState, useRef, useEffect } from 'react';
import { Search, Eye, SlidersHorizontal, ChevronLeft, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import { adminService } from '../../services/adminService';

const normalizarSolicitud = (item) => ({
  ...item,
  estado: item.onboarding_estado === 'REVISION_PENDIENTE'
    ? 'PENDIENTE'
    : item.onboarding_estado === 'RECHAZADO' ? 'RECHAZADO' : 'APROBADO',
  parqueadero: item.parqueadero_nombre,
  fecha: item.actualizada_en ? new Date(item.actualizada_en).toLocaleDateString('es-EC') : 'N/A',
  persona: { ...item.persona, correo: item.correo },
});

const EstadoCombobox = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const opciones = [
    { id: '', label: 'TODOS', dotBg: 'bg-slate-400', textColor: 'text-slate-700' },
    { id: 'PENDIENTE', label: 'PENDIENTE', dotBg: 'bg-amber-500', textColor: 'text-amber-700' },
    { id: 'APROBADO', label: 'APROBADO', dotBg: 'bg-emerald-500', textColor: 'text-emerald-700' },
    { id: 'RECHAZADO', label: 'RECHAZADO', dotBg: 'bg-rose-500', textColor: 'text-rose-700' },
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
        <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100/80 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
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

export const AdminApplicationsView = ({ applicationsList, onSelectSolicitud }) => {
  const [solicitudes, setSolicitudes] = useState(applicationsList || []);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('PENDIENTE');

  // 🛡️ Petición protegida si las solicitudes no vienen directamente por props
  useEffect(() => {
    if (applicationsList) {
      setSolicitudes(applicationsList);
      return;
    }

    const fetchSolicitudes = async () => {
      setLoading(true);
      try {
        const data = await adminService.listarSolicitudes({});
        setSolicitudes((data.results || data).map(normalizarSolicitud));
      } catch (error) {
        console.error('Error al cargar las solicitudes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudes();
  }, [applicationsList]);

  const filtrados = solicitudes.filter((item) => {
    const matchEstado = estado === '' || item.estado === estado;
    const nombre = item.persona?.nombre || '';
    const identificacion = item.persona?.identificacion || '';
    const parqueadero = item.parqueadero || '';

    const matchSearch =
      nombre.toLowerCase().includes(q.toLowerCase()) ||
      identificacion.includes(q) ||
      parqueadero.toLowerCase().includes(q.toLowerCase());

    return matchEstado && matchSearch;
  });

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PENDIENTE':
        return (
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-[11px] font-black uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            PENDIENTE
          </span>
        );
      case 'APROBADO':
        return (
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-[11px] font-black uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            APROBADO
          </span>
        );
      case 'RECHAZADO':
        return (
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-rose-50 border border-rose-200 rounded-full text-rose-700 text-[11px] font-black uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            RECHAZADO
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5 font-sans antialiased">
      {/* CÁPSULA SUPERIOR */}
      <div className="bg-[#edf4fc] rounded-[24px] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-blue-100/60">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#3262ec] shadow-xs shrink-0">
            <SlidersHorizontal size={18} />
          </div>
          <div>
            <h2 className="text-xs font-black tracking-wider text-slate-800 uppercase font-headline">
              GESTIÓN Y FILTRADO DE REVISIÓN
            </h2>
            <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
              Verifica la documentación del parqueadero antes de habilitarlo.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end md:w-auto">
          {/* ESTADO COMBOBOX */}
          <div className="flex w-full flex-col gap-1.5 sm:w-auto">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">ESTADO</span>
            <EstadoCombobox value={estado} onChange={setEstado} />
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
                placeholder="Nombre, cédula o parqueadero..."
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
                <Loader2 size={18} className="animate-spin text-[#3262ec]" /> Cargando solicitudes...
              </div>
            ) : filtrados.length === 0 ? (
              <p className="py-10 text-center text-xs font-bold uppercase text-slate-500">
                No se encontraron solicitudes
              </p>
            ) : filtrados.map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-black text-slate-900">{item.persona?.nombre || 'N/A'}</h3>
                    <p className="truncate text-xs font-semibold text-slate-500">{item.persona?.correo || 'N/A'}</p>
                  </div>
                  {renderStatusBadge(item.estado)}
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div><dt className="font-bold uppercase text-slate-400">Identificación</dt><dd className="mt-1 font-bold text-slate-700">{item.persona?.identificacion || 'N/A'}</dd></div>
                  <div><dt className="font-bold uppercase text-slate-400">Fecha</dt><dd className="mt-1 font-bold text-slate-700">{item.fecha || 'N/A'}</dd></div>
                  <div className="col-span-2"><dt className="font-bold uppercase text-slate-400">Parqueadero</dt><dd className="mt-1 font-black text-slate-800">{item.parqueadero || 'N/A'}</dd></div>
                </dl>
                <button
                  type="button"
                  onClick={() => onSelectSolicitud(item.id)}
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#3262ec] px-4 text-sm font-black text-white"
                >
                  <Eye size={16} /> Revisar solicitud
                </button>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="pb-4 pl-2">PROPIETARIO</th>
                <th className="pb-4">IDENTIFICACIÓN</th>
                <th className="pb-4">PARQUEADERO</th>
                <th className="pb-4">ESTADO</th>
                <th className="pb-4">FECHA</th>
                <th className="pb-4 text-right pr-2">ACCIÓN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10">
                    <div className="inline-flex items-center gap-2 text-slate-500 text-xs font-bold">
                      <Loader2 size={16} className="animate-spin text-[#3262ec]" /> Cargando solicitudes...
                    </div>
                  </td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-xs font-bold text-slate-500 uppercase">
                    No se encontraron solicitudes
                  </td>
                </tr>
              ) : (
                filtrados.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-5 pl-2">
                      <span className="block text-xs font-black text-slate-800 tracking-tight">
                        {item.persona?.nombre || 'N/A'}
                      </span>
                      <span className="block text-[11px] font-semibold text-slate-500">
                        {item.persona?.correo || 'N/A'}
                      </span>
                    </td>
                    <td className="py-5 text-xs font-bold text-slate-600">
                      {item.persona?.identificacion || 'N/A'}
                    </td>
                    <td className="py-5 text-xs font-black text-slate-800">
                      {item.parqueadero || 'N/A'}
                    </td>
                    <td className="py-5">
                      {renderStatusBadge(item.estado)}
                    </td>
                    <td className="py-5 text-xs font-semibold text-slate-500">
                      {item.fecha || 'N/A'}
                    </td>
                    <td className="py-5 text-right pr-2">
                      <button
                        type="button"
                        onClick={() => onSelectSolicitud(item.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#e8f1ff] hover:bg-blue-100 text-[#3262ec] font-black text-xs rounded-full border border-blue-200 transition-all cursor-pointer"
                      >
                        <Eye size={14} className="text-[#3262ec]" />
                        <span>Revisar</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>

          {/* PAGINACIÓN CON MAYOR VISIBILIDAD */}
          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 text-xs font-bold text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
            <span>
              Mostrando <strong className="text-slate-900 font-black">{filtrados.length}</strong> registros
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
