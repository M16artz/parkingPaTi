import React, { useState } from 'react';
import { LayoutDashboard, CalendarDays, Key, Car, Bell, Mail, Search, ChevronDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// RUTAS DEL ÁRBOL DE CARPETAS ACTUAL REVISADO
import { OwnerInfoGeneral } from '../components/owner/OwnerInfoGeneral';
import { OwnerConfigGeneral } from '../components/owner/OwnerConfigGeneral';
import { OwnerConfigEspacios } from '../components/owner/OwnerConfigEspacios';

export const OwnerDashboardView = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('infoGeneral');

  const navItems = [
    { key: 'infoGeneral', icon: LayoutDashboard, label: 'Dashboard', sub: 'Overview', index: 0 },
    { key: 'configGeneral', icon: CalendarDays, label: 'Schedule', sub: 'Shift & Rates', index: 1 },
    { key: 'configEspacios', icon: Key, label: 'Settings', sub: 'Rates & Slots', index: 2 },
  ];

  const activeIndex = navItems.find(item => item.key === activeView)?.index ?? 0;

  return (
    // 1. FONDO GENERAL AZUL REY OSCURO DE PANTALLA COMPLETA
    <div className="w-screen h-screen bg-[#1e2f5c] flex items-center justify-center p-5 select-none overflow-hidden font-sans antialiased">
      
      {/* 2. CONTENEDOR INTERNO DE LA INTERFAZ CON ESQUINAS ULTRA REDONDEADAS MASIVAS */}
      <div className="w-full h-full bg-[#f3f6f9] rounded-[40px] flex overflow-hidden shadow-2xl relative transform-gpu">
        
        {/* 3. BARRA LATERAL CON BORDES REDONDEADOS EN EL EXTREMO IZQUIERDO */}
        <aside className="w-[280px] bg-[#2e52b2] flex flex-col pt-10 pb-8 px-0 text-white relative rounded-l-[40px] transform-gpu">
          
          {/* ESTILO VISUAL DE LA TERCERA FOTO: SÓLO TEXTO E ICONOS EN BLANCO PERFECTO */}
          <div className="flex items-center gap-3.5 px-7 mb-12 pointer-events-none select-none">
            {/* Contenedor del icono sutilmente redondeado */}
            <div className="w-11 h-11 rounded-[14px] bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <Car size={22} className="text-white stroke-[2.5]" />
            </div>
            {/* Fuentes fluidas exactamente como el mock-up */}
            <div className="flex flex-col text-left">
              <span className="text-[22px] font-bold text-white tracking-tight leading-none">
                ParkingPaTi
              </span>
              <span className="text-[10px] text-white/60 font-sans font-bold tracking-widest uppercase mt-1">
                PRO MANAGER
              </span>
            </div>
          </div>

          {/* NAVEGACIÓN EMBEBIDA CON DESPLAZAMIENTO FLUIDO (MÁSCARA CORREGIDA SIN FILTRAR PÍXELES) */}
          <div className="relative w-full pl-6 flex flex-col gap-1 transform-gpu">
            
            {/* CÁPSULA FLOTANTE DETRÁS DE LOS BOTONES */}
            <div 
              className="absolute right-0 w-[256px] h-[64px] bg-[#f3f6f9] rounded-l-[32px] transition-all duration-300 ease-out transform-gpu"
              style={{ 
                top: `${activeIndex * 68}px`,
                willChange: 'transform'
              }}
            >
              {/* TRUCO ANTI-ALIASING CON BOX-SHADOW: Genera esquinas perfectamente nítidas sin despixelar */}
              <div className="absolute right-0 -top-[20px] w-[20px] h-[20px] overflow-hidden pointer-events-none">
                <div className="w-full h-full rounded-br-[20px] shadow-[4px_4px_0_4px_#f3f6f9]" />
              </div>
              <div className="absolute right-0 -bottom-[20px] w-[20px] h-[20px] overflow-hidden pointer-events-none">
                <div className="w-full h-full rounded-tr-[20px] shadow-[4px_-4px_0_4px_#f3f6f9]" />
              </div>
            </div>

            {/* BOTONES INTERACTIVOS */}
            {navItems.map((item) => {
              const isActive = activeView === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveView(item.key)}
                  className={`z-10 flex items-center justify-between pl-6 pr-4 h-[64px] rounded-l-[32px] font-bold text-[14px] w-full text-left group transition-colors duration-300 border-none outline-none focus:outline-none ${
                    isActive ? 'text-[#2e52b2]' : 'text-white/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <item.icon size={18} className={`transition-colors duration-200 ${isActive ? 'text-[#2e52b2]' : 'text-white/60 group-hover:text-white'}`} />
                    <div className="flex flex-col">
                      <span>{item.label}</span>
                      <span className={`text-[10px] font-medium leading-none mt-0.5 transition-colors duration-200 ${isActive ? 'text-slate-400' : 'text-white/40'}`}>
                        {item.sub}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* BOTÓN DE LOG OUT */}
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-[14px] text-white/60 hover:bg-white/5 hover:text-white transition-all mt-auto mx-6 group text-left transform-gpu"
          >
            <LogOut size={16} className="text-white/40 group-hover:text-white transition-colors" />
            <span>Log Out</span>
          </button>
        </aside>

        {/* 4. SECCIÓN PRINCIPAL DE CONTENIDO */}
        <main className="flex-1 p-10 flex flex-col overflow-y-auto bg-[#f3f6f9] transform-gpu">
          
          {/* HEADER DE LA APLICACIÓN */}
          <header className="w-full flex items-center justify-between mb-8 transform-gpu">
            <div className="relative w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-white pl-11 pr-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-700 placeholder-slate-300 shadow-sm shadow-slate-100/50 focus:outline-none focus:ring-2 focus:ring-[#2e52b2]/10"
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-500 bg-white px-3 py-2 rounded-xl shadow-sm shadow-slate-100/50 cursor-pointer hover:bg-slate-50 transition-colors">
                <span>ENG</span> <ChevronDown size={12} className="text-slate-400" />
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <Mail size={16} className="cursor-pointer hover:text-slate-700 transition-colors" />
                <Bell size={16} className="cursor-pointer hover:text-slate-700 transition-colors" />
              </div>
              
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" 
                  alt="Avatar Owner" 
                  className="w-8 h-8 rounded-full object-cover shadow-sm border border-white"
                />
                <span className="text-xs font-black text-slate-800 flex items-center gap-1 cursor-pointer">
                  Grace Stanley <ChevronDown size={12} className="text-slate-400" />
                </span>
              </div>
            </div>
          </header>

          {/* VISTAS MODULARES */}
          <section className="w-full flex-1 transform-gpu">
            {activeView === 'infoGeneral' && <OwnerInfoGeneral />}
            {activeView === 'configGeneral' && <OwnerConfigGeneral />}
            {activeView === 'configEspacios' && <OwnerConfigEspacios />}
          </section>

        </main>

      </div>
    </div>
  );
};