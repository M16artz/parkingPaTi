import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { ownerConfigurationService } from '../../services/ownerConfigurationService';
import { extraerErroresApi } from '../../utils/apiError';
import { FinalConfigurationForm } from '../components/owner/FinalConfigurationForm';
import { SpaceGrid } from '../components/owner/SpaceGrid';
import { StayDialog } from '../components/owner/StayDialog';

export const OwnerConfigurationView = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [stayDialog, setStayDialog] = useState(null);
  const configuration = useQuery({
    queryKey: ['owner', 'configuration'],
    queryFn: ownerConfigurationService.obtener,
  });
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['owner', 'configuration'] });
    await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
  };
  const mutation = useMutation({
    mutationFn: ({ type, payload }) => {
      if (type === 'configuration') return ownerConfigurationService.guardar(payload);
      if (type === 'add') return ownerConfigurationService.agregarEspacios(payload);
      if (type === 'edit') return ownerConfigurationService.editarEspacio(payload.id, payload.data);
      if (type === 'delete') return ownerConfigurationService.eliminarEspacio(payload);
      if (type === 'reactivate') return ownerConfigurationService.reactivarEspacio(payload);
      return Promise.reject(new Error('Operación no soportada'));
    },
    onSuccess: async (_, variables) => {
      setMessage(variables.type === 'configuration' ? 'Configuración guardada.' : 'Espacios actualizados.');
      await refresh();
    },
    onError: (error) => setMessage(extraerErroresApi(error).formulario || 'No se pudo completar la operación.'),
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
        setMessage('Estancia finalizada. El espacio está libre.');
      } else {
        setStayDialog(null);
        setMessage('Estancia iniciada. El espacio está ocupado.');
      }
      await refresh();
    },
    onError: (error) => setMessage(extraerErroresApi(error).formulario || 'No se pudo completar la estancia.'),
  });

  if (configuration.isPending) return <main className="min-h-screen grid place-items-center bg-slate-100">Cargando configuración...</main>;
  if (configuration.isError) return <main className="min-h-screen grid place-items-center bg-slate-100"><div><p className="text-red-700">No se pudo cargar la configuración.</p><button className="mt-3 font-bold text-sky-700" type="button" onClick={() => configuration.refetch()}>Reintentar</button></div></main>;
  const data = configuration.data;
  return <div className="min-h-screen bg-slate-100">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><div><p className="font-headline text-lg font-bold text-sky-800">ParkingPaTi</p><p className="text-xs text-slate-500">Gestión del parqueadero</p></div><button className="minimum-touch-target grid place-items-center" type="button" title="Cerrar sesión" aria-label="Cerrar sesión" onClick={async () => { await authService.logout(); navigate('/login', { replace: true }); }}><LogOut size={20} /></button></div></header>
    <main className="mx-auto max-w-7xl space-y-6 px-5 py-7">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-2xl font-bold">Configuración y espacios</h1><p className="mt-1 text-sm text-slate-600">{data.configuracion_completa ? 'Administra horarios, tarifas y distribución.' : 'Completa este paso obligatorio para activar el parqueadero.'}</p></div><dl className="flex gap-5 text-sm"><div><dt className="text-slate-500">Estado</dt><dd className="font-bold">{data.estado_operativo}</dd></div><div><dt className="text-slate-500">Disponibles</dt><dd className="font-bold">{data.espacios_disponibles} / {data.total_espacios}</dd></div></dl></div>
      {message && <p className="border border-slate-200 bg-white p-3 text-sm" role="status">{message}</p>}
      {!data.configuracion_completa && <p className="border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">El parqueadero permanece inactivo hasta guardar horarios, tarifa NORMAL y espacios iniciales.</p>}
      <FinalConfigurationForm data={data} pending={mutation.isPending} onSave={(payload) => { setMessage(''); mutation.mutate({ type: 'configuration', payload }); }} />
      {data.configuracion_completa && <SpaceGrid spaces={data.espacios} rates={data.tarifas} pending={mutation.isPending || stayMutation.isPending} onAdd={(cantidad) => mutation.mutate({ type: 'add', payload: cantidad })} onEdit={(space, payload) => mutation.mutate({ type: 'edit', payload: { id: space.id, data: payload } })} onDisable={(space) => mutation.mutate({ type: 'edit', payload: { id: space.id, data: { estado: 'INHABILITADO' } } })} onDelete={(space) => mutation.mutate({ type: 'delete', payload: space.id })} onReactivate={(space) => mutation.mutate({ type: 'reactivate', payload: space.id })} onStartStay={(space) => setStayDialog({ mode: 'start', space })} onViewStay={(space) => stayMutation.mutate({ type: 'current', space })} />}
    </main>
    <StayDialog mode={stayDialog?.mode} space={stayDialog?.space} rates={data.tarifas} stay={stayDialog?.stay} pending={stayMutation.isPending} onClose={() => setStayDialog(null)} onStart={(rateId) => stayMutation.mutate({ type: 'start', space: stayDialog.space, rateId })} onFinish={() => stayMutation.mutate({ type: 'finish', space: stayDialog.space })} />
  </div>;
};
