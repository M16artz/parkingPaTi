import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ChevronDown, 
  Check, 
  Car, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Users,
  Building2,
  MapPin,
  Phone,
  ShieldCheck
} from 'lucide-react';

const STATUS_OPTIONS = [
  { 
    id: 'ABIERTO', 
    label: 'ABIERTO', 
    dotColor: 'bg-emerald-500', 
    textColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-50 border-emerald-200' 
  },
  { 
    id: 'CERRADO', 
    label: 'CERRADO', 
    dotColor: 'bg-rose-500', 
    textColor: 'text-rose-700',
    badgeBg: 'bg-rose-50 border-rose-200' 
  },
  { 
    id: 'LLENO', 
    label: 'LLENO', 
    dotColor: 'bg-amber-500', 
    textColor: 'text-amber-700',
    badgeBg: 'bg-amber-50 border-amber-200' 
  },
  { 
    id: 'FUERA_DE_SERVICIO', 
    label: 'FUERA DE SERVICIO', 
    dotColor: 'bg-slate-700', 
    textColor: 'text-slate-800',
    badgeBg: 'bg-slate-100 border-slate-300' 
  },
];

export const OwnerDashboardSummary = ({ 
  parqueadero = {}, 
  metrics = {}, 
  onStatusChange = () => {} 
}) => {
  const [selectedStatus, setSelectedStatus] = useState(STATUS_OPTIONS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Sincronizar el estado operativo si viene en las props
  useEffect(() => {
    if (parqueadero?.estado_operativo) {
      const current = STATUS_OPTIONS.find(
        (opt) => opt.id === parqueadero.estado_operativo
      );
      if (current) setSelectedStatus(current);
    }
  }, [parqueadero?.estado_operativo]);

  const handleSelectStatus = (option) => {
    setSelectedStatus(option);
    setIsDropdownOpen(false);
    onStatusChange(option.id);
  };

  // Formatear dirección dinámicamente con fallbacks
  const getDireccionTexto = () => {
    if (typeof parqueadero?.direccion === 'string') return parqueadero.direccion;
    if (parqueadero?.direccion?.calle_principal) {
      return `${parqueadero.direccion.calle_principal}${
        parqueadero.direccion.calle_secundaria ? ` y ${parqueadero.direccion.calle_secundaria}` : ''
      }`;
    }
    return 'Dirección no especificada';
  };

  const parkingInfo = {
    nombre: parqueadero?.nombre || 'Estacionamiento',
    direccion: getDireccionTexto(),
    telefono: parqueadero?.telefono || 'No registrado',
    capacidad: parqueadero?.capacidad_total || 0,
    horario: parqueadero?.horario_atencion || 'Consultar horario',
    estadoAdmin: parqueadero?.habilitacion_estado || 'PENDIENTE',
  };

  const currentMetrics = {
    libres: metrics?.libres ?? 0,
    ocupados: metrics?.ocupados ?? 0,
    estanciasHoy: metrics?.estanciasHoy ?? 0,
    ingresosHoy: metrics?.ingresosHoy ?? '$0.00',
  };

  return (
    <div className="space-y-6 font-sans select-none pb-8">

      {/* ================================================================== */}
      {/* BLOQUE 1: ESTADO DE DISPONIBILIDAD                                 */}
      {/* ================================================================== */}
      <section className="bg-[#e2f2fe] rounded-[28px] p-6 sm:p-8 shadow-sm border border-blue-100/60">
        <div className="flex items-center gap-2.5 mb-5 text-slate-700">
          <Activity size={20} className="text-blue-600 stroke-[2.5]" />
          <h2 className="text-sm font-black tracking-wider uppercase font-headline">
            ESTADO DE DISPONIBILIDAD
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-50 flex flex-wrap items-center justify-between gap-4 relative">
          <div>
            <h3 className="text-sm font-black text-slate-800">Estado en vivo</h3>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              Los conductores verán este estado inmediatamente en el mapa de la app.
            </p>
          </div>

          {/* Selector de Estado */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-56 h-11 px-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between shadow-xs hover:border-slate-300 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-3 h-3 rounded-full ${selectedStatus.dotColor}`} />
                <span className={`text-xs font-black tracking-wide ${selectedStatus.textColor}`}>
                  {selectedStatus.label}
                </span>
              </div>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Menú Desplegable */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl border border-slate-100 shadow-xl z-30 p-2 space-y-1">
                {STATUS_OPTIONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectStatus(item)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-xs font-black text-slate-700"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-3 h-3 rounded-full ${item.dotColor}`} />
                      <span className={item.textColor}>{item.label}</span>
                    </div>
                    {selectedStatus.id === item.id && (
                      <Check size={16} className="text-blue-600 stroke-[2.5]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* BLOQUE 2: MÉTRICAS DEL DÍA                                        */}
      {/* ================================================================== */}
      <section className="bg-[#e2f2fe] rounded-[28px] p-6 sm:p-8 shadow-sm border border-blue-100/60">
        <div className="flex items-center gap-2.5 mb-5 text-slate-700">
          <TrendingUp size={20} className="text-blue-600 stroke-[2.5]" />
          <h2 className="text-sm font-black tracking-wider uppercase font-headline">
            MÉTRICAS DEL DÍA
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-50 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Disponibles
              </span>
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 size={16} />
              </span>
            </div>
            <p className="text-2xl font-black text-slate-800">{currentMetrics.libres}</p>
            <p className="text-[11px] font-semibold text-emerald-600 mt-1">Lugares desocupados</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-50 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Ocupados
              </span>
              <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <Car size={16} />
              </span>
            </div>
            <p className="text-2xl font-black text-slate-800">{currentMetrics.ocupados}</p>
            <p className="text-[11px] font-semibold text-rose-600 mt-1">Vehículos estacionados</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-50 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Estancias
              </span>
              <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Users size={16} />
              </span>
            </div>
            <p className="text-2xl font-black text-slate-800">{currentMetrics.estanciasHoy}</p>
            <p className="text-[11px] font-semibold text-blue-600 mt-1">Servicios atendidos hoy</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-50 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Ingresos Estimados
              </span>
              <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <DollarSign size={16} />
              </span>
            </div>
            <p className="text-2xl font-black text-slate-800">{currentMetrics.ingresosHoy}</p>
            <p className="text-[11px] font-semibold text-amber-600 mt-1">Recaudado hoy</p>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* BLOQUE 3: INFORMACIÓN Y UBICACIÓN DEL PARQUEADERO                  */}
      {/* ================================================================== */}
      <section className="bg-[#e2f2fe] rounded-[28px] p-6 sm:p-8 shadow-sm border border-blue-100/60">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
          <div className="flex items-center gap-2.5 text-slate-700">
            <Building2 size={20} className="text-blue-600 stroke-[2.5]" />
            <h2 className="text-sm font-black tracking-wider uppercase font-headline">
              INFORMACIÓN Y UBICACIÓN
            </h2>
          </div>

          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-black px-3.5 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" />
            {parkingInfo.estadoAdmin}
          </span>
        </div>

        {/* Tarjeta Interna Blanca */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Nombre */}
            <div>
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Building2 size={13} className="text-blue-500" />
                Nombre Comercial
              </label>
              <p className="text-sm font-black text-slate-800 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                {parkingInfo.nombre}
              </p>
            </div>

            {/* Dirección */}
            <div className="lg:col-span-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <MapPin size={13} className="text-blue-500" />
                Dirección Registrada
              </label>
              <p className="text-sm font-bold text-slate-800 bg-slate-50/70 p-3 rounded-xl border border-slate-100 truncate">
                {parkingInfo.direccion}
              </p>
            </div>

            {/* Capacidad */}
            <div>
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Car size={13} className="text-blue-500" />
                Capacidad
              </label>
              <p className="text-sm font-black text-blue-900 bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                {parkingInfo.capacidad} Espacios Totales
              </p>
            </div>

            {/* Teléfono */}
            <div>
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Phone size={13} className="text-blue-500" />
                Teléfono de Contacto
              </label>
              <p className="text-sm font-bold text-slate-800 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                {parkingInfo.telefono}
              </p>
            </div>

            {/* Horario */}
            <div>
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Clock size={13} className="text-blue-500" />
                Horario de Atención
              </label>
              <p className="text-sm font-bold text-slate-800 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                {parkingInfo.horario}
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default OwnerDashboardSummary;