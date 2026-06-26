// ============================================================================
// 1. IMPORTACIONES
// ============================================================================
import React, { useState } from 'react';
import { Save, Clock, DollarSign, Activity, ChevronDown, Check } from 'lucide-react';
import { Input } from '../Input';
import { Button } from '../Button';

export const OwnerConfigGeneral = () => {
  // --- ESTADOS PARA 1. HORARIOS DE ATENCIÓN (Cada día de la semana independiente) ---
  const [horarios, setHorarios] = useState({
    lunes:     { inicio: '07:00', fin: '22:00', activo: true,  label: 'Lunes' },
    martes:    { inicio: '07:00', fin: '22:00', activo: true,  label: 'Martes' },
    miercoles: { inicio: '07:00', fin: '22:00', activo: true,  label: 'Miércoles' },
    jueves:    { inicio: '07:00', fin: '22:00', activo: true,  label: 'Jueves' },
    viernes:   { inicio: '07:00', fin: '22:00', activo: true,  label: 'Viernes' },
    sabado:    { inicio: '08:00', fin: '20:00', activo: true,  label: 'Sábado' },
    domingo:   { inicio: '09:00', fin: '18:00', activo: false, label: 'Domingo' }
  });

  // --- ESTADOS PARA 2. TARIFAS ---
  const [tarifas, setTarifas] = useState({
    general: '1.00',
    descuento: '0.50',
    grandes: '1.50'
  });

  // --- ESTADOS PARA 3. DISPONIBILIDAD (ENUM) ---
  const [disponibilidad, setDisponibilidad] = useState('ABIERTO');
  const [isOpenEnumMenu, setIsOpenEnumMenu] = useState(false);

  const enumOptions = [
    { value: 'ABIERTO', label: '🟢 ABIERTO', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { value: 'CERRADO', label: '🔴 CERRADO', color: 'text-rose-700 bg-rose-50 border-rose-200' },
    { value: 'LLENO', label: '🟠 LLENO', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { value: 'FUERA DE SERVICIO', label: '⚫ FUERA DE SERVICIO', color: 'text-slate-700 bg-slate-50 border-slate-200' }
  ];

  const currentEnum = enumOptions.find(opt => opt.value === disponibilidad) || enumOptions[0];

  const handleDayChange = (diaKey, campo, valor) => {
    setHorarios(prev => ({
      ...prev,
      [diaKey]: {
        ...prev[diaKey],
        [campo]: valor
      }
    }));
  };

  const handleSaveConfig = () => {
    const configData = { horarios, tarifas, disponibilidad };
    console.log("Guardando Configuración General:", configData);
    alert("¡Configuración general guardada exitosamente!");
  };

  return (
    <div 
      className={
        "w-full " + 
        "max-w-[98%] " +         // Se expande al máximo dejando solo un centímetro por lado
        "mx-auto " + 
        "flex " + 
        "flex-col " + 
        "gap-8 " + 
        "text-left " + 
        "animate-fadeIn"
      }
    >
      
      {/* ================================================================= */}
      {/* SECCIÓN 1: ESTADO DE DISPONIBILIDAD                               */}
      {/* ================================================================= */}
      <div 
        className={
          "bg-bg " + 
          "p-10 " + 
          "rounded-[32px] " + 
          "space-y-6 " + 
          "border " + 
          "border-slate-100"
        }
      >
        <div className="flex items-center gap-3.5 pb-3 border-b border-slate-200/60">
          <Activity size={24} className="text-primary shrink-0" />
          <h2 className="text-xl font-black text-slate-800 font-headline uppercase tracking-wide">Estado de Disponibilidad</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 pt-2">
          <div className="lg:col-span-4 space-y-1">
            <label className="block text-lg font-bold text-slate-700 font-body">Estado en vivo</label>
            <p className="text-sm text-slate-400 font-body leading-relaxed">Los conductores verán este estado inmediatamente en el mapa de la app.</p>
          </div>

          {/* Combobox estilo Tipo de Identificación Premium */}
          <div className="lg:col-span-8 relative">
            <button
              type="button"
              onClick={() => setIsOpenEnumMenu(!isOpenEnumMenu)}
              className={
                "w-full " + 
                "py-4 " + 
                "px-6 " + 
                "bg-white " + 
                "border " + 
                "border-slate-200 " + 
                "rounded-2xl " + 
                "font-bold " + 
                "text-base " + 
                "text-slate-700 " + 
                "shadow-sm " + 
                "flex " + 
                "items-center " + 
                "justify-between " + 
                "cursor-pointer " + 
                "transition-all " + 
                "hover:border-slate-300 " + 
                "focus:outline-none"
              }
            >
              <div className="flex items-center gap-3">
                <span className={
                  "px-4 " + 
                  "py-1.5 " + 
                  "text-sm " + 
                  "rounded-full " + 
                  "border " + 
                  "font-black " + 
                  currentEnum.color
                }>
                  {currentEnum.label}
                </span>
              </div>
              <ChevronDown 
                size={20} 
                className={
                  "text-slate-400 " + 
                  "transition-transform " + 
                  "duration-300 " + 
                  (isOpenEnumMenu ? 'rotate-180' : '')
                } 
              />
            </button>

            {/* Menú desplegable flotante premium */}
            {isOpenEnumMenu && (
              <div 
                className={
                  "absolute " + 
                  "left-0 " + 
                  "right-0 " + 
                  "mt-2 " + 
                  "bg-white " + 
                  "border " + 
                  "border-slate-200 " + 
                  "rounded-2xl " + 
                  "shadow-[0_20px_50px_rgba(0,0,0,0.1)] " + 
                  "z-50 " + 
                  "overflow-hidden " + 
                  "p-2 " + 
                  "space-y-1 " + 
                  "animate-slideUp"
                }
              >
                {enumOptions.map((option) => {
                  const isSelected = disponibilidad === option.value;
                  return (
                    <div 
                      key={option.value} 
                      onClick={() => { setDisponibilidad(option.value); setIsOpenEnumMenu(false); }} 
                      className={
                        "px-4 " + 
                        "py-3.5 " + 
                        "rounded-xl " + 
                        "flex " + 
                        "items-center " + 
                        "justify-between " + 
                        "cursor-pointer " + 
                        "transition-all " + 
                        "font-body " + 
                        (isSelected 
                          ? 'bg-slate-50 text-primary font-black' 
                          : 'text-slate-600 hover:bg-slate-50/80 font-bold')
                      }
                    >
                      <span className="text-base tracking-wide">{option.label}</span>
                      {isSelected && <Check size={18} className="text-primary" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* SECCIÓN 2: HORARIOS DE ATENCIÓN DETALLADOS POR DÍA                */}
      {/* ================================================================= */}
      <div 
        className={
          "bg-bg " + 
          "p-10 " + 
          "rounded-[32px] " + 
          "space-y-6 " + 
          "border " + 
          "border-slate-100"
        }
      >
        <div className="flex items-center gap-3.5 pb-3 border-b border-slate-200/60">
          <Clock size={24} className="text-primary shrink-0" />
          <h2 className="text-xl font-black text-slate-800 font-headline uppercase tracking-wide">Horarios de Operación</h2>
        </div>

        <p className="text-base text-slate-500 font-body">Activa o desactiva de forma individual cada día de la semana y configura sus respectivas horas de atención.</p>

        <div className="space-y-4 pt-2">
          {Object.keys(horarios).map((key) => {
            const dia = horarios[key];
            return (
              <div 
                key={key}
                className={
                  "p-6 " + 
                  "rounded-2xl " + 
                  "border " + 
                  "flex " + 
                  "flex-col " + 
                  "md:flex-row " + 
                  "md:items-center " + 
                  "justify-between " + 
                  "gap-6 " + 
                  "transition-all " + 
                  (dia.activo 
                    ? 'bg-white border-slate-200 shadow-[0_4px_12px_rgba(0,0,0,0.02)]' 
                    : 'bg-white/50 border-slate-100 opacity-60')
                }
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={dia.activo} 
                      onChange={(e) => handleDayChange(key, 'activo', e.target.checked)} 
                      className="rounded-lg text-primary focus:ring-primary h-5 w-5 border-slate-300 cursor-pointer" 
                    />
                    <span className="text-xl font-bold text-slate-800 font-body block">{dia.label}</span>
                  </div>
                  <span className="text-sm text-slate-400 font-body block">
                    {dia.activo ? 'Establece las horas de atención' : 'Marcado como cerrado todo el día'}
                  </span>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                  <Input 
                    type="time" 
                    disabled={!dia.activo} 
                    value={dia.inicio} 
                    onChange={(e) => handleDayChange(key, 'inicio', e.target.value)} 
                    className="!w-44 !py-3 !text-lg !font-bold !text-center disabled:bg-slate-100 bg-white" 
                  />
                  <span className="text-slate-400 font-bold font-body text-base px-1">hasta las</span>
                  <Input 
                    type="time" 
                    disabled={!dia.activo} 
                    value={dia.fin} 
                    onChange={(e) => handleDayChange(key, 'fin', e.target.value)} 
                    className="!w-44 !py-3 !text-lg !font-bold !text-center disabled:bg-slate-100 bg-white" 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================================================================= */}
      {/* SECCIÓN 3: TARIFAS POR HORA                                       */}
      {/* ================================================================= */}
      <div 
        className={
          "bg-bg " + 
          "p-10 " + 
          "rounded-[32px] " + 
          "space-y-6 " + 
          "border " + 
          "border-slate-100"
        }
      >
        <div className="flex items-center gap-3.5 pb-3 border-b border-slate-200/60">
          <DollarSign size={24} className="text-primary shrink-0" />
          <h2 className="text-xl font-black text-slate-800 font-headline uppercase tracking-wide">Estructura Tarifaria</h2>
        </div>

        <p className="text-base text-slate-500 font-body">Configura el valor correspondiente al cobro por hora o fracción de permanencia.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_4px_12px_rgba(0,0,0,0.02)] space-y-3">
            <span className="text-xs font-black tracking-wider uppercase text-slate-400 font-label">Estándar</span>
            <Input label="Tarifa General por Hora ($)" type="number" step="0.01" value={tarifas.general} onChange={(e) => setTarifas({ ...tarifas, general: e.target.value })} placeholder="1.00" className="!max-w-full !text-xl !font-bold !py-3.5 bg-white" />
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_4px_12px_rgba(0,0,0,0.02)] space-y-3">
            <span className="text-xs font-black tracking-wider uppercase text-blue-500 font-label">Preferencial</span>
            <Input label="Tercera Edad / Discapacidad ($)" type="number" step="0.01" value={tarifas.descuento} onChange={(e) => setTarifas({ ...tarifas, descuento: e.target.value })} placeholder="0.50" className="!max-w-full !text-xl !font-bold !py-3.5 bg-white" />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_4px_12px_rgba(0,0,0,0.02)] space-y-3">
            <span className="text-xs font-black tracking-wider uppercase text-amber-600 font-label">Pesados</span>
            <Input label="Vehículos Grandes / 4x4 ($)" type="number" step="0.01" value={tarifas.grandes} onChange={(e) => setTarifas({ ...tarifas, grandes: e.target.value })} placeholder="1.50" className="!max-w-full !text-xl !font-bold !py-3.5 bg-white" />
          </div>
        </div>
      </div>

      {/* BOTÓN MAESTRO INFERIOR DE ACCIÓN GLOBAL */}
      <div className="flex justify-end mt-4">
        <Button 
          variant="primary"
          onClick={handleSaveConfig}
          className={
            "w-full " + 
            "sm:w-auto " + 
            "px-16 " + 
            "py-4.5 " + 
            "rounded-2xl " + 
            "font-bold " + 
            "font-label " + 
            "text-lg " + 
            "flex " + 
            "items-center " + 
            "justify-center " + 
            "gap-3 " + 
            "shadow-xl " + 
            "shadow-primary/20 " + 
            "hover:scale-[1.02] " + 
            "active:scale-95 " + 
            "transition-all"
          }
        >
          <Save size={20} /> Guardar Cambios del Sistema
        </Button>
      </div>

    </div>
  );
};