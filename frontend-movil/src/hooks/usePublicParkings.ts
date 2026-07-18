import { useQuery } from '@tanstack/react-query';
import { useIsFocused } from '@react-navigation/native';
import { POLLING_INTERVAL_MS } from '../query/queryClient';
import { fetchPublicParkingDetail, fetchPublicParkings } from '../services/publicParkingApi';
import type { ParkingBbox } from '../types/publicParking';
import { isPollingEnabled, useAppStateStatus } from './useAppLifecycle';

export const LOJA_BBOX: ParkingBbox = {
    minLng: -79.277,
    minLat: -4.08,
    maxLng: -79.13,
    maxLat: -3.895,
};

interface MapRegion {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

export function regionToLojaBbox(region: MapRegion): ParkingBbox {
    const halfLat = region.latitudeDelta / 2;
    const halfLng = region.longitudeDelta / 2;
    const bbox = {
        minLng: clamp(region.longitude - halfLng, LOJA_BBOX.minLng, LOJA_BBOX.maxLng),
        minLat: clamp(region.latitude - halfLat, LOJA_BBOX.minLat, LOJA_BBOX.maxLat),
        maxLng: clamp(region.longitude + halfLng, LOJA_BBOX.minLng, LOJA_BBOX.maxLng),
        maxLat: clamp(region.latitude + halfLat, LOJA_BBOX.minLat, LOJA_BBOX.maxLat),
    };
    if (bbox.minLng >= bbox.maxLng || bbox.minLat >= bbox.maxLat) {
        return LOJA_BBOX;
    }
    return bbox;
}

function bboxKey(bbox: ParkingBbox): string {
    return [bbox.minLng, bbox.minLat, bbox.maxLng, bbox.maxLat]
        .map((value) => value.toFixed(6))
        .join(',');
}

export function usePublicParkings(bbox: ParkingBbox) {
    const focused = useIsFocused();
    const appState = useAppStateStatus();
    const pollingEnabled = isPollingEnabled(appState, focused);

    return useQuery({
        queryKey: ['public-parkings', bboxKey(bbox)],
        queryFn: ({ signal }) => fetchPublicParkings(bbox, signal),
        enabled: pollingEnabled,
        refetchInterval: pollingEnabled ? POLLING_INTERVAL_MS : false,
        refetchIntervalInBackground: false,
    });
}

export function usePublicParkingDetail(parkingId: number) {
    const focused = useIsFocused();
    const appState = useAppStateStatus();
    const pollingEnabled = isPollingEnabled(appState, focused);

    return useQuery({
        queryKey: ['public-parking', parkingId],
        queryFn: ({ signal }) => fetchPublicParkingDetail(parkingId, signal),
        enabled: pollingEnabled,
        refetchInterval: pollingEnabled ? POLLING_INTERVAL_MS : false,
        refetchIntervalInBackground: false,
    });
}
