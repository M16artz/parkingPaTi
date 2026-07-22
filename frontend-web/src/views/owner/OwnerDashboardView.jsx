import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LayoutDashboard, Info, Settings, Key, Car, LogOut, User } from 'lucide-react'; 
import { useLogoutController } from '../../controllers/useLogoutController';
import { authService } from '../../services/authService';
import { ownerConfigurationService } from '../../services/ownerConfigurationService';
import { parqueaderoService } from '../../services/parqueaderoService';
import { extraerErroresApi } from '../../utils/apiError';
import { obtenerHorarioHoy } from '../../utils/ownerDashboard';

// Asset por defecto (si la ruta existe en tu proyecto)
import userPhotoDefault from '../../assets/user.png';

// Vistas modulares internas
import { OwnerDashboardSummary } from '../components/owner/OwnerDashboardSummary';
import { OwnerInfoGeneral } from '../components/owner/OwnerInfoGeneral';
import { OwnerConfigGeneral } from '../components/owner/OwnerConfigGeneral';
import { OwnerConfigEspacios } from '../components/owner/OwnerConfigEspacios';
import { StayDialog } from '../components/owner/StayDialog';

// ============================================================================
// CONSTANTES DE NAVEGACIÓN LATERAL
// ============================================================================
const NAV_ITEMS = [
  { key: 'dashboard', icon: LayoutDashboard, label: 'DASHBOARD', index: 0 },
  { key: 'infoGeneral', icon: Info, label: 'CONFIGURACIÓN INFORMACIÓN', index: 1 },
  { key: 'configGeneral', icon: Settings, label: 'CONFIGURACIÓN GENERAL', index: 2 },
  { key: 'configEspacios', icon: Key, label: 'CONFIGURACIÓN ESPACIOS', index: 3 },
];

export const OwnerDashboardView = () => {
  const logout = useLogoutController();
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState('dashboard');
  const [imgError, setImgError] = useState(false);
  const [message, setMessage] = useState('');
  const [stayDialog, setStayDialog] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(() => setMessage(''), 5000);
    return () => window.clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeView]);

  const sessionQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.me,
    retry: false,
    staleTime: 30_000,
  });
  const parkingQuery = useQuery({
    queryKey: ['owner', 'parkings'],
    queryFn: parqueaderoService.obtenerMios,
    retry: false,
  });
  const configurationQuery = useQuery({
    queryKey: ['owner', 'configuration'],
    queryFn: ownerConfigurationService.obtener,
    retry: false,
  });
  const metricsQuery = useQuery({
    queryKey: ['owner', 'dashboard-metrics'],
    queryFn: ownerConfigurationService.obtenerMetricasHoy,
    retry: false,
    refetchInterval: 60_000,
  });

  const mutation = useMutation({
    mutationFn: ({ type, payload }) => {
      if (type === 'status') return ownerConfigurationService.cambiarEstadoOperativo(payload);
      if (type === 'configuration') return ownerConfigurationService.guardar(payload);
      if (type === 'edit-space') return ownerConfigurationService.editarEspacio(payload.id, payload.data);
      if (type === 'add-spaces') return ownerConfigurationService.agregarEspacios(payload);
      if (type === 'delete-space') return ownerConfigurationService.eliminarEspacio(payload);
      if (type === 'reactivate-space') return ownerConfigurationService.reactivarEspacio(payload);
      return Promise.reject(new Error('Operación no soportada'));
    },
    onSuccess: async (result, variables) => {
      if (result?.horarios) queryClient.setQueryData(['owner', 'configuration'], result);
      const successMessages = {
        'add-spaces': `Se agregaron ${variables.payload} ${variables.payload === 1 ? 'espacio' : 'espacios'} correctamente.`,
        'delete-space': 'Espacio no disponible. Puedes revertir esta acción durante 15 segundos.',
        'reactivate-space': 'La acción se revirtió y el espacio volvió a estar disponible.',
      };
      setMessage(successMessages[variables.type] || 'Cambios guardados correctamente.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['owner', 'configuration'] }),
        queryClient.invalidateQueries({ queryKey: ['owner', 'parkings'] }),
        queryClient.invalidateQueries({ queryKey: ['owner', 'dashboard-metrics'] }),
      ]);
    },
    onError: (error) => setMessage(
      extraerErroresApi(error).formulario || 'No se pudieron guardar los cambios.'
    ),
  });

  const stayMutation = useMutation({
    mutationFn: ({ type, space, rateId }) => {
      if (type === 'start') return ownerConfigurationService.iniciarEstancia(space.id, rateId);
      if (type === 'current') return ownerConfigurationService.obtenerEstanciaActual(space.id);
      if (type === 'finish') return ownerConfigurationService.finalizarEstancia(space.id);
      return Promise.reject(new Error('Operación de estancia no soportada'));
    },
    onSuccess: async (stay, variables) => {
      if (variables.type === 'current') {
        setStayDialog({ mode: 'current', space: variables.space, stay });
        return;
      }
      if (variables.type === 'finish') {
        setStayDialog({ mode: 'final', space: variables.space, stay });
        setMessage('Estancia finalizada. El espacio volvió a estar libre.');
      } else {
        setStayDialog(null);
        setMessage('Estancia iniciada. El conteo está en curso.');
      }
      await queryClient.invalidateQueries({ queryKey: ['owner', 'configuration'] });
      await queryClient.invalidateQueries({ queryKey: ['owner', 'dashboard-metrics'] });
    },
    onError: (error) => setMessage(
      extraerErroresApi(error).formulario || 'No se pudo procesar la estancia.'
    ),
  });

  const session = sessionQuery.data;
  const parkingList = parkingQuery.data?.results || parkingQuery.data || [];
  const parqueadero = Array.isArray(parkingList) ? parkingList[0] : parkingList;
  const configuration = configurationQuery.data;
  const loading = sessionQuery.isPending || parkingQuery.isPending || configurationQuery.isPending;
  const loadError = sessionQuery.error || parkingQuery.error || configurationQuery.error;
  const activeSpaces = (configuration?.espacios || []).filter((space) => space.is_active);
  const deletedSpaces = (configuration?.espacios || [])
    .filter((space) => !space.is_active)
    .map((space) => ({ id: space.id, code: space.nombre, deletedAt: space.deleted_at }));
  const todaySchedule = obtenerHorarioHoy(configuration?.horarios);
  const dashboardParking = {
    ...parqueadero,
    estado_operativo: configuration?.estado_operativo,
    estado_operativo_manual: configuration?.estado_operativo_manual,
    capacidad_total: configuration?.total_espacios || parqueadero?.total_espacios || 0,
    horario_atencion: todaySchedule
      ? `${todaySchedule.hora_apertura.slice(0, 5)} - ${todaySchedule.hora_cierre.slice(0, 5)}`
      : 'Sin atención hoy',
  };
  const dashboardMetrics = {
    libres: activeSpaces.filter((space) => space.estado === 'LIBRE').length,
    ocupados: activeSpaces.filter((space) => space.estado === 'OCUPADO').length,
    estanciasHoy: metricsQuery.data?.estancias_hoy || 0,
    estanciasActivas: metricsQuery.data?.estancias_activas || 0,
    ingresosHoy: new Intl.NumberFormat('es-EC', {
      style: 'currency', currency: 'USD',
    }).format(Number(metricsQuery.data?.ingresos_estimados || 0)),
    ingresosFinalizados: metricsQuery.data?.ingresos_finalizados || '0.00',
    ingresosEnCurso: metricsQuery.data?.ingresos_en_curso || '0.00',
    calculadoHasta: metricsQuery.data?.calculado_hasta,
    loading: metricsQuery.isPending,
    error: metricsQuery.isError,
  };

  // Datos dinámicos del usuario con fallbacks
  const userData = {
    nombre: session?.persona
      ? `${session.persona.nombre || ''} ${session.persona.apellido || ''}`.trim()
      : session?.nombre_completo || 'Propietario',
    email: session?.correo || session?.email || 'Sin correo',
    avatar: session?.avatar_url || userPhotoDefault,
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
        <main ref={contentRef} className="flex-1 pt-6 pb-10 px-8 sm:px-12 flex flex-col overflow-y-auto bg-white transform-gpu z-0">
          
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
            {message && (
              <div className="fixed right-4 top-4 z-[1400] max-w-md rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-bold text-blue-900 shadow-xl sm:right-6 sm:top-6" role="status">
                {message}
              </div>
            )}
            {loading && <p className="py-12 text-center font-bold text-slate-500">Cargando datos del parqueadero...</p>}
            {!loading && loadError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
                <p className="font-bold">No se pudo consultar el backend.</p>
                <button
                  type="button"
                  className="mt-3 rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white"
                  onClick={() => Promise.all([
                    sessionQuery.refetch(), parkingQuery.refetch(), configurationQuery.refetch(),
                  ])}
                >
                  Reintentar
                </button>
              </div>
            )}
            {!loading && !loadError && activeView === 'dashboard' && (
              <OwnerDashboardSummary
                parqueadero={dashboardParking}
                metrics={dashboardMetrics}
                onStatusChange={(payload) => mutation.mutate({ type: 'status', payload })}
              />
            )}
            {!loading && !loadError && activeView === 'infoGeneral' && (
              <OwnerInfoGeneral parqueadero={parqueadero} />
            )}
            {!loading && !loadError && activeView === 'configGeneral' && (
              <OwnerConfigGeneral
                data={configuration}
                pending={mutation.isPending}
                onSave={(payload) => mutation.mutate({ type: 'configuration', payload })}
              />
            )}
            {!loading && !loadError && activeView === 'configEspacios' && (
              <OwnerConfigEspacios
                spaces={activeSpaces}
                deletedSpaces={deletedSpaces}
                onAddSpaces={(payload) => mutation.mutate({ type: 'add-spaces', payload })}
                onToggleDisable={(id) => {
                  const target = activeSpaces.find((space) => space.id === id);
                  mutation.mutate({
                    type: 'edit-space',
                    payload: { id, data: { estado: target?.estado === 'INHABILITADO' ? 'LIBRE' : 'INHABILITADO' } },
                  });
                }}
                onDeleteSpace={(payload) => mutation.mutate({ type: 'delete-space', payload })}
                onReactivateSpace={(payload) => mutation.mutate({ type: 'reactivate-space', payload })}
                onStartSession={(space) => setStayDialog({ mode: 'start', space })}
                onViewStay={(space) => stayMutation.mutate({ type: 'current', space })}
              />
            )}
          </section>

        </main>

      </div>

      <StayDialog
        mode={stayDialog?.mode}
        space={stayDialog?.space}
        rates={configuration?.tarifas || []}
        stay={stayDialog?.stay}
        pending={stayMutation.isPending}
        onClose={() => setStayDialog(null)}
        onStart={(rateId) => stayMutation.mutate({
          type: 'start', space: stayDialog.space, rateId,
        })}
        onFinish={() => stayMutation.mutate({
          type: 'finish', space: stayDialog.space,
        })}
      />
    </div>
  );
};

export default OwnerDashboardView;
