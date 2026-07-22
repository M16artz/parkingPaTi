import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Car, CheckCircle2, FileUp, LogOut, MapPin, Send, ShieldCheck } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { LOJA_BOUNDS, LOJA_CENTER, estaEnLoja } from '../../config/loja';
import { MAP_ATTRIBUTION, MAP_TILE_URL } from '../../config/env';
import { onboardingService } from '../../services/onboardingService';
import { useLogoutController } from '../../controllers/useLogoutController';
import { extraerErroresApi } from '../../utils/apiError';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

const EMPTY_PARKING = {
  nombre: '', descripcion: '', calle_principal: '', calle_secundaria: '', numero_lote: '',
  latitud: '', longitud: '',
};

function LocationPicker({ position, onChange }) {
  useMapEvents({
    click(event) {
      if (estaEnLoja(event.latlng.lat, event.latlng.lng)) {
        onChange(event.latlng.lat.toFixed(6), event.latlng.lng.toFixed(6));
      }
    },
  });
  return position.latitud && position.longitud
    ? <Marker position={[Number(position.latitud), Number(position.longitud)]} />
    : null;
}

export const OnboardingView = () => {
  const queryClient = useQueryClient();
  const logout = useLogoutController();
  const statusQuery = useQuery({ queryKey: ['owner', 'onboarding'], queryFn: onboardingService.estado });
  const [parking, setParking] = useState(EMPTY_PARKING);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (statusQuery.data?.parqueadero) {
      const current = statusQuery.data.parqueadero;
      setParking(Object.fromEntries(Object.entries({ ...EMPTY_PARKING, ...current }).map(([key, value]) => [key, String(value ?? '')])));
    }
  }, [statusQuery.data]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['owner', 'onboarding'] });
  const mutationOptions = (mutationFn) => ({
    mutationFn,
    onSuccess: refresh,
    onError: (requestError) => setError(extraerErroresApi(requestError).formulario || 'No se pudo completar la operación.'),
  });
  const saveParking = useMutation(mutationOptions(onboardingService.guardarParqueadero));
  const uploadDocument = useMutation(mutationOptions(onboardingService.subirDocumento));
  const submitApplication = useMutation(mutationOptions(onboardingService.enviarSolicitud));

  if (statusQuery.isPending) return <main className="min-h-screen grid place-items-center bg-slate-100 font-sans"><div className="flex flex-col items-center gap-3 rounded-3xl bg-white px-10 py-8 shadow-xl"><div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /><span className="text-sm font-black text-slate-600">Cargando solicitud...</span></div></main>;
  if (statusQuery.isError) return <main className="min-h-screen grid place-items-center bg-slate-100 p-6 font-sans"><section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl"><h1 className="font-headline text-xl font-black text-slate-900">No se pudo recuperar el estado</h1><p className="mt-2 text-sm text-slate-500">Comprueba la conexión e inténtalo nuevamente.</p><Button className="mt-5 rounded-xl" onClick={() => statusQuery.refetch()}>Reintentar</Button></section></main>;
  if (['CONFIGURACION_FINAL', 'COMPLETADO'].includes(statusQuery.data.paso)) {
    return <Navigate to="/owner/configuration" replace />;
  }
  if (statusQuery.data.paso === 'REVISION_PENDIENTE') {
    return <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans"><section className="w-full max-w-lg rounded-[32px] bg-white p-8 text-center shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)]"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-100 text-blue-600"><ShieldCheck size={30} /></span><h1 className="mt-5 font-headline text-2xl font-black text-slate-900">Solicitud enviada</h1><p className="mt-3 text-slate-600">Tu cuenta y documento están pendientes de revisión.</p><button type="button" onClick={logout} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 font-bold text-white hover:bg-blue-700"><LogOut size={17} /> Cerrar sesión</button></section></main>;
  }

  const updateParking = ({ target: { name, value } }) => setParking((current) => ({ ...current, [name]: value }));
  const hasParking = Boolean(statusQuery.data.parqueadero);
  const hasDocument = Boolean(statusQuery.data.documento);

  return (
    <div className="min-h-screen bg-white font-sans select-none">
      <div className="min-h-screen bg-white">
        <header className="sticky top-0 z-10 border-b border-slate-100 bg-white shadow-xs">
          <div className="flex w-full items-center justify-between px-4 py-4 sm:px-8">
          <div className="flex items-center gap-2.5 text-[#2b62d9]">
            <Car size={28} strokeWidth={2.2} />
            <span className="font-headline text-2xl font-black tracking-tight">ParkingPaTi</span>
          </div>
          <button type="button" onClick={logout} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95">
            <span>Cerrar sesión</span><LogOut size={18} />
          </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
          <section className="rounded-[28px] border border-blue-100/60 bg-[#e2f2fe] p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 rounded-2xl border border-white bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-[11px] font-black uppercase tracking-wider text-blue-600">Registro de propietario</p><h1 className="mt-2 font-headline text-3xl font-black tracking-tight text-slate-800">Completa tu solicitud</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">El progreso queda guardado. Completa la información, adjunta el documento y envía la solicitud.</p></div>
              <div className="flex gap-2 text-xs font-black"><span className={`rounded-full px-3 py-2 ${hasParking ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>1. Datos</span><span className={`rounded-full px-3 py-2 ${hasDocument ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>2. Documento</span><span className="rounded-full bg-blue-50 px-3 py-2 text-blue-700">3. Envío</span></div>
            </div>
          </section>

          {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700 shadow-sm" role="alert">{error}</div>}

          <section className="rounded-[28px] border border-blue-100/60 bg-[#e2f2fe] p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3"><Building2 className="text-blue-600" size={21} /><h2 className="font-headline text-base font-black uppercase tracking-wider text-slate-800">Información del parqueadero</h2>{hasParking && <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black text-emerald-800"><CheckCircle2 size={13} /> Guardada</span>}</div>
            <div className="rounded-2xl border border-white bg-white p-5 shadow-sm sm:p-6">
              <div className="grid gap-x-6 md:grid-cols-2">
                {[
                  ['nombre', 'Nombre del parqueadero'], ['descripcion', 'Descripción'],
                  ['calle_principal', 'Calle principal'], ['calle_secundaria', 'Calle secundaria'],
                  ['numero_lote', 'Número de lote'],
                ].map(([name, label]) => <Input className="max-w-none" key={name} name={name} label={label} value={parking[name]} onChange={updateParking} />)}
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-700"><MapPin className="text-blue-600" size={18} /> Selecciona la ubicación exacta</div>
              <div className="mt-3 h-80 overflow-hidden rounded-2xl border-2 border-white shadow-md ring-1 ring-slate-200">
                <MapContainer center={LOJA_CENTER} zoom={13} maxBounds={LOJA_BOUNDS} maxBoundsViscosity={1} className="h-full w-full">
                  <TileLayer url={MAP_TILE_URL} attribution={MAP_ATTRIBUTION} />
                  <LocationPicker position={parking} onChange={(latitud, longitud) => setParking((current) => ({ ...current, latitud, longitud }))} />
                </MapContainer>
              </div>
              <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500">Latitud: {parking.latitud || 'Sin seleccionar'} · Longitud: {parking.longitud || 'Sin seleccionar'}</p>
              <Button className="mt-5 rounded-xl bg-[#2b62d9] px-6 font-bold" disabled={!parking.latitud || !parking.longitud} isLoading={saveParking.isPending} onClick={() => { setError(''); saveParking.mutate(parking); }}>Guardar datos</Button>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-[28px] border border-blue-100/60 bg-[#e2f2fe] p-6 shadow-sm sm:p-8">
              <div className="mb-5 flex items-center gap-3"><FileUp className="text-blue-600" size={21} /><h2 className="font-headline text-base font-black uppercase tracking-wider text-slate-800">Documento privado</h2></div>
              <div className="h-[calc(100%-2.5rem)] rounded-2xl bg-white p-6 shadow-sm">
                {hasDocument && <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">Documento actual: {statusQuery.data.documento.nombre_original}</p>}
                <label className="block rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-bold text-slate-600 hover:border-blue-300"><FileUp className="mx-auto mb-2 text-blue-600" /><span>{file?.name || 'Selecciona un PDF, JPG o PNG'}</span><input className="mt-4 block w-full text-xs" type="file" accept="application/pdf,image/jpeg,image/png" onChange={(event) => setFile(event.target.files?.[0] || null)} /></label>
                <Button className="mt-5 rounded-xl bg-[#2b62d9] font-bold" disabled={!file || !hasParking} isLoading={uploadDocument.isPending} onClick={() => { setError(''); uploadDocument.mutate(file); }}>{hasDocument ? 'Reemplazar documento' : 'Subir documento'}</Button>
              </div>
            </section>

            <section className="rounded-[28px] border border-blue-100/60 bg-[#e2f2fe] p-6 shadow-sm sm:p-8">
              <div className="mb-5 flex items-center gap-3"><Send className="text-blue-600" size={21} /><h2 className="font-headline text-base font-black uppercase tracking-wider text-slate-800">Enviar solicitud</h2></div>
              <div className="flex h-[calc(100%-2.5rem)] flex-col justify-between rounded-2xl bg-white p-6 shadow-sm">
                <div><span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600"><ShieldCheck size={23} /></span><h3 className="mt-4 font-black text-slate-900">Revisión administrativa</h3><p className="mt-2 text-sm leading-6 text-slate-500">Confirma cuando los datos y el documento estén completos. Después del envío podrás consultar el estado de revisión.</p></div>
                <Button className="mt-6 rounded-xl bg-[#2b62d9] font-bold" disabled={!hasParking || !hasDocument} isLoading={submitApplication.isPending} onClick={() => { if (window.confirm('¿Confirmas enviar la solicitud para revisión?')) { setError(''); submitApplication.mutate(); } }}>Enviar a revisión</Button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};
