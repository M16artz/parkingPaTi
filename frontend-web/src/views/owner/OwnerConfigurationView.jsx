import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOut, Car, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLogoutController } from '../../controllers/useLogoutController';
import { ownerConfigurationService } from '../../services/ownerConfigurationService';
import { extraerErroresApi } from '../../utils/apiError';
import { FinalConfigurationForm } from '../components/owner/FinalConfigurationForm';
import { SpaceGrid } from '../components/owner/SpaceGrid';
import { StayDialog } from '../components/owner/StayDialog';

// Datos de fallback en caso de error de red inicial
const MOCK_DATA = {
  configuracion_completa: false,
  estado_operativo: 'CERRADO',
  espacios_disponibles: 0,
  total_espacios: 0,
  espacios: [],
  tarifas: [],
  horarios: [],
};

export const OwnerConfigurationView = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const logout = useLogoutController();
  const [message, setMessage] = useState('');
  const [stayDialog, setStayDialog] = useState(null);

  // Consulta de configuración general
  const configuration = useQuery({
    queryKey: ['owner', 'configuration'],
    queryFn: ownerConfigurationService.obtener,
    retry: false,
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['owner', 'configuration'] });
    await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
  };

  // Mutación para Guardar Configuración / Modificar Espacios
  const mutation = useMutation({
    mutationFn: ({ type, payload }) => {
      if (type === 'configuration') return ownerConfigurationService.guardar(payload);
      if (type === 'add') return ownerConfigurationService.agregarEspacios(payload);
      if (type === 'edit') return ownerConfigurationService.editarEspacio(payload.id, payload.data);
      if (type === 'delete') return ownerConfigurationService.eliminarEspacio(payload);
      if (type === 'reactivate') return ownerConfigurationService.reactivarEspacio(payload);
      return Promise.reject(new Error('Operación no soportada'));
    },
    onSuccess: async (result, variables) => {
      setMessage(
        variables.type === 'configuration'
          ? 'Configuración guardada exitosamente.'
          : 'Espacios actualizados correctamente.'
      );
      if (variables.type === 'configuration') {
        queryClient.setQueryData(['owner', 'configuration'], result);
      }
      await refresh();

      if (variables.type === 'configuration' && result?.configuracion_completa) {
        navigate('/owner/dashboard', { replace: true });
      }
    },
    onError: (error) => {
      const errores = extraerErroresApi(error);
      setMessage(
        errores.formulario || Object.values(errores)[0] || 'No se pudo completar la operación.'
      );
    },
  });

  // Mutación para Control de Estancias
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
        setMessage('Estancia finalizada. El espacio ha quedado libre.');
      } else {
        setStayDialog(null);
        setMessage('Estancia iniciada. El espacio ha quedado ocupado.');
      }
      await refresh();
    },
    onError: (error) =>
      setMessage(extraerErroresApi(error).formulario || 'No se pudo procesar la estancia.'),
  });

  if (configuration.isPending) {
    return (
      <main className="min-h-screen grid place-items-center bg-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="font-bold text-slate-600 text-sm">Cargando configuración...</span>
        </div>
      </main>
    );
  }

  const data = configuration.isError ? MOCK_DATA : configuration.data || MOCK_DATA;

  // Filtrado de espacios activos vs eliminados lógicamente
  const activeSpaces = (data.espacios || []).filter(
    (s) => s.is_active !== false && s.estado !== 'ELIMINADO'
  );
  const deletedSpaces = (data.espacios || [])
    .filter((s) => s.is_active === false || s.estado === 'ELIMINADO')
    .map((s) => ({
      id: s.id,
      code: s.code || `ESP-${s.id}`,
      nota: 'Borrado lógico',
    }));

  return (
    <div className="min-h-screen bg-white font-sans select-none">
      {/* ENCABEZADO SUPERIOR */}
      <header className="border-b border-slate-100 bg-white shadow-xs sticky top-0 z-10">
        <div className="w-full flex items-center justify-between px-4 sm:px-8 py-4">
          <div className="flex items-center gap-2.5 text-blue-600">
            <Car size={28} strokeWidth={2.2} />
            <span className="font-headline text-2xl font-black tracking-tight">
              ParkingPaTi
            </span>
          </div>

          <button
            type="button"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            onClick={logout}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer text-sm"
          >
            <span>Salir</span>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 py-8">
        {/* Banner de mensaje de estado */}
        {message && (
          <div
            className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-bold text-blue-900 shadow-xs flex items-center justify-between gap-2"
            role="status"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-blue-600 shrink-0" />
              <span>{message}</span>
            </div>
            <button
              type="button"
              onClick={() => setMessage('')}
              className="text-xs text-blue-600 hover:underline font-extrabold cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Formulario Principal de Configuración */}
        <FinalConfigurationForm
          data={data}
          pending={mutation.isPending}
          onSave={(payload) => {
            setMessage('');
            mutation.mutate({ type: 'configuration', payload });
          }}
        >
          {/* Grilla de Espacios Integrada */}
          {data.configuracion_completa && (
            <div className="pt-2">
              <SpaceGrid
                spaces={activeSpaces}
                deletedSpaces={deletedSpaces}
                onAddSpaces={(cantidad) =>
                  mutation.mutate({ type: 'add', payload: cantidad })
                }
                onToggleDisable={(spaceId) => {
                  const targetSpace = activeSpaces.find((s) => s.id === spaceId);
                  const nextEstado =
                    targetSpace?.estado === 'INHABILITADO' ? 'LIBRE' : 'INHABILITADO';
                  mutation.mutate({
                    type: 'edit',
                    payload: { id: spaceId, data: { estado: nextEstado } },
                  });
                }}
                onDeleteSpace={(spaceId) =>
                  mutation.mutate({ type: 'delete', payload: spaceId })
                }
                onReactivateSpace={(spaceId) =>
                  mutation.mutate({ type: 'reactivate', payload: spaceId })
                }
                onStartSession={(space) => setStayDialog({ mode: 'start', space })}
                onViewStay={(space) => stayMutation.mutate({ type: 'current', space })}
              />
            </div>
          )}
        </FinalConfigurationForm>
      </main>

      {/* Diálogo de Estancias */}
      <StayDialog
        mode={stayDialog?.mode}
        space={stayDialog?.space}
        rates={data.tarifas}
        stay={stayDialog?.stay}
        pending={stayMutation.isPending}
        onClose={() => setStayDialog(null)}
        onStart={(rateId) =>
          stayMutation.mutate({ type: 'start', space: stayDialog.space, rateId })
        }
        onFinish={() =>
          stayMutation.mutate({ type: 'finish', space: stayDialog.space })
        }
      />
    </div>
  );
};

export default OwnerConfigurationView;