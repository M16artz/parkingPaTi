import React, { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LogIn, MapPinned, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LOJA_BBOX } from '../../config/loja';
import { usePageVisibility } from '../../hooks/usePageVisibility';
import { publicParkingService } from '../../services/publicParkingService';
import {
  PUBLIC_BBOX_DEBOUNCE_MS,
  opcionesPollingPublico,
  serializarBbox,
} from '../../utils/publicParkings';
import { PublicParkingMap } from '../components/public/PublicParkingMap';
import { PublicParkingSidebar } from '../components/public/PublicParkingSidebar';

export const PublicParkingsView = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const visible = usePageVisibility();
  const [bboxCandidate, setBboxCandidate] = useState(LOJA_BBOX);
  const [bbox, setBbox] = useState(LOJA_BBOX);
  const [selectedId, setSelectedId] = useState(null);

  const onViewportChange = useCallback((nextBbox) => {
    queryClient.cancelQueries({ queryKey: ['public-parkings'] });
    setBboxCandidate(nextBbox);
  }, [queryClient]);

  useEffect(() => {
    const timer = window.setTimeout(() => setBbox(bboxCandidate), PUBLIC_BBOX_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [bboxCandidate]);

  useEffect(() => {
    if (!visible) queryClient.cancelQueries({ queryKey: ['public-parkings'] });
  }, [queryClient, visible]);

  const listQuery = useQuery({
    queryKey: ['public-parkings', serializarBbox(bbox)],
    queryFn: ({ signal }) => publicParkingService.listar(bbox, signal),
    enabled: visible,
    ...opcionesPollingPublico(visible),
  });
  const detailQuery = useQuery({
    queryKey: ['public-parking', selectedId],
    queryFn: ({ signal }) => publicParkingService.obtener(selectedId, signal),
    enabled: visible && Boolean(selectedId),
    ...opcionesPollingPublico(visible),
  });

  return <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900">
    <header className="z-20 border-b border-slate-200 bg-white"><div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6"><div className="flex min-w-0 items-center gap-3"><MapPinned className="shrink-0 text-sky-700" /><div className="min-w-0"><h1 className="truncate font-headline text-lg font-bold">ParkingPaTi</h1><p className="truncate text-xs text-slate-500">Parqueaderos de Loja</p></div></div><nav className="flex items-center gap-1"><button className="minimum-touch-target grid place-items-center text-slate-700" type="button" title="Ingresar" aria-label="Ingresar" onClick={() => navigate('/login')}><LogIn size={20} /></button><button className="minimum-touch-target grid place-items-center text-sky-800" type="button" title="Crear cuenta de propietario" aria-label="Crear cuenta de propietario" onClick={() => navigate('/register')}><UserPlus size={20} /></button></nav></div></header>
    <main className="grid flex-1 grid-rows-[minmax(380px,58vh)_minmax(300px,auto)] overflow-hidden lg:h-[calc(100vh-65px)] lg:grid-cols-[360px_minmax(0,1fr)] lg:grid-rows-1">
      <div className="order-2 min-h-0 border-r border-slate-200 lg:order-1"><PublicParkingSidebar listQuery={listQuery} detailQuery={detailQuery} selectedId={selectedId} onSelect={setSelectedId} onClear={() => setSelectedId(null)} /></div>
      <div className="order-1 min-h-0 bg-slate-200 lg:order-2"><PublicParkingMap parkings={listQuery.data?.results ?? []} selectedId={selectedId} onSelect={setSelectedId} onViewportChange={onViewportChange} /></div>
    </main>
  </div>;
};
