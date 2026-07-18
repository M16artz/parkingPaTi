import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Car, Grid3X3, LayoutDashboard, LogOut, Settings } from 'lucide-react';
import userPhoto from '../../assets/user.png';
import { useLogoutController } from '../../controllers/useLogoutController';
import { authService } from '../../services/authService';
import { ownerConfigurationService } from '../../services/ownerConfigurationService';
import { parqueaderoService } from '../../services/parqueaderoService';
import { extraerErroresApi } from '../../utils/apiError';
import { OwnerConfigEspacios } from '../components/owner/OwnerConfigEspacios';
import { OwnerConfigGeneral } from '../components/owner/OwnerConfigGeneral';
import { OwnerHome } from '../components/owner/OwnerHome';
import { OwnerInfoGeneral } from '../components/owner/OwnerInfoGeneral';
import { StayDialog } from '../components/owner/StayDialog';

const NAV_ITEMS = [
  { key: 'inicio', icon: LayoutDashboard, label: 'Inicio' },
  { key: 'infoGeneral', icon: Building2, label: 'Información del parqueadero' },
  { key: 'configGeneral', icon: Settings, label: 'Configuración operativa' },
  { key: 'configEspacios', icon: Grid3X3, label: 'Gestión de espacios' },
];
const TITLES = { inicio: 'Panel de control', infoGeneral: 'Información del parqueadero', configGeneral: 'Configuración operativa', configEspacios: 'Gestión de espacios' };

export const OwnerDashboardView = () => {
  const logout = useLogoutController();
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState('inicio');
  const [message, setMessage] = useState('');
  const [stayDialog, setStayDialog] = useState(null);
  const session = useQuery({ queryKey: ['auth', 'me'], queryFn: authService.me, staleTime: 30_000 });
  const parking = useQuery({ queryKey: ['owner', 'parking'], queryFn: async () => (await parqueaderoService.obtenerMios())[0] });
  const configuration = useQuery({ queryKey: ['owner', 'configuration'], queryFn: ownerConfigurationService.obtener, refetchInterval: 5_000 });
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['owner', 'configuration'] }),
      queryClient.invalidateQueries({ queryKey: ['owner', 'parking'] }),
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] }),
    ]);
  };
  const mutation = useMutation({
    mutationFn: ({ type, payload }) => {
      if (type === 'configuration') return ownerConfigurationService.guardar(payload);
      if (type === 'status') return ownerConfigurationService.cambiarEstadoOperativo(payload);
      if (type === 'add') return ownerConfigurationService.agregarEspacios(payload);
      if (type === 'edit') return ownerConfigurationService.editarEspacio(payload.id, payload.data);
      if (type === 'delete') return ownerConfigurationService.eliminarEspacio(payload);
      if (type === 'reactivate') return ownerConfigurationService.reactivarEspacio(payload);
      return Promise.reject(new Error('Operación no soportada'));
    },
    onSuccess: async (_, variables) => {
      const successMessages = {
        configuration: 'Configuración operativa guardada.',
        status: 'Estado operativo actualizado.',
      };
      setMessage(successMessages[variables.type] || 'Espacios actualizados.');
      await refresh();
    },
    onError: (error) => { const errors = extraerErroresApi(error); setMessage(errors.formulario || Object.values(errors)[0] || 'No se pudo completar la operación.'); },
  });
  const stayMutation = useMutation({
    mutationFn: ({ type, space, rateId }) => {
      if (type === 'start') return ownerConfigurationService.iniciarEstancia(space.id, rateId);
      if (type === 'current') return ownerConfigurationService.obtenerEstanciaActual(space.id);
      if (type === 'finish') return ownerConfigurationService.finalizarEstancia(space.id);
      return Promise.reject(new Error('Operación no soportada'));
    },
    onSuccess: async (stay, variables) => {
      if (variables.type === 'current') { setStayDialog({ mode: 'current', space: variables.space, stay }); return; }
      if (variables.type === 'finish') { setStayDialog({ mode: 'final', space: variables.space, stay }); setMessage('Estancia finalizada.'); }
      else { setStayDialog(null); setMessage('Estancia iniciada.'); }
      await refresh();
    },
    onError: (error) => setMessage(extraerErroresApi(error).formulario || 'No se pudo completar la estancia.'),
  });
  const isLoading = session.isPending || parking.isPending || configuration.isPending;
  const isError = session.isError || parking.isError || configuration.isError || (!parking.isPending && !parking.data);
  const fullName = [session.data?.persona?.nombre, session.data?.persona?.apellido].filter(Boolean).join(' ') || 'Propietario';
  const activeIndex = NAV_ITEMS.findIndex((item) => item.key === activeView);

  const navigation = NAV_ITEMS.map((item) => { const Icon = item.icon; const selected = item.key === activeView; return <button key={item.key} type="button" onClick={() => setActiveView(item.key)} className={`relative z-10 flex min-h-16 w-full items-center gap-4 rounded-l-full px-7 text-left text-sm font-bold transition-colors ${selected ? 'text-sky-800' : 'text-white/75 hover:text-white'}`} aria-current={selected ? 'page' : undefined}><Icon size={20} /><span>{item.label}</span></button>; });

  let content = null;
  if (!isLoading && !isError) {
    const data = configuration.data;
    const spaceProps = {
      spaces: data.espacios,
      rates: data.tarifas,
      pending: mutation.isPending || stayMutation.isPending,
      onAdd: (cantidad) => mutation.mutate({ type: 'add', payload: cantidad }),
      onEdit: (space, payload) => mutation.mutate({ type: 'edit', payload: { id: space.id, data: payload } }),
      onDisable: (space) => mutation.mutate({ type: 'edit', payload: { id: space.id, data: { estado: 'INHABILITADO' } } }),
      onDelete: (space) => mutation.mutate({ type: 'delete', payload: space.id }),
      onReactivate: (space) => mutation.mutate({ type: 'reactivate', payload: space.id }),
      onStartStay: (space) => setStayDialog({ mode: 'start', space }),
      onViewStay: (space) => stayMutation.mutate({ type: 'current', space }),
    };
    if (activeView === 'inicio') content = <OwnerHome session={session.data} parqueadero={parking.data} configuration={data} pending={mutation.isPending} onChangeStatus={(status) => mutation.mutate({ type: 'status', payload: status })} onNavigate={setActiveView} />;
    if (activeView === 'infoGeneral') content = <OwnerInfoGeneral parqueadero={parking.data} />;
    if (activeView === 'configGeneral') content = <OwnerConfigGeneral data={data} pending={mutation.isPending} onSave={(payload) => mutation.mutate({ type: 'configuration', payload })} />;
    if (activeView === 'configEspacios') content = <OwnerConfigEspacios {...spaceProps} />;
  }

  return <div className="min-h-screen bg-sky-100 p-2 font-sans antialiased sm:p-4 lg:h-screen lg:p-6">
    <div className="mx-auto flex min-h-[calc(100vh-1rem)] max-w-[1800px] overflow-hidden rounded-3xl bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18)] lg:h-full lg:min-h-0">
      <aside className="relative hidden w-[290px] shrink-0 flex-col overflow-hidden bg-gradient-to-b from-sky-800 to-blue-700 py-8 text-white shadow-xl lg:flex">
        <div className="mb-8 flex flex-col items-center px-6 text-center"><div className="h-20 w-20 overflow-hidden rounded-full border-2 border-teal-300 bg-white/10 p-1 shadow-lg"><img src={userPhoto} alt="Perfil del propietario" className="h-full w-full rounded-full object-cover" /></div><h2 className="mt-4 text-lg font-black uppercase">{fullName}</h2><p className="mt-1 max-w-full truncate text-xs text-white/75">{session.data?.correo}</p></div>
        <nav className="relative ml-6" aria-label="Secciones del propietario"><span className="absolute right-0 h-16 w-[266px] rounded-l-full bg-white transition-transform duration-300 ease-out" style={{ transform: `translateY(${activeIndex * 64}px)` }} />{navigation}</nav>
        <button type="button" onClick={logout} className="mx-6 mt-auto flex min-h-12 items-center gap-4 rounded-xl px-5 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white"><LogOut size={19} /> Cerrar sesión</button>
      </aside>
      <main className="min-w-0 flex-1 overflow-y-auto bg-white">
        <header className="sticky top-0 z-[500] border-b border-slate-100 bg-white/95 px-4 py-4 backdrop-blur sm:px-7 lg:px-10"><div className="flex items-center justify-between gap-4"><h1 className="text-xl font-black text-slate-900 sm:text-2xl lg:text-3xl">{TITLES[activeView]}</h1><div className="flex shrink-0 items-center gap-2 text-sky-700"><Car size={28} /><span className="hidden text-lg font-black sm:inline">ParkingPaTi</span></div></div><nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="Secciones del propietario">{NAV_ITEMS.map((item) => { const Icon = item.icon; const selected = activeView === item.key; return <button key={item.key} type="button" onClick={() => setActiveView(item.key)} className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-xs font-bold transition ${selected ? 'bg-sky-700 text-white shadow' : 'bg-slate-100 text-slate-700'}`}><Icon size={17} />{item.label}</button>; })}<button type="button" onClick={logout} className="grid min-h-11 min-w-11 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700" aria-label="Cerrar sesión"><LogOut size={18} /></button></nav></header>
        <section className="p-4 sm:p-7 lg:p-10">{message && <p className="mb-5 rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold shadow-sm" role="status">{message}</p>}{isLoading && <div className="grid min-h-72 place-items-center text-slate-600">Cargando panel...</div>}{isError && <div className="grid min-h-72 place-items-center text-center"><div><p className="font-bold text-red-700">No se pudo cargar la información del parqueadero.</p><button className="mt-3 font-bold text-sky-700" type="button" onClick={refresh}>Reintentar</button></div></div>}{content}</section>
      </main>
    </div>
    <StayDialog mode={stayDialog?.mode} space={stayDialog?.space} rates={configuration.data?.tarifas || []} stay={stayDialog?.stay} pending={stayMutation.isPending} onClose={() => setStayDialog(null)} onStart={(rateId) => stayMutation.mutate({ type: 'start', space: stayDialog.space, rateId })} onFinish={() => stayMutation.mutate({ type: 'finish', space: stayDialog.space })} />
  </div>;
};
