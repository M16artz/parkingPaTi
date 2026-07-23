import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileCheck, Users, Car, LogOut, User } from 'lucide-react'; 
import { useLocation, useNavigate } from 'react-router-dom';
import { useLogoutController } from '../../controllers/useLogoutController';
import { authService } from '../../services/authService';

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
  const sessionQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.me,
    retry: false,
    staleTime: 30_000,
  });
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
  const session = sessionQuery.data;
  const persona = session?.persona || {};
  const administratorName = `${persona.nombre || ''} ${persona.apellido || ''}`.trim()
    || session?.nombre_completo
    || session?.username
    || 'Administrador';
  const administratorEmail = session?.correo || session?.email || 'Correo no disponible';

  return (
    <div className="min-h-screen w-full bg-bg font-sans antialiased select-none lg:h-screen lg:overflow-hidden lg:p-6">
      
      {/* CONTENEDOR PRINCIPAL */}
      <div className="flex min-h-screen w-full flex-col bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] lg:h-full lg:min-h-0 lg:flex-row lg:overflow-hidden lg:rounded-[32px]">

        <header className="sticky top-0 z-[1200] border-b border-blue-100 bg-white/95 shadow-sm backdrop-blur-xl lg:hidden">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4">
            <div className="flex min-w-0 items-center gap-2 text-primary">
              <Car size={27} className="shrink-0" />
              <div className="min-w-0">
                <p className="font-headline text-lg font-black">ParkingPaTi</p>
                <p className="truncate text-[11px] font-semibold text-slate-500">{administratorName}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="grid min-h-11 min-w-11 place-items-center rounded-xl bg-blue-50 text-primary"
              aria-label="Cerrar sesión"
            >
              <LogOut size={19} />
            </button>
          </div>
          <nav className="grid grid-cols-2 gap-2 px-4 pb-3" aria-label="Panel de administración">
            {NAV_ITEMS.map((item) => {
              const isActive = activeNavKey === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setActiveView(item.key);
                    setSelectedCuentaId(null);
                    navigate(item.key === 'cuentas' ? '/admin/accounts' : '/admin/applications');
                  }}
                  className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl text-xs font-black ${
                    isActive ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <item.icon size={17} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </header>
        
        {/* BARRA LATERAL AZUL */}
        <aside className="relative z-10 hidden w-[290px] shrink-0 flex-col overflow-hidden bg-primary bg-gradient-to-b from-primary to-[#466fd3] pb-8 pt-12 text-white shadow-[8px_0_24px_-4px_rgba(0,0,0,0.15)] transform-gpu lg:flex">
          
          {/* SECCIÓN DEL USUARIO */}
          <div className="flex flex-col items-center px-6 mb-10 text-center">
            <div className="w-24 h-24 rounded-full border-2 border-teal-400 p-1 mb-4 overflow-hidden bg-white/10 shadow-lg flex items-center justify-center">
              <img 
                src={userPhoto} 
                alt={`Perfil de ${administratorName}`}
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
              {administratorName}
            </h3>
            
            <span className="text-base font-semibold text-white/80 font-body mt-1.5">
              {administratorEmail}
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
        <main className="z-0 flex min-w-0 flex-1 flex-col bg-white px-4 pb-10 pt-5 transform-gpu sm:px-6 lg:overflow-y-auto lg:px-12 lg:pb-12 lg:pt-6">
          
          {/* ENCABEZADO */}
          <header className="mb-5 flex w-full items-center justify-between transform-gpu sm:mb-8">
            <h1 className="font-headline text-xl font-black tracking-tight text-slate-800 sm:text-3xl lg:mt-4">
              {activeView === 'solicitudes' && "Solicitudes de Habilitación"}
              {activeView === 'detalle' && "Revisión de Solicitud"}
              {activeView === 'cuentas' && "Gestión y Baja de Cuentas"}
            </h1>

            {/* LOGO PARKINGPATI */}
            <div className="mt-2 hidden items-center gap-3 text-primary pointer-events-none select-none lg:flex">
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
                onApproved={() => {
                  setSelectedCuentaId(null);
                  setActiveView('solicitudes');
                  navigate('/admin/dashboard', { replace: true });
                }}
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
