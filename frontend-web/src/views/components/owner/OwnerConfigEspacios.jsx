// ============================================================================
// 1. IMPORTACIONES
// ============================================================================
import React, { useState } from 'react';
import { Save, Grid, Layers, DollarSign, X, Check, Car } from 'lucide-react';
import { Button } from '../Button';

export const OwnerConfigEspacios = () => {
  // --- ESTADOS PRINCIPALES ---
  const [numEspacios, setNumEspacios] = useState('12'); 
  
  // Estado para simular la base de datos de los espacios del parqueadero
  const [espacios, setEspacios] = useState(
    Array.from({ length: 12 }, (_, i) => ({
      id: String(i + 1).padStart(2, '0'),
      estado: 'LIBRE', 
      tarifa: 'GENERAL' 
    }))
  );

  // --- ESTADOS PARA EL MODAL ---
  const [selectedEspacio, setSelectedEspacio] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // NUEVOS COLORES HEX REQUERIDOS: Libre (#00bf63), Ocupado (#0a878b), Inhabilitado (#ff7c00)
  const estadoOptions = [
    { value: 'LIBRE', label: 'Libre', color: 'bg-[#00bf63] text-white ring-emerald-100 hover:bg-[#00a354]' },
    { value: 'OCUPADO', label: 'Ocupado', color: 'bg-[#0a878b] text-white ring-teal-100 hover:bg-[#086f72]' },
    { value: 'INHABILITADO', label: 'Inhabilitado', color: 'bg-[#ff7c00] text-white ring-orange-200 hover:bg-[#e06d00]' }
  ];

  const tarifaOptions = [
    { value: 'GENERAL', label: 'Tarifa General', desc: 'Estándar por hora', precio: '$1.00' },
    { value: 'PREFERENCIAL', label: 'Preferencial', desc: 'Tercera Edad / Discapacidad', precio: '$0.50' },
    { value: 'PESADOS', label: 'Vehículos Grandes', desc: '4x4 / Pesados', precio: '$1.50' }
  ];

  // --- MANEJADORES DE EVENTOS ---
  const handleNumEspaciosChange = (e) => {
    const inputValue = e.target.value;
    setNumEspacios(inputValue); 

    const targetLength = inputValue === '' ? 1 : Math.max(1, parseInt(inputValue) || 1);
    
    setEspacios(prev => {
      return Array.from({ length: targetLength }, (_, i) => {
        if (prev[i]) return prev[i];
        return {
          id: String(i + 1).padStart(2, '0'),
          estado: 'LIBRE',
          tarifa: 'GENERAL'
        };
      });
    });
  };

  const handleBlurInput = () => {
    if (numEspacios === '' || parseInt(numEspacios) < 1) {
      setNumEspacios('1');
    }
  };

  const openEditModal = (espacio) => {
    setSelectedEspacio({ ...espacio });
    setIsModalOpen(true);
  };

  const saveEspacioChanges = () => {
    setEspacios(prev => prev.map(esp => esp.id === selectedEspacio.id ? selectedEspacio : esp));
    setIsModalOpen(false);
  };

  const handleSaveAll = () => {
    console.log("Guardando Distribución de Espacios:", espacios);
    alert("¡Distribución y estados de espacios guardados con éxito!");
  };

  return (
    <div 
      className={
        "w-full " + 
        "max-w-[98%] " + 
        "mx-auto " + 
        "flex " + 
        "flex-col " + 
        "gap-8 " + 
        "text-left " + 
        "animate-fadeIn"
      }
    >
      
      {/* CARD PRINCIPAL */}
      <div 
        className={
          "bg-bg " + 
          "p-10 " + 
          "rounded-[32px] " + 
          "border " + 
          "border-slate-100 " + 
          "space-y-8"
        }
      >
        
        {/* CABECERA DE LA SECCIÓN */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/60">
          <div className="flex items-center gap-3.5">
            <Grid size={24} className="text-primary shrink-0" />
            <h2 className="text-xl font-black text-slate-800 font-headline uppercase tracking-wide">
              Distribución de Espacios
            </h2>
          </div>
          
          {/* Input de Espacios Totales */}
          <div 
            className={
              "flex " + 
              "items-center " + 
              "gap-3 " + 
              "bg-white " + 
              "px-5 " + 
              "py-2.5 " + 
              "rounded-2xl " + 
              "border " + 
              "border-slate-200 " + 
              "shadow-sm"
            }
          >
            <span className="text-sm font-bold text-slate-500 font-body select-none">
              Nº Espacios Totales:
            </span>
            <input 
              type="number" 
              value={numEspacios}
              onChange={handleNumEspaciosChange}
              onBlur={handleBlurInput}
              min="1"
              className={
                "w-16 " + 
                "text-center " + 
                "font-black " + 
                "text-lg " + 
                "text-slate-800 " + 
                "bg-transparent " + 
                "outline-none " + 
                "font-body " + 
                "[appearance:textfield] " + 
                "[&::-webkit-outer-spin-button]:appearance-none " + 
                "[&::-webkit-inner-spin-button]:appearance-none"
              }
            />
          </div>
        </div>

        <p className="text-base text-slate-500 font-body">
          Haz clic sobre cualquier celda para gestionar su disponibilidad en tiempo real y asignarle una estructura tarifaria específica.
        </p>

        {/* RECUADRO INTERNO BLANCO */}
        <div 
          className={
            "bg-white " + 
            "p-8 " + 
            "rounded-2xl " + 
            "border " + 
            "border-slate-200 " + 
            "shadow-[0_4px_12px_rgba(0,0,0,0.02)]"
          }
        >
          <div 
            className={
              "grid " + 
              "grid-cols-2 " + 
              "sm:grid-cols-3 " + 
              "md:grid-cols-5 " + 
              "lg:grid-cols-6 " + 
              "xl:grid-cols-7 " + 
              "gap-4"
            }
          >
            {espacios.map((espacio) => {
              let bgClass = "bg-[#00bf63] hover:bg-[#00a354] shadow-emerald-100"; 
              if (espacio.estado === 'OCUPADO') {
                bgClass = "bg-[#0a878b] hover:bg-[#086f72] shadow-teal-100";     
              } else if (espacio.estado === 'INHABILITADO') {
                bgClass = "bg-[#ff7c00] hover:bg-[#e06d00] shadow-orange-100";   
              }

              // Buscamos el precio correspondiente basado en el estado de tarifa actual
              const infoTarifa = tarifaOptions.find(t => t.value === espacio.tarifa);
              const precioTexto = infoTarifa ? infoTarifa.precio : "$0.00";

              return (
                <button
                  key={espacio.id}
                  type="button"
                  onClick={() => openEditModal(espacio)}
                  className={
                    bgClass + " " +
                    "h-28 " +                  
                    "rounded-2xl " + // Bordes un poco más redondeados como la imagen
                    "flex " + 
                    "flex-col " + 
                    "items-center " + 
                    "justify-center " + 
                    "text-white " + 
                    "transition-all " + 
                    "duration-200 " + 
                    "hover:scale-[1.04] " + 
                    "active:scale-95 " + 
                    "shadow-md " + 
                    "focus:outline-none " + 
                    "p-3 " +
                    "gap-1 " +
                    "relative" // Obligatorio para poder posicionar la etiqueta de precio en la esquina
                  }
                >
                  {/* BUBBLE DEL PRECIO EN LA ESQUINA SUPERIOR DERECHA (FIJO) */}
                  <span 
                    className={
                      "absolute " +
                      "top-2 " +
                      "right-2 " +
                      "bg-white " +
                      "text-slate-800 " +
                      "text-[11px] " +
                      "font-black " +
                      "px-2.5 " +
                      "py-1 " +
                      "rounded-full " +
                      "shadow-sm " +
                      "pointer-events-none" // Evita interrumpir el clic del botón grande
                    }
                  >
                    {precioTexto}
                  </span>

                  {/* Icono de coche */}
                  <Car size={22} className="opacity-95 mt-3" />
                  
                  {/* Fila del ID y la Tarifa juntas */}
                  <div className="flex items-center justify-center gap-2 w-full text-center mt-1">
                    <span className="text-2xl font-black tracking-wider font-headline shrink-0">
                      {espacio.id}
                    </span>
                    
                    {/* Tarifa al lado con el subrayado blanco */}
                    <span className="text-xs font-black tracking-wide uppercase font-body bg-white/20 px-1.5 py-0.5 rounded underline decoration-white decoration-2 underline-offset-4">
                      {espacio.estado === 'INHABILITADO' ? 'INHAB' : espacio.tarifa.substring(0, 4)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTÓN MAESTRO DE ACCIÓN GLOBAL */}
      <div className="flex justify-end mt-2">
        <Button 
          variant="primary"
          onClick={handleSaveAll}
          className={
            "w-full " + 
            "sm:w-auto " + 
            "px-16 " + 
            "py-4.5 " + 
            "rounded-2xl " + 
            "font-bold " + 
            "text-lg " + 
            "flex " + 
            "items-center " + 
            "justify-center " + 
            "gap-3 " + 
            "shadow-xl " + 
            "shadow-primary/20 " + 
            "hover:scale-[1.02] " + 
            "transition-all"
          }
        >
          <Save size={20} /> Guardar Distribución Completa
        </Button>
      </div>

      {/* MODAL MÁS ANCHO FLOTANTE */}
      {isModalOpen && selectedEspacio && (
        <div 
          className={
            "fixed " + 
            "inset-0 " + 
            "bg-slate-900/40 " + 
            "backdrop-blur-sm " + 
            "flex " + 
            "items-center " + 
            "justify-center " + 
            "z-[100] " + 
            "p-4 " + 
            "animate-fadeIn"
          }
        >
          <div 
            className={
              "bg-white " + 
              "w-full " + 
              "max-w-xl " + 
              "rounded-[28px] " + 
              "shadow-2xl " + 
              "border " + 
              "border-slate-100 " + 
              "overflow-hidden " + 
              "animate-scaleUp"
            }
          >
            
            {/* CABECERA MODAL */}
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-primary" />
                <h3 className="text-lg font-black text-slate-800 font-headline uppercase">
                  Configurar Espacio {selectedEspacio.id}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* APARTADO 1: ESTADO DEL ESPACIO */}
              <div className="space-y-2.5">
                <label className="block text-sm font-black text-slate-700 font-body uppercase tracking-wider">
                  1. Estado del Espacio
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {estadoOptions.map((opt) => {
                    const isCurrent = selectedEspacio.estado === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSelectedEspacio(prev => ({ ...prev, estado: opt.value }))}
                        className={
                          "py-3 " + 
                          "rounded-xl " + 
                          "text-sm " + 
                          "font-black " + 
                          "transition-all " + 
                          "border " + 
                          "focus:outline-none " + 
                          (isCurrent 
                            ? opt.color + " border-transparent ring-4" 
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")
                        }
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* APARTADO 2: ELEGIR TARIFAS */}
              <div className="space-y-2.5">
                <label className="block text-sm font-black text-slate-700 font-body uppercase tracking-wider">
                  2. Estructura Tarifaria Aplicada
                </label>
                <div className="flex flex-col gap-2.5">
                  {tarifaOptions.map((opt) => {
                    const isCurrent = selectedEspacio.tarifa === opt.value;
                    return (
                      <div
                        key={opt.value}
                        onClick={() => setSelectedEspacio(prev => ({ ...prev, tarifa: opt.value }))}
                        className={
                          "p-4 " + 
                          "rounded-xl " + 
                          "border " + 
                          "flex " + 
                          "items-center " + 
                          "justify-between " + 
                          "cursor-pointer " + 
                          "transition-all " + 
                          "group " + 
                          (isCurrent 
                            ? "bg-blue-50/60 border-primary shadow-sm" 
                            : "bg-white border-slate-200 hover:bg-slate-50/50")
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div className={
                            "w-9 " + 
                            "h-9 " + 
                            "rounded-lg " + 
                            "flex " + 
                            "items-center " + 
                            "justify-center " + 
                            (isCurrent ? "bg-primary text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200")
                          }>
                            <DollarSign size={18} />
                          </div>
                          <div className="text-left">
                            <p className={`text-base font-bold ${isCurrent ? 'text-primary' : 'text-slate-700'}`}>
                              {opt.label}
                            </p>
                            <p className="text-xs text-slate-400 font-body">
                              {opt.desc}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className={`text-base font-black ${isCurrent ? 'text-primary' : 'text-slate-500'}`}>
                            {opt.precio}
                          </span>
                          {isCurrent && <Check size={18} className="text-primary" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* PIE DEL MODAL */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={saveEspacioChanges}
                className={
                  "bg-primary " + 
                  "text-white " + 
                  "font-bold " + 
                  "text-sm " + 
                  "px-8 " + 
                  "py-3 " + 
                  "rounded-xl " + 
                  "shadow-md " + 
                  "hover:bg-primary/90 " + 
                  "transition-all " + 
                  "focus:outline-none"
                }
              >
                Confirmar Cambios
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};