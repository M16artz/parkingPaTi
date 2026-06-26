// ============================================================================
// 1. IMPORTACIONES Y DEPENDENCIAS
// ============================================================================
import React, { useState } from 'react';
import { LayoutDashboard, Settings, Key, Car, LogOut } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';

// Importación de tu foto local desde la carpeta assets
import userPhoto from '../../assets/user.png';

// Vistas modulares internas
import { OwnerInfoGeneral } from '../components/owner/OwnerInfoGeneral';
import { OwnerConfigGeneral } from '../components/owner/OwnerConfigGeneral';
import { OwnerConfigEspacios } from '../components/owner/OwnerConfigEspacios';

// ============================================================================
// 2. CONSTANTES DE CONFIGURACIÓN DE LA NAVEGACIÓN LATERAL
// ============================================================================
const NAV_ITEMS = [
  { key: 'infoGeneral', icon: LayoutDashboard, label: 'CONFIGURACION INFORMACION', index: 0 },
  { key: 'configGeneral', icon: Settings, label: 'CONFIGURACION GENERAL', index: 1 },
  { key: 'configEspacios', icon: Key, label: 'CONFIGURACION ESPACIOS', index: 2 },
];

// ============================================================================
// 3. COMPONENTE PRINCIPAL (PANEL DE CONTROL / DASHBOARD)
// ============================================================================
export const OwnerDashboardView = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('infoGeneral');

  // Encontrar el índice dinámico para acoplar la cápsula flotante animada
  const activeIndex = NAV_ITEMS.find(item => item.key === activeView)?.index ?? 0;

  return (
    <div 
      className={
        "w-screen " + 
        "h-screen " + 
        "flex " + 
        "p-6 " + 
        "bg-bg " +               // Tu azulito/celeste bajito de fondo exterior
        "select-none " + 
        "overflow-hidden " + 
        "font-sans " + 
        "antialiased"
      }
    >
      
      {/* CONTENEDOR ENCAPSULADO CON BORDES REDONDEADOS Y SOMBRA ELEVADA */}
      <div 
        className={
          "w-full " + 
          "h-full " + 
          "flex " + 
          "bg-white " +            // Fondo interior blanco puro
          "rounded-[32px] " + 
          "shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] " + 
          "overflow-hidden"
        }
      >
        
        {/* ----------------------------------------------------------------- */}
        {/* ASIDE: BARRA LATERAL AZUL DE NAVEGACIÓN ORIGINAL                  */}
        {/* ----------------------------------------------------------------- */}
        <aside 
          className={
            "w-[290px] " + 
            "bg-primary " + 
            "bg-gradient-to-b " + 
            "from-primary " + 
            "to-[#466fd3] " + 
            "flex " + 
            "flex-col " + 
            "pt-12 " + 
            "pb-8 " + 
            "px-0 " + 
            "text-white " + 
            "relative " + 
            "transform-gpu " + 
            "z-10 " + 
            "overflow-hidden " + 
            "shadow-[8px_0_24px_-4px_rgba(0,0,0,0.15)]"
          }
        >
          
          {/* SECCIÓN DEL USUARIO (Foto circular y datos alineados) */}
          <div 
            className={
              "flex " + 
              "flex-col " + 
              "items-center " + 
              "px-6 " + 
              "mb-10 " + 
              "text-center"
            }
          >
            {/* Contenedor de la Foto Circular */}
            <div 
              className={
                "w-24 " + 
                "h-24 " + 
                "rounded-full " + 
                "border-2 " + 
                "border-teal-400 " + 
                "p-1 " + 
                "mb-4 " + 
                "overflow-hidden " + 
                "bg-white/10 " + 
                "shadow-lg"
              }
            >
              {/* Aquí se carga tu imagen user.png de assets */}
              <img 
                src={userPhoto} 
                alt="User Profile" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            {/* Nombre con tipografía grande y legible corregida */}
            <h3 
              className={
                "text-2xl " + 
                "font-black " + 
                "tracking-wide " + 
                "font-headline " + 
                "uppercase " + 
                "shadow-sm"
              }
            >
              María Buri
            </h3>
            {/* Correo Electrónico Agrandado */}
            <span 
              className={
                "text-base " +         // ¡Cambiado de text-xs a text-base para que sea más grande!
                "font-semibold " +     // Un toque más grueso para mejorar el contraste
                "text-white/80 " +     // Un blanco un poco más brillante (80% de opacidad)
                "font-body " + 
                "mt-1.5"
              }
            >
              maria.buri@gmail.com
            </span>
          </div>

          {/* CONTENEDOR ENVOLVENTE DE LA NAV CON TRUCO DE CÁPSULA FLOTANTE */}
          <div className="relative w-full pl-6 flex flex-col gap-1 transform-gpu">
            
            {/* Fondo Blanco de Acople Animado Detrás de la Opción Activa */}
            <div 
              className={
                "absolute " + 
                "right-0 " + 
                "w-[266px] " + 
                "h-[64px] " + 
                "bg-white " + 
                "rounded-l-[32px] " + 
                "transition-all " + 
                "duration-300 " + 
                "ease-out " + 
                "transform-gpu"
              }
              style={{ 
                top: `${activeIndex * 68}px`,
                willChange: 'transform',
                marginRight: '-1px'
              }}
            >
              {/* Curvatura Interna Superior acoplada al fondo blanco */}
              <div className="absolute right-0 -top-[21px] w-[21px] h-[21px] overflow-hidden pointer-events-none">
                <div className="w-full h-full rounded-br-[21px] shadow-[5px_5px_0_6px_#ffffff]" />
              </div>
              {/* Curvatura Interna Inferior acoplada al fondo blanco */}
              <div className="absolute right-0 -bottom-[21px] w-[21px] h-[21px] overflow-hidden pointer-events-none">
                <div className="w-full h-full rounded-tr-[21px] shadow-[5px_-5px_0_6px_#ffffff]" />
              </div>
            </div>

            {/* GENERACIÓN ITERATIVA DE BOTONES DE ACCESO DE LA NAV */}
            {NAV_ITEMS.map((item) => {
              const isActive = activeView === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveView(item.key)}
                  className={
                    "z-10 " + 
                    "flex " + 
                    "items-center " + 
                    "justify-between " + 
                    "pl-8 " + 
                    "pr-4 " + 
                    "h-[64px] " + 
                    "rounded-l-[32px] " + 
                    "font-bold " + 
                    "text-[13px] " + 
                    "tracking-wider " + 
                    "w-full " + 
                    "text-left " + 
                    "group " + 
                    "transition-colors " + 
                    "duration-300 " + 
                    "border-none " + 
                    "outline-none " + 
                    "focus:outline-none " + 
                    (isActive ? 'text-primary' : 'text-white/70 hover:text-white')
                  }
                >
                  <div className="flex items-center gap-4">
                    <item.icon 
                      size={20} 
                      className={
                        "transition-colors " + 
                        "duration-200 " + 
                        (isActive ? 'text-primary' : 'text-white/50 group-hover:text-white')
                      } 
                    />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* BOTÓN DE CIERRE DE SESIÓN (Log Out) */} 
          <button
            type="button"
            onClick={() => navigate('/login')}
            className={
              "flex " + 
              "items-center " + 
              "gap-4 " + 
              "px-8 " + 
              "py-4 " + 
              "rounded-2xl " + 
              "font-bold " + 
              "text-[13px] " + 
              "tracking-wider " + 
              "text-white/50 " + 
              "hover:bg-white/5 " + 
              "hover:text-white " + 
              "transition-all " + 
              "mt-auto " + 
              "mx-6 " + 
              "group " + 
              "text-left " + 
              "transform-gpu"
            }
          >
            <LogOut size={18} className="text-white/40 group-hover:text-white transition-colors" />
            <span>LOG OUT</span>
          </button>
        </aside>

        {/* ----------------------------------------------------------------- */}
        {/* MAIN: ÁREA CENTRAL DE CONTENIDO VARIABLE                          */}
        {/* ----------------------------------------------------------------- */}
        <main 
          className={
            "flex-1 " + 
            "pt-6 " + 
            "pb-12 " + 
            "px-12 " + 
            "flex " + 
            "flex-col " + 
            "overflow-y-auto " + 
            "bg-white " + 
            "transform-gpu " + 
            "z-0"
          }
        >
          
          {/* ENCABEZADO: Título dinámico a la izquierda y LOGO CORPORATIVO realzado a la derecha */}
          <header 
            className={
              "w-full " + 
              "flex " + 
              "items-center " + 
              "justify-between " + 
              "mb-8 " + 
              "transform-gpu"
            }
          >
            {/* Título de la sección activa */}
            <h1 className="text-3xl font-black text-slate-800 tracking-tight  font-headline mt-4">
              {activeView === 'infoGeneral' && "Panel de Control"}
              {activeView === 'configGeneral' && "Configuración General"}
              {activeView === 'configEspacios' && "Gestión de Espacios"}
            </h1>

            {/* LOGO CORPORATIVO (Grande y elevado en la esquina superior derecha) */}
            <div 
              className={
                "flex " + 
                "items-center " + 
                "gap-3 " + 
                "pointer-events-none " + 
                "select-none " + 
                "text-primary " + 
                "mt-2"
              }
            >
              <Car size={36} className="text-primary" />
              <span className="text-2xl font-black tracking-wide font-headline">
                ParkingPaTi
              </span>
            </div>
          </header>

          {/* VISTAS MODULARES CONMUTABLES */}
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