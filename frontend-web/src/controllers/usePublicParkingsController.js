import { useCallback, useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { LOJA_BBOX } from '../config/loja';
import { usePageVisibility } from '../hooks/usePageVisibility';
import { publicParkingService } from '../services/publicParkingService';
import {
  PUBLIC_BBOX_DEBOUNCE_MS,
  filtrarParqueaderos,
  opcionesPollingPublico,
  serializarBbox,
} from '../utils/publicParkings';

export const usePublicParkingsController = () => {
  const queryClient = useQueryClient();
  const visible = usePageVisibility();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = Number(searchParams.get('parking')) || null;
  const [bboxCandidate, setBboxCandidate] = useState(LOJA_BBOX);
  const [bbox, setBbox] = useState(LOJA_BBOX);
  const [selectedId, setSelectedId] = useState(initialId);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [userLocation, setUserLocation] = useState(null);
  const [locationState, setLocationState] = useState({ loading: false, error: '' });
  const [mapCommand, setMapCommand] = useState({ type: 'reset', token: 0 });

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
    placeholderData: keepPreviousData,
    ...opcionesPollingPublico(visible),
  });

  const detailQuery = useQuery({
    queryKey: ['public-parking', selectedId],
    queryFn: ({ signal }) => publicParkingService.obtener(selectedId, signal),
    enabled: visible && Boolean(selectedId),
    placeholderData: keepPreviousData,
    ...opcionesPollingPublico(visible),
  });

  const results = useMemo(() => filtrarParqueaderos(
    listQuery.data?.results ?? [],
    { search, filter, userLocation },
  ), [filter, listQuery.data?.results, search, userLocation]);

  const selectParking = useCallback((id) => {
    const parsedId = Number(id) || null;
    setSelectedId(parsedId);
    setSearchParams(parsedId ? { parking: String(parsedId) } : {}, { replace: true });
    if (parsedId) setMapCommand({ type: 'parking', parkingId: parsedId, token: Date.now() });
  }, [setSearchParams]);

  const requestLocation = useCallback(() => {
    if (!window.navigator.geolocation) {
      setLocationState({ loading: false, error: 'Tu navegador no permite obtener la ubicación.' });
      return;
    }
    setLocationState({ loading: true, error: '' });
    window.navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const location = { latitude: coords.latitude, longitude: coords.longitude };
        setUserLocation(location);
        setLocationState({ loading: false, error: '' });
        setMapCommand({ type: 'user', token: Date.now() });
      },
      () => setLocationState({
        loading: false,
        error: 'No pudimos obtener tu ubicación. Puedes continuar consultando el mapa de Loja.',
      }),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  const resetFilters = useCallback(() => {
    setSearch('');
    setFilter('ALL');
  }, []);

  const resetArea = useCallback(() => {
    setBboxCandidate(LOJA_BBOX);
    setMapCommand({ type: 'reset', token: Date.now() });
  }, []);

  return {
    listQuery,
    detailQuery,
    results,
    selectedId,
    search,
    filter,
    userLocation,
    locationState,
    mapCommand,
    setSearch,
    setFilter,
    selectParking,
    requestLocation,
    resetFilters,
    resetArea,
    onViewportChange,
  };
};
