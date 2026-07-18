import React, { useState } from 'react';
import { LoaderCircle, RefreshCw, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePublicParkingsController } from '../../controllers/usePublicParkingsController';
import { ParkingDetailPanel } from '../components/public/ParkingDetailPanel';
import { ParkingResultsList } from '../components/public/ParkingResultsList';
import { ParkingSearchFilters } from '../components/public/ParkingSearchFilters';
import { PublicParkingMap } from '../components/public/PublicParkingMap';
import { PublicParkingNavbar } from '../components/public/PublicParkingNavbar';

export const GhostDashboard = () => {
  const navigate = useNavigate();
  const controller = usePublicParkingsController();
  const [tileError, setTileError] = useState(false);

  return <div className="min-h-screen overflow-x-hidden bg-slate-100 font-body text-slate-900">
    <PublicParkingNavbar onHome={() => navigate('/')} onLogin={() => navigate('/login')} onRegister={() => navigate('/register')} />
    <ParkingSearchFilters
      search={controller.search}
      filter={controller.filter}
      resultCount={controller.results.length}
      userLocation={controller.userLocation}
      locationState={controller.locationState}
      onSearch={controller.setSearch}
      onFilter={controller.setFilter}
      onLocation={controller.requestLocation}
      onClear={controller.resetFilters}
    />
    <main className="mx-auto grid max-w-[1800px] lg:h-[calc(100vh-157px)] lg:min-h-[650px] lg:grid-cols-[minmax(0,1fr)_420px] lg:grid-rows-[minmax(430px,1fr)_minmax(220px,auto)]">
      <section aria-label="Mapa de parqueaderos de Loja" className="relative h-[340px] min-w-0 bg-slate-200 sm:h-[420px] lg:col-start-1 lg:row-start-1 lg:h-auto">
        <PublicParkingMap
          parkings={controller.results}
          selectedId={controller.selectedId}
          userLocation={controller.userLocation}
          mapCommand={controller.mapCommand}
          onSelect={controller.selectParking}
          onViewportChange={controller.onViewportChange}
          onTileError={() => setTileError(true)}
        />
        {controller.listQuery.isPending && !controller.listQuery.data && <div className="absolute inset-0 z-[500] grid place-items-center bg-white/65 backdrop-blur-[1px]" role="status"><span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-bold text-sky-800 shadow-lg"><LoaderCircle aria-hidden="true" className="animate-spin" />Cargando parqueaderos…</span></div>}
        {controller.listQuery.isError && !controller.listQuery.data && <div className="absolute inset-x-4 top-4 z-[500] rounded-2xl border border-red-200 bg-white p-4 shadow-xl"><p className="flex items-center gap-2 font-bold text-red-800"><WifiOff aria-hidden="true" size={18} />No pudimos cargar los parqueaderos.</p><p className="mt-1 text-sm text-slate-600">Revisa tu conexión e inténtalo nuevamente.</p><button type="button" onClick={() => controller.listQuery.refetch()} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-sky-700 px-4 text-sm font-bold text-white"><RefreshCw aria-hidden="true" size={16} />Reintentar</button></div>}
        {controller.listQuery.isFetching && controller.listQuery.data && <span className="absolute right-3 top-3 z-[500] inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs font-bold text-sky-800 shadow"><LoaderCircle aria-hidden="true" className="animate-spin" size={15} />Actualizando</span>}
        {tileError && <div className="absolute bottom-3 left-3 right-3 z-[500] flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white/95 px-3 py-2 text-xs text-amber-900 shadow"><span>No se pudieron cargar algunos mosaicos del mapa. La lista sigue disponible.</span><button type="button" onClick={() => setTileError(false)} className="font-bold underline">Ocultar</button></div>}
      </section>
      <div className="min-h-0 border-y border-slate-200 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:border-l lg:border-y-0">
        <ParkingDetailPanel
          detailQuery={controller.detailQuery}
          selectedId={controller.selectedId}
          userLocation={controller.userLocation}
          onDeselect={() => controller.selectParking(null)}
          onLogin={() => navigate('/login')}
        />
      </div>
      <div className="min-h-0 overflow-y-auto lg:col-start-1 lg:row-start-2">
        <ParkingResultsList
          results={controller.results}
          selectedId={controller.selectedId}
          loading={controller.listQuery.isPending}
          onSelect={controller.selectParking}
          onClear={controller.resetFilters}
          onResetArea={controller.resetArea}
        />
      </div>
    </main>
  </div>;
};
