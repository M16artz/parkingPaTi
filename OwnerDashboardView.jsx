import React, { useState } from 'react';
import { LayoutDashboard, Info, Settings, Key, Car, LogOut, User } from 'lucide-react'; 
import { useLogoutController } from '../../controllers/useLogoutController';

// Asset por defecto (si la ruta existe en tu proyecto)
import userPhotoDefault from '../../assets/user.png';

// Vistas modulares internas
import { OwnerDashboardSummary } from '../components/owner/OwnerDashboardSummary';
import { OwnerInfoGeneral } from '../components/owner/OwnerInfoGeneral';
import { OwnerConfigGeneral } from '../components/owner/OwnerConfigGeneral';
import { OwnerConfigEspacios } from '../components/owner/OwnerConfigEspacios';

// ============================================================================
// CONSTANTES DE NAVEGACIÓN LATERAL
// ============================================================================
const NAV_ITEMS = [
  { key: 'dashboard', icon: LayoutDashboard, label: 'DASHBOARD', index: 0 },
  { key: 'infoGeneral', icon: Info, label: 'CONFIGURACIÓN INFORMACIÓN', index: 1 },
  { key: 'configGeneral', icon: Settings, label: 'CONFIGURACIÓN GENERAL', index: 2 },
  { key: 'configEspacios', icon: Key, label: 'CONFIGURACIÓN ESPACIOS', index: 3 },
];

export const OwnerDashboardView = ({ user = null, parqueadero = null }) => {
  const logout = useLogoutController();
  const [activeView, setActiveView] = useState('dashboard');
  const [imgError, setImgError] = useState(false);

  // Datos dinámicos del usuario con fallbacks
  const userData = {
    nombre: user?.nombre || user?.full_name || 'Propietario',
    email: user?.email || 'propietario@parkingpati.com',
    avatar: user?.avatar_url || userPhotoDefault,
  };

  // Cálculo dinámico de la posición para la cápsula flotante
  const activeIndex = NAV_ITEMS.find((item) => item.key === activeView)?.index ?? 0;

  return (
    <div className="w-screen h-screen flex p-4 sm:p-6 bg-slate-100 select-none overflow-hidden font-sans antialiased">
      
      {/* CONTENEDOR PRINCIPAL CON SOMBRA Y BORDES REDONDEADOS */}
      <div className="w-full h-full flex bg-white rounded-[32px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden">
        
        {/* ================================================================== */}
        {/* BARRA LATERAL (SIDEBAR)                                            */}
        {/* ================================================================== */}
        <aside className="w-[290px] bg-[#2b62d9] bg-gradient-to-b from-[#2b62d9] to-[#466fd3] flex flex-col pt-10 pb-8 text-white relative transform-gpu z-10 overflow-hidden shadow-[8px_0_24px_-4px_rgba(0,0,0,0.15)] shrink-0">
          
          {/* SECCIÓN DE PERFIL DE USUARIO */}
          <div className="flex flex-col items-center px-6 mb-8 text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-teal-400 p-1 mb-3 overflow-hidden bg-white/10 shadow-lg flex items-center justify-center">
              {!imgError && userData.avatar ? (
                <img 
                  src={userData.avatar} 
                  alt={userData.nombre}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <User size={40} className="text-white/80" />
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black tracking-wide font-headline uppercase shadow-sm truncate max-w-full">
              {userData.nombre}
            </h3>
            
            <span className="text-xs sm:text-sm font-semibold text-white/80 font-body mt-1 truncate max-w-full">
              {userData.email}
            </span>
          </div>

          {/* CONTENEDOR DE NAVEGACIÓN CON CÁPSULA ANIMADA */}
          <div className="relative w-full pl-6 flex flex-col gap-1 transform-gpu">
            
            {/* Cápsula Blanca Flotante con Esquinas Invertidas */}
            <div 
              className="absolute right-0 w-[266px] h-[64px] bg-white rounded-l-[32px] transition-all duration-300 ease-out transform-gpu"
              style={{ 
                top: `${activeIndex * 68}px`,
                willChange: 'transform',
                marginRight: '-1px'
              }}
            >
              {/* Notches curvos superior e inferior */}
              <div className="absolute right-0 -top-[21px] w-[21px] h-[21px] overflow-hidden pointer-events-none">
                <div className="w-full h-full rounded-br-[21px] shadow-[5px_5px_0_6px_#ffffff]" />
              </div>
              <div className="absolute right-0 -bottom-[21px] w-[21px] h-[21px] overflow-hidden pointer-events-none">
                <div className="w-full h-full rounded-tr-[21px] shadow-[5px_-5px_0_6px_#ffffff]" />
              </div>
            </div>

            {/* BOTONES DE NAVEGACIÓN */}
            {NAV_ITEMS.map((item) => {
              const isActive = activeView === item.key;
              const IconComponent = item.icon;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveView(item.key)}
                  className={`z-10 flex items-center justify-between pl-8 pr-4 h-[64px] rounded-l-[32px] font-extrabold text-[12px] sm:text-[13px] tracking-wider w-full text-left group transition-colors duration-300 border-none outline-none focus:outline-none cursor-pointer ${
                    isActive ? 'text-[#2b62d9]' : 'text-white/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <IconComponent 
                      size={20} 
                      className={`transition-colors duration-200 ${
                        isActive ? 'text-[#2b62d9]' : 'text-white/60 group-hover:text-white'
                      }`} 
                    />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* BOTÓN CERRAR SESIÓN */}
          <div className="mt-auto px-6 pt-4">
            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 bg-white hover:bg-blue-50 text-[#2b62d9] font-black text-xs tracking-wider rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer border border-white/20"
            >
              <LogOut size={18} className="text-[#2b62d9]" />
              <span>CERRAR SESIÓN</span>
            </button>
          </div>

        </aside>

        {/* ================================================================== */}
        {/* ÁREA CENTRAL DE CONTENIDO                                          */}
        {/* ================================================================== */}
        <main className="flex-1 pt-6 pb-10 px-8 sm:px-12 flex flex-col overflow-y-auto bg-white transform-gpu z-0">
          
          {/* ENCABEZADO SUPERIOR */}
          <header className="w-full flex items-center justify-between mb-8 transform-gpu border-b border-slate-100 pb-4">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight font-headline">
              {activeView === 'dashboard' && "Panel General"}
              {activeView === 'infoGeneral' && "Información del Establecimiento"}
              {activeView === 'configGeneral' && "Configuración General"}
              {activeView === 'configEspacios' && "Gestión de Espacios"}
            </h1>

            {/* LOGO PARKINGPATI */}
            <div className="flex items-center gap-2.5 pointer-events-none select-none text-[#2b62d9]">
              <Car size={32} className="text-[#2b62d9]" />
              <span className="text-xl sm:text-2xl font-black tracking-wide font-headline">
                ParkingPaTi
              </span>
            </div>
          </header>

          {/* VISTAS MODULARES CONMUTABLES */}
          <section className="w-full flex-1 transform-gpu">
            {activeView === 'dashboard' && (
              <OwnerDashboardSummary parqueadero={parqueadero} />
            )}
            {activeView === 'infoGeneral' && (
              <OwnerInfoGeneral parqueadero={parqueadero} />
            )}
            {activeView === 'configGeneral' && (
              <OwnerConfigGeneral parqueadero={parqueadero} />
            )}
            {activeView === 'configEspacios' && (
              <OwnerConfigEspacios parqueadero={parqueadero} />
            )}
          </section>

        </main>

      </div>
    </div>
  );
};

export default OwnerDashboardView;