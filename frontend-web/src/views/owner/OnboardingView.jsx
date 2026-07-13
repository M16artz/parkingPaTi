import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileUp, MapPin, Send } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { LOJA_BOUNDS, LOJA_CENTER, estaEnLoja } from '../../config/loja';
import { MAP_ATTRIBUTION, MAP_TILE_URL } from '../../config/env';
import { onboardingService } from '../../services/onboardingService';
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

  if (statusQuery.isPending) return <main className="p-8">Cargando onboarding...</main>;
  if (statusQuery.isError) return <main className="p-8">No se pudo recuperar el estado. <Button onClick={() => statusQuery.refetch()}>Reintentar</Button></main>;
  if (['CONFIGURACION_FINAL', 'COMPLETADO'].includes(statusQuery.data.paso)) {
    return <Navigate to="/owner/configuration" replace />;
  }
  if (statusQuery.data.paso === 'REVISION_PENDIENTE') {
    return <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6"><section className="bg-white border p-8 max-w-lg"><h1 className="text-2xl font-bold">Solicitud enviada</h1><p className="mt-3 text-slate-600">Tu cuenta y documento están pendientes de revisión.</p></section></main>;
  }

  const updateParking = ({ target: { name, value } }) => setParking((current) => ({ ...current, [name]: value }));
  const hasParking = Boolean(statusQuery.data.parqueadero);
  const hasDocument = Boolean(statusQuery.data.documento);

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-5">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-slate-900">Completa tu solicitud</h1>
        <p className="mt-2 text-slate-600">El progreso queda guardado y puedes continuar después.</p>
        {error && <p className="mt-4 border border-red-200 bg-red-50 p-3 text-red-700">{error}</p>}

        <section className="mt-7 bg-white border border-slate-200 p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold"><MapPin size={20} /> Datos iniciales</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              ['nombre', 'Nombre del parqueadero'], ['descripcion', 'Descripción'],
              ['calle_principal', 'Calle principal'], ['calle_secundaria', 'Calle secundaria'],
              ['numero_lote', 'Número de lote'],
            ].map(([name, label]) => <Input key={name} name={name} label={label} value={parking[name]} onChange={updateParking} />)}
          </div>
          <div className="h-80 border border-slate-300">
            <MapContainer center={LOJA_CENTER} zoom={13} maxBounds={LOJA_BOUNDS} maxBoundsViscosity={1} className="h-full w-full">
              <TileLayer url={MAP_TILE_URL} attribution={MAP_ATTRIBUTION} />
              <LocationPicker position={parking} onChange={(latitud, longitud) => setParking((current) => ({ ...current, latitud, longitud }))} />
            </MapContainer>
          </div>
          <p className="mt-2 text-sm text-slate-600">Latitud: {parking.latitud} · Longitud: {parking.longitud}</p>
          <Button className="mt-4" disabled={!parking.latitud || !parking.longitud} isLoading={saveParking.isPending} onClick={() => { setError(''); saveParking.mutate(parking); }}>Guardar datos</Button>
        </section>

        <section className="mt-5 bg-white border border-slate-200 p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold"><FileUp size={20} /> Documento privado</h2>
          {hasDocument && <p className="mt-2 text-sm text-slate-600">Documento actual: {statusQuery.data.documento.nombre_original}</p>}
          <input className="mt-4 block w-full" type="file" accept="application/pdf,image/jpeg,image/png" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          <Button className="mt-4" disabled={!file || !hasParking} isLoading={uploadDocument.isPending} onClick={() => { setError(''); uploadDocument.mutate(file); }}>{hasDocument ? 'Reemplazar documento' : 'Subir documento'}</Button>
        </section>

        <section className="mt-5 bg-white border border-slate-200 p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold"><Send size={20} /> Enviar solicitud</h2>
          <p className="mt-2 text-slate-600">Confirma cuando los datos y el documento estén completos.</p>
          <Button className="mt-4" disabled={!hasParking || !hasDocument} isLoading={submitApplication.isPending} onClick={() => { if (window.confirm('¿Confirmas enviar la solicitud para revisión?')) { setError(''); submitApplication.mutate(); } }}>Enviar a revisión</Button>
        </section>
      </div>
    </main>
  );
};
