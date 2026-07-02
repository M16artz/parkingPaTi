import React, { useState } from 'react';
import { createPortal } from 'react-dom'; // 🌟 1. IMPORTAMOS EL PORTAL
import { Save, Clock, DollarSign, Activity, ChevronDown, Check, AlertTriangle, Copy } from 'lucide-react';
import { Input } from '../Input'; 
import { Button } from '../Button';
import { useOwnerConfigGController } from '../../../controllers/useOwnerConfigGController';

const SelectorHora24h = ({ value, onChange, disabled }) => {
  const [hora, minuto] = (value || "00:00").split(':');
  const horasOpciones = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutosOpciones = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <div className={`flex items-center gap-1.5 p-2 bg-white border border-slate-200 rounded-2xl shadow-sm transition-all ${disabled ? 'bg-slate-100 opacity-60' : 'hover:border-slate-300'}`}>
      <select
        disabled={disabled}
        value={hora}
        onChange={(e) => onChange(`${e.target.value}:${minuto}`)}
        className="bg-transparent text-lg font-black text-slate-700 focus:outline-none cursor-pointer disabled:cursor-not-allowed px-1"
      >
        {horasOpciones.map(h => <option key={h} value={h}>{h}</option>)}
      </select>
      <span className="text-slate-400 font-black text-lg select-none">:</span>
      <select
        disabled={disabled}
        value={minuto}
        onChange={(e) => onChange(`${hora}:${e.target.value}`)}
        className="bg-transparent text-lg font-black text-slate-700 focus:outline-none cursor-pointer disabled:cursor-not-allowed px-1"
      >
        {minutosOpciones.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
    </div>
  );
};

export const OwnerConfigGeneral = () => {
  const configCtrl = useOwnerConfigGController();
  const [isOpenEnumMenu, setIsOpenEnumMenu] = useState(false);

  const enumOptions = [
    { value: 'ABIERTO', label: '🟢 ABIERTO', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { value: 'CERRADO', label: '🔴 CERRADO', color: 'text-rose-700 bg-rose-50 border-rose-200' },
    { value: 'LLENO', label: '🟠 LLENO', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { value: 'FUERA DE SERVICIO', label: '⚫ FUERA DE SERVICIO', color: 'text-slate-700 bg-slate-50 border-slate-200' }
  ];

  const currentEnum = enumOptions.find(opt => opt.value === configCtrl.disponibilidad) || enumOptions[0];
  const esBotonMaestroHabilitado = configCtrl.maestroInicio && configCtrl.maestroFin;

  return (
    <div className="w-full max-w-[98%] mx-auto flex flex-col gap-8 text-left animate-fadeIn">
      
      {/* SECCIÓN 1: ESTADO DE DISPONIBILIDAD */}
      <div className="bg-bg p-10 rounded-[32px] space-y-6 border border-slate-100">
        <div className="flex items-center gap-3.5 pb-3 border-b border-slate-200/60">
          <Activity size={24} className="text-primary shrink-0" />
          <h2 className="text-xl font-black text-slate-800 font-headline uppercase tracking-wide">Estado de Disponibilidad</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 pt-2">
          <div className="lg:col-span-4 space-y-1">
            <label className="block text-lg font-bold text-slate-700 font-body">Estado en vivo</label>
            <p className="text-sm text-slate-400 font-body leading-relaxed">Los conductores verán este estado inmediatamente en el mapa de la app.</p>
          </div>
          <div className="lg:col-span-8 relative">
            <button
              type="button"
              onClick={() => setIsOpenEnumMenu(!isOpenEnumMenu)}
              className="w-full py-4 px-6 bg-white border border-slate-200 rounded-2xl font-bold text-base text-slate-700 shadow-sm flex items-center justify-between cursor-pointer transition-all hover:border-slate-300 focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <span className={`px-4 py-1.5 text-sm rounded-full border font-black ${currentEnum.color}`}>
                  {currentEnum.label}
                </span>
              </div>
              <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${isOpenEnumMenu ? 'rotate-180' : ''}`} />
            </button>
            {isOpenEnumMenu && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-40 overflow-hidden p-2 space-y-1 animate-slideUp">
                {enumOptions.map((option) => {
                  const isSelected = configCtrl.disponibilidad === option.value;
                  return (
                    <div 
                      key={option.value} 
                      onClick={() => { configCtrl.setDisponibilidad(option.value); setIsOpenEnumMenu(false); }} 
                      className={`px-4 py-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-all font-body ${isSelected ? 'bg-slate-50 text-primary font-black' : 'text-slate-600 hover:bg-slate-50/80 font-bold'}`}
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

      {/* SECCIÓN 2: HORARIOS DE ATENCIÓN */}
      <div className="bg-bg p-10 rounded-[32px] space-y-6 border border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-slate-200/60">
          <div className="flex items-center gap-3.5">
            <Clock size={24} className="text-primary shrink-0" />
            <h2 className="text-xl font-black text-slate-800 font-headline uppercase tracking-wide">Horarios de Operación *</h2>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 flex flex-wrap items-center gap-3 self-start lg:self-auto">
            <span className="text-xs font-black uppercase text-slate-500 font-body pl-1">Horario Rápido:</span>
            <div className="flex items-center gap-2">
              <SelectorHora24h value={configCtrl.maestroInicio || "00:00"} onChange={configCtrl.setMaestroInicio} />
              <span className="text-xs text-slate-400 font-bold">a</span>
              <SelectorHora24h value={configCtrl.maestroFin || "00:00"} onChange={configCtrl.setMaestroFin} />
            </div>
            <button
              type="button"
              disabled={!esBotonMaestroHabilitado}
              onClick={configCtrl.aplicarHorarioATodos}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs font-label transition-all cursor-pointer ${esBotonMaestroHabilitado ? 'bg-primary text-white shadow-md shadow-primary/10 hover:bg-primary/90 hover:scale-[1.02]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              <Copy size={13} /> Aplicar a todos
            </button>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {Object.keys(configCtrl.horarios).map((key) => {
            const dia = configCtrl.horarios[key];
            const hasError = !!configCtrl.errors[key];
            return (
              <div key={key} className="flex flex-col gap-2">
                <div className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${hasError ? 'border-red-400 bg-red-50/5' : dia.activo ? 'bg-white border-slate-200 shadow-[0_4px_12px_rgba(0,0,0,0.02)]' : 'bg-white/50 border-slate-100 opacity-60'}`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={dia.activo} 
                        onChange={(e) => configCtrl.handleDayChange(key, 'activo', e.target.checked)} 
                        className="rounded-lg text-primary h-5 w-5 border-slate-300 cursor-pointer" 
                      />
                      <span className="text-xl font-bold text-slate-800 font-body block">{dia.label} {dia.activo && <span className="text-red-500 text-sm">*</span>}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    <SelectorHora24h disabled={!dia.activo} value={dia.inicio} onChange={(v) => configCtrl.handleDayChange(key, 'inicio', v)} />
                    <span className="text-slate-400 font-bold font-body text-base px-1">hasta las</span>
                    <SelectorHora24h disabled={!dia.activo} value={dia.fin} onChange={(v) => configCtrl.handleDayChange(key, 'fin', v)} />
                  </div>
                </div>
                {hasError && <span className="text-sm font-bold text-red-500 px-4 mb-2">{configCtrl.errors[key]}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN 3: TARIFAS POR HORA */}
      <div className="bg-bg p-10 rounded-[32px] space-y-6 border border-slate-100">
        <div className="flex items-center gap-3.5 pb-3 border-b border-slate-200/60">
          <DollarSign size={24} className="text-primary shrink-0" />
          <h2 className="text-xl font-black text-slate-800 font-headline uppercase tracking-wide">Estructura Tarifaria</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-black tracking-wider uppercase text-slate-400">Estándar *</span>
            <Input label="Tarifa General por Hora ($) *" type="number" min="0" value={configCtrl.tarifas.general} onChange={(e) => configCtrl.handleTarifaChange('general', e.target.value)} placeholder="0.00" className="!max-w-full bg-white" />
            {configCtrl.errors.tarifa_general && <span className="text-sm font-bold text-red-500 block">{configCtrl.errors.tarifa_general}</span>}
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-black tracking-wider uppercase text-blue-500">Preferencial</span>
            <Input label="Tercera Edad / Discapacidad ($)" type="number" min="0" value={configCtrl.tarifas.descuento} onChange={(e) => configCtrl.handleTarifaChange('descuento', e.target.value)} placeholder="0.00" className="!max-w-full bg-white" />
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-black tracking-wider uppercase text-amber-600">Pesados</span>
            <Input label="Vehículos Grandes / 4x4 ($)" type="number" min="0" value={configCtrl.tarifas.grandes} onChange={(e) => configCtrl.handleTarifaChange('grandes', e.target.value)} placeholder="0.00" className="!max-w-full bg-white" />
          </div>
        </div>
      </div>

      {/* BOTÓN MAESTRO DE ACCIÓN */}
      <div className="flex flex-col items-end gap-3 mt-4">
        {configCtrl.errors.formulario && (
          <span className="text-base font-black text-red-500 bg-red-50 border border-red-200 py-2 px-6 rounded-xl animate-shake">
             {configCtrl.errors.formulario}
          </span>
        )}
        <Button 
          variant="primary"
          onClick={configCtrl.preSubmitCheck}
          disabled={configCtrl.isSaving}
          className="w-full sm:w-auto px-16 py-4.5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl transition-all"
        >
          Guardar Cambios del Sistema
        </Button>
      </div>

      {/* ================================================================= */}
      {/*  ESCAPE PLAN: PORTALES DE REACT PARA ARRANCAR LOS MODALES       */}
      {/* ================================================================= */}
      
      {/* MODAL 1: CONFIRMACIÓN */}
      {configCtrl.showConfirmModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999999]">
          <div className="bg-white rounded-[32px] max-w-md w-full p-8 shadow-[0_24px_70px_rgba(0,0,0,0.3)] text-center space-y-6 border border-slate-100 animate-scaleUp">
            <div className="mx-auto w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-100">
              <AlertTriangle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-wide">¿Confirmar Cambios?</h3>
              <p className="text-base text-slate-500 leading-relaxed">¿Estás seguro de que deseas aplicar esta nueva configuración horaria y tarifaria al sistema en vivo?</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={() => configCtrl.setShowConfirmModal(false)}
                className="w-full py-4 bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => configCtrl.executeSubmit()}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
              >
                Sí, guardar
              </button>
            </div>
          </div>
        </div>,
        document.body 
      )}

      {/* MODAL 2: ÉXITO */}
      {configCtrl.showSuccessModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999999]">
          <div className="bg-white rounded-[32px] max-w-md w-full p-8 shadow-[0_24px_70px_rgba(0,0,0,0.3)] text-center space-y-6 border border-slate-100 animate-scaleUp">
            <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-100">
              <Check size={36} className="stroke-[3]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-wide">¡Cambios Guardados!</h3>
              <p className="text-base text-slate-500 leading-relaxed">La configuración general del parqueadero se ha actualizado exitosamente en la base de datos.</p>
            </div>
            <button
              type="button"
              onClick={() => configCtrl.setShowSuccessModal(false)}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all cursor-pointer pt-2"
            >
              Entendido
            </button>
          </div>
        </div>,
        document.body // 
      )}

    </div>
  );
};