import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { LOJA_BOUNDS } from '../../../config/loja';
import { MAP_ATTRIBUTION, MAP_TILE_URL } from '../../../config/env';
import {
  PARKING_STATUS,
  bboxDesdeLimites,
  formatearMoneda,
} from '../../../utils/publicParkings';

const iconCache = new Map();

const parkingIcon = (status, selected) => {
  const key = `${status}:${selected}`;
  if (iconCache.has(key)) return iconCache.get(key);
  const color = PARKING_STATUS[status]?.marker ?? '#64748b';
  const size = selected ? 46 : 38;
  const icon = L.divIcon({
    className: 'public-parking-marker',
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
    iconSize: [size, size],
    html: `<span aria-hidden="true" style="width:${size}px;height:${size}px;background:${color};border:${selected ? 4 : 3}px solid white;box-shadow:0 8px 22px rgba(15,23,42,.35);border-radius:50% 50% 50% 10%;transform:rotate(-45deg);display:grid;place-items:center;${selected ? 'outline:4px solid rgba(2,132,199,.28);' : ''}"><strong style="transform:rotate(45deg);color:white;font:800 14px sans-serif">P</strong></span>`,
  });
  iconCache.set(key, icon);
  return icon;
};

const userIcon = L.divIcon({
  className: 'public-user-marker',
  iconAnchor: [14, 14],
  iconSize: [28, 28],
  html: '<span aria-hidden="true" style="position:relative;width:28px;height:28px;display:block"><span style="position:absolute;inset:0;border-radius:999px;background:rgba(37,99,235,.22);animation:public-location-pulse 1.8s ease-out infinite"></span><span style="position:absolute;inset:7px;border-radius:999px;background:#2563eb;border:3px solid white;box-shadow:0 3px 12px rgba(15,23,42,.4)"></span></span>',
});

const ViewportReporter = ({ onChange }) => {
  const map = useMapEvents({
    moveend: () => onChange(bboxDesdeLimites(map.getBounds())),
  });
  useEffect(() => {
    onChange(bboxDesdeLimites(map.getBounds()));
  }, [map, onChange]);
  return null;
};

const MapCommandController = ({ command, parkings, userLocation }) => {
  const map = useMap();
  const parkingsRef = useRef(parkings);

  useEffect(() => {
    parkingsRef.current = parkings;
  }, [parkings]);

  useEffect(() => {
    if (command.type === 'reset') map.fitBounds(LOJA_BOUNDS, { animate: true, padding: [20, 20] });
    if (command.type === 'user' && userLocation) map.setView([userLocation.latitude, userLocation.longitude], 16, { animate: true });
    if (command.type === 'parking') {
      const parking = parkingsRef.current.find((item) => item.id === command.parkingId);
      if (parking) map.setView([parking.latitude, parking.longitude], 17, { animate: true });
    }
  }, [command, map, userLocation]);
  return null;
};

export const PublicParkingMap = ({
  parkings,
  selectedId,
  userLocation,
  mapCommand,
  onSelect,
  onViewportChange,
  onTileError,
}) => <MapContainer bounds={LOJA_BOUNDS} maxBounds={LOJA_BOUNDS} maxBoundsViscosity={1} minZoom={12} maxZoom={19} className="h-full w-full" scrollWheelZoom doubleClickZoom touchZoom boxZoom keyboard zoomControl>
  <TileLayer url={MAP_TILE_URL} attribution={MAP_ATTRIBUTION} eventHandlers={{ tileerror: onTileError }} />
  <ViewportReporter onChange={onViewportChange} />
  <MapCommandController command={mapCommand} parkings={parkings} userLocation={userLocation} />
  {userLocation && <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon} title="Tu ubicación aproximada" zIndexOffset={1200}><Popup>Tu ubicación aproximada</Popup></Marker>}
  {parkings.map((parking) => {
    const selected = parking.id === selectedId;
    const status = PARKING_STATUS[parking.status] ?? PARKING_STATUS.CLOSED;
    return <Marker key={parking.id} position={[parking.latitude, parking.longitude]} icon={parkingIcon(parking.status, selected)} title={`${parking.name}. ${status.label}`} zIndexOffset={selected ? 1000 : 0} eventHandlers={{ click: () => onSelect(parking.id) }}>
      <Popup>
        <div className="min-w-48 text-left font-body">
          <strong className="text-sm text-slate-950">{parking.name}</strong>
          <p className="mt-1 text-xs font-bold" style={{ color: status.marker }}>{status.label}</p>
          <p className="mt-2 text-xs text-slate-600">{parking.available_spaces} espacios disponibles de {parking.total_spaces}</p>
          <p className="mt-1 text-xs text-slate-600">Desde {formatearMoneda(parking.normal_rate)} por hora</p>
          <button type="button" onClick={() => onSelect(parking.id)} className="mt-3 min-h-9 w-full rounded-lg bg-sky-700 px-3 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600">Ver detalles</button>
        </div>
      </Popup>
    </Marker>;
  })}
</MapContainer>;
