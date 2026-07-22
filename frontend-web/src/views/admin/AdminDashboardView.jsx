import React, { useEffect, useState } from 'react';
import { FileCheck, Users, Car, LogOut, User } from 'lucide-react'; 
import { useLocation, useNavigate } from 'react-router-dom';
import { useLogoutController } from '../../controllers/useLogoutController';

// Importación opcional de foto de usuario local (o fallback)
import userPhoto from '../../assets/user.png';

// Vistas modulares del Admin
import { AdminApplicationsView } from './AdminApplicationsView';
import { AdminApplicationDetailView } from './AdminApplicationDetailView';
import { AdminAccountsView } from './AdminAccountsView';

// ============================================================================
// CONSTANTES DE CONFIGURACIÓN DE LA NAVEGACIÓN LATERAL
// ============================================================================
const NAV_ITEMS = [
  { key: 'solicitudes', icon: FileCheck, label: 'SOLICITUDES', index: 0 },
  { key: 'cuentas', icon: Users, label: 'CUENTAS', index: 1 },
];

export const AdminDashboardView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useLogoutController();
  const routeView = location.pathname === '/admin/accounts' ? 'cuentas' : 'solicitudes';
  const [activeView, setActiveView] = useState(routeView); // 'solicitudes' | 'detalle' | 'cuentas'
  const [selectedCuentaId, setSelectedCuentaId] = useState(null);

  useEffect(() => {
    if (activeView !== 'detalle') setActiveView(routeView);
  }, [activeView, routeView]);

  // Mapear la vista 'detalle' al índice de 'solicitudes' para mantener la cápsula activa ahí
  const activeNavKey = activeView === 'detalle' ? 'solicitudes' : activeView;
  const activeIndex = NAV_ITEMS.find(item => item.key === activeNavKey)?.index ?? 0;

  const handleLogout = logout;

  return (
    <div className="w-screen h-screen flex p-6 bg-bg select-none overflow-hidden font-sans antialiased">
      
      {/* CONTENEDOR PRINCIPAL */}
      <div className="w-full h-full flex bg-white rounded-[32px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden">
        
        {/* BARRA LATERAL AZUL */}
        <aside className="w-[290px] bg-primary bg-gradient-to-b from-primary to-[#466fd3] flex flex-col pt-12 pb-8 px-0 text-white relative transform-gpu z-10 overflow-hidden shadow-[8px_0_24px_-4px_rgba(0,0,0,0.15)]">
          
          {/* SECCIÓN DEL USUARIO */}
          <div className="flex flex-col items-center px-6 mb-10 text-center">
            <div className="w-24 h-24 rounded-full border-2 border-teal-400 p-1 mb-4 overflow-hidden bg-white/10 shadow-lg flex items-center justify-center">
              <img 
                src={userPhoto} 
                alt="User Profile" 
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  // Fallback por si la imagen local no existe
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add('bg-white');
                }}
              />
              <User size={48} className="text-primary hidden font-bold" />
            </div>

            <h3 className="text-2xl font-black tracking-wide font-headline uppercase shadow-sm">
              María Buri
            </h3>
            
            <span className="text-base font-semibold text-white/80 font-body mt-1.5">
              maria.buri@gmail.com
            </span>
          </div>

          {/* CONTENEDOR DE NAVEGACIÓN CON CÁPSULA ANIMADA */}
          <div className="relative w-full pl-6 flex flex-col gap-1 transform-gpu">
            
            {/* Cápsula Blanca Flotante */}
            <div 
              className="absolute right-0 w-[266px] h-[64px] bg-white rounded-l-[32px] transition-all duration-300 ease-out transform-gpu"
              style={{ 
                top: `${activeIndex * 68}px`,
                willChange: 'transform',
                marginRight: '-1px'
              }}
            >
              <div className="absolute right-0 -top-[21px] w-[21px] h-[21px] overflow-hidden pointer-events-none">
                <div className="w-full h-full rounded-br-[21px] shadow-[5px_5px_0_6px_#ffffff]" />
              </div>
              <div className="absolute right-0 -bottom-[21px] w-[21px] h-[21px] overflow-hidden pointer-events-none">
                <div className="w-full h-full rounded-tr-[21px] shadow-[5px_-5px_0_6px_#ffffff]" />
              </div>
            </div>

            {/* BOTONES NAVEGACIÓN */}
            {NAV_ITEMS.map((item) => {
              const isActive = activeNavKey === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setActiveView(item.key);
                    if (item.key !== 'detalle') setSelectedCuentaId(null);
                    navigate(item.key === 'cuentas' ? '/admin/accounts' : '/admin/applications');
                  }}
                  className={`z-10 flex items-center justify-between pl-8 pr-4 h-[64px] rounded-l-[32px] font-bold text-[13px] tracking-wider w-full text-left group transition-colors duration-300 border-none outline-none focus:outline-none cursor-pointer ${
                    isActive ? 'text-primary' : 'text-white/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <item.icon 
                      size={20} 
                      className={`transition-colors duration-200 ${
                        isActive ? 'text-primary' : 'text-white/50 group-hover:text-white'
                      }`} 
                    />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* LOG OUT - BOTÓN BLANCO CON BORDES REDONDOS */}
          <div className="mt-auto px-6">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white hover:bg-blue-50 text-blue-600 font-black text-xs tracking-wider rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer border border-white/20"
            >
              <LogOut size={18} className="text-blue-600" />
              <span>LOG OUT</span>
            </button>
          </div>

        </aside>

        {/* ÁREA CENTRAL DE CONTENIDO */}
        <main className="flex-1 pt-6 pb-12 px-12 flex flex-col overflow-y-auto bg-white transform-gpu z-0">
          
          {/* ENCABEZADO */}
          <header className="w-full flex items-center justify-between mb-8 transform-gpu">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight font-headline mt-4">
              {activeView === 'solicitudes' && "Solicitudes de Habilitación"}
              {activeView === 'detalle' && "Revisión de Solicitud"}
              {activeView === 'cuentas' && "Gestión y Baja de Cuentas"}
            </h1>

            {/* LOGO PARKINGPATI */}
            <div className="flex items-center gap-3 pointer-events-none select-none text-primary mt-2">
              <Car size={36} className="text-primary" />
              <span className="text-2xl font-black tracking-wide font-headline">
                ParkingPaTi
              </span>
            </div>
          </header>

          {/* VISTAS MODULARES */}
          <section className="w-full flex-1 transform-gpu">
            {activeView === 'solicitudes' && (
              <AdminApplicationsView
                onSelectSolicitud={(id) => {
                  setSelectedCuentaId(id);
                  setActiveView('detalle');
                }}
              />
            )}

            {activeView === 'detalle' && (
              <AdminApplicationDetailView
                cuentaId={selectedCuentaId}
                onBack={() => setActiveView('solicitudes')}
              />
            )}

            {activeView === 'cuentas' && <AdminAccountsView />}
          </section>

        </main>

      </div>
    </div>
  );
};

export default AdminDashboardView;
