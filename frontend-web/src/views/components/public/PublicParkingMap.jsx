import React, { useEffect } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import { LOJA_BOUNDS } from '../../../config/loja';
import { MAP_ATTRIBUTION, MAP_TILE_URL } from '../../../config/env';
import { bboxDesdeLimites } from '../../../utils/publicParkings';

const ViewportReporter = ({ onChange }) => {
  const map = useMapEvents({
    moveend: () => onChange(bboxDesdeLimites(map.getBounds())),
    zoomend: () => onChange(bboxDesdeLimites(map.getBounds())),
  });
  useEffect(() => {
    onChange(bboxDesdeLimites(map.getBounds()));
  }, [map, onChange]);
  return null;
};

const markerStyle = (parking, selected) => ({
  color: selected ? '#0f172a' : parking.status === 'FULL' ? '#b91c1c' : '#047857',
  fillColor: parking.status === 'FULL' ? '#ef4444' : '#10b981',
  fillOpacity: 0.9,
  weight: selected ? 4 : 2,
});

export const PublicParkingMap = ({ parkings, selectedId, onSelect, onViewportChange }) => (
  <MapContainer
    bounds={LOJA_BOUNDS}
    maxBounds={LOJA_BOUNDS}
    maxBoundsViscosity={1}
    minZoom={12}
    className="h-full w-full"
  >
    <TileLayer url={MAP_TILE_URL} attribution={MAP_ATTRIBUTION} />
    <ViewportReporter onChange={onViewportChange} />
    {parkings.map((parking) => (
      <CircleMarker
        center={[parking.latitude, parking.longitude]}
        eventHandlers={{ click: () => onSelect(parking.id) }}
        pathOptions={markerStyle(parking, parking.id === selectedId)}
        radius={parking.id === selectedId ? 11 : 9}
        key={parking.id}
      >
        <Popup>
          <strong>{parking.name}</strong><br />
          {parking.available_spaces} de {parking.total_spaces} disponibles
        </Popup>
      </CircleMarker>
    ))}
  </MapContainer>
);
