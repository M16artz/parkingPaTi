import React from 'react';
import { LocateFixed } from 'lucide-react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { LOJA_BOUNDS, LOJA_CENTER, estaEnLoja } from '../../../config/loja';
import { MAP_ATTRIBUTION, MAP_TILE_URL } from '../../../config/env';

const LocationEvents = ({ formData, onSelect, onReject }) => {
  useMapEvents({ click({ latlng }) {
    if (!estaEnLoja(latlng.lat, latlng.lng)) return onReject();
    onSelect(latlng.lat.toFixed(6), latlng.lng.toFixed(6));
  } });
  return formData.latitud && formData.longitud ? <Marker position={[Number(formData.latitud), Number(formData.longitud)]} /> : null;
};

const RecenterButton = () => {
  const map = useMap();
  return <button type="button" onClick={() => map.setView(LOJA_CENTER, 13)} className="absolute right-3 top-3 z-[500] inline-flex min-h-10 items-center gap-2 rounded-lg bg-white px-3 text-xs font-bold text-slate-700 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Volver a centrar el mapa en Loja"><LocateFixed aria-hidden="true" size={16} /> Centrar</button>;
};

export const ParkingLocationMap = ({ formData, error, locationError, onSelect, onReject }) => <div>
  <p className="mb-3 text-sm text-slate-600">Haz clic dentro del mapa para marcar la entrada principal del parqueadero.</p>
  <div className={`relative h-[280px] overflow-hidden rounded-2xl border sm:h-[340px] ${error ? 'border-red-500' : 'border-slate-300'}`}>
    <MapContainer center={LOJA_CENTER} zoom={13} maxBounds={LOJA_BOUNDS} maxBoundsViscosity={1} className="h-full w-full">
      <TileLayer url={MAP_TILE_URL} attribution={MAP_ATTRIBUTION} />
      <LocationEvents formData={formData} onSelect={onSelect} onReject={onReject} />
      <RecenterButton />
    </MapContainer>
  </div>
  <div name="ubicacion" tabIndex={-1} aria-invalid={Boolean(error)} aria-describedby={error ? 'ubicacion-error' : undefined} className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none focus-visible:ring-2 focus-visible:ring-primary">
    {formData.latitud ? <>Ubicación elegida: <strong className="text-slate-800">{formData.latitud}, {formData.longitud}</strong></> : 'Centro inicial del mapa: Loja. Aún no has elegido una ubicación.'}
  </div>
  {error && <p id="ubicacion-error" role="alert" className="mt-2 text-sm font-semibold text-red-700">{error}</p>}
  {locationError && <p role="alert" className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{locationError}</p>}
</div>;
