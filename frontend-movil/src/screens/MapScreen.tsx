import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import type { StackNavigationProp } from '@react-navigation/stack';
import MapView, { Callout, Marker, type Region, UrlTile } from 'react-native-maps';
import QueryState from '../components/QueryState';
import { getMobileEnvironment } from '../config/environment';
import { COLORS } from '../constants/theme';
import { LOJA_BBOX, regionToLojaBbox, usePublicParkings } from '../hooks/usePublicParkings';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { ParkingBbox } from '../types/publicParking';

const LOJA_REGION: Region = {
    latitude: (LOJA_BBOX.minLat + LOJA_BBOX.maxLat) / 2,
    longitude: (LOJA_BBOX.minLng + LOJA_BBOX.maxLng) / 2,
    latitudeDelta: LOJA_BBOX.maxLat - LOJA_BBOX.minLat,
    longitudeDelta: LOJA_BBOX.maxLng - LOJA_BBOX.minLng,
};

interface Props {
    navigation: StackNavigationProp<RootStackParamList, 'PublicParkings'>;
}

export default function MapScreen({ navigation }: Props) {
    const mapRef = useRef<MapView>(null);
    const [bbox, setBbox] = useState<ParkingBbox>(LOJA_BBOX);
    const [pendingBbox, setPendingBbox] = useState<ParkingBbox>(LOJA_BBOX);
    const query = usePublicParkings(bbox);
    const network = useNetInfo();
    const environment = useMemo(() => {
        try {
            return getMobileEnvironment();
        } catch {
            return undefined;
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setBbox(pendingBbox), 400);
        return () => clearTimeout(timer);
    }, [pendingBbox]);

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={LOJA_REGION}
                minZoomLevel={12}
                maxZoomLevel={19}
                mapType={environment?.mapTileUrl ? 'none' : 'standard'}
                onMapReady={() => mapRef.current?.setMapBoundaries(
                    { latitude: LOJA_BBOX.maxLat, longitude: LOJA_BBOX.maxLng },
                    { latitude: LOJA_BBOX.minLat, longitude: LOJA_BBOX.minLng },
                )}
                onRegionChangeComplete={(region) => setPendingBbox(regionToLojaBbox(region))}
            >
                {environment?.mapTileUrl ? (
                    <UrlTile urlTemplate={environment.mapTileUrl} maximumZ={19} />
                ) : null}
                {query.data?.results.map((parking) => (
                    <Marker
                        key={parking.id}
                        coordinate={{ latitude: parking.latitude, longitude: parking.longitude }}
                        pinColor={parking.status === 'OPEN' ? COLORS.success : COLORS.error}
                    >
                        <Callout onPress={() => navigation.navigate('ParkingDetail', { parkingId: parking.id })}>
                            <View style={styles.callout}>
                                <Text style={styles.calloutTitle}>{parking.name}</Text>
                                <Text>{parking.available_spaces} de {parking.total_spaces} libres</Text>
                                <Text style={styles.calloutAction}>Ver detalle</Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>

            <View style={styles.attribution} pointerEvents="none">
                <Text style={styles.attributionText}>Mapa: {environment?.mapAttribution || 'configuración pendiente'}</Text>
            </View>
            {network.isConnected === false ? (
                <Text accessibilityRole="alert" style={styles.offline}>Sin conexión. Datos en caché.</Text>
            ) : null}
            {query.isPending ? <View style={styles.overlay}><QueryState kind="loading" /></View> : null}
            {query.isError && !query.data ? (
                <View style={styles.overlay}>
                    <QueryState kind="error" message={query.error.message} onRetry={() => query.refetch()} />
                </View>
            ) : null}
            {query.data && query.data.results.length === 0 ? (
                <View style={styles.overlay}><QueryState kind="empty" /></View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { ...StyleSheet.absoluteFillObject },
    overlay: { position: 'absolute', left: 16, right: 16, top: 32, backgroundColor: COLORS.white, borderRadius: 8 },
    callout: { minWidth: 180, padding: 4 },
    calloutTitle: { color: COLORS.textDark, fontWeight: '700', marginBottom: 4 },
    calloutAction: { color: COLORS.primary, fontWeight: '700', marginTop: 6 },
    attribution: { position: 'absolute', right: 6, bottom: 6, backgroundColor: 'rgba(255,255,255,0.9)', padding: 4 },
    attributionText: { color: COLORS.secondary, fontSize: 10 },
    offline: { position: 'absolute', left: 10, right: 10, top: 10, backgroundColor: '#FFF1D6', color: '#6D4700', padding: 8, textAlign: 'center' },
});
