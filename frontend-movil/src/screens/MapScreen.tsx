import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert, Dimensions } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { COLORS } from '../constants/theme';
import { useParking } from '../context/ParkingContext';

const LOJA_BOUNDS = {
    minLatitude: -4.0400,
    maxLatitude: -3.9400,
    minLongitude: -79.2300,
    maxLongitude: -79.1800,
};

const LOJA_CENTER = {
    latitude: -3.99313,
    longitude: -79.20422,
    latitudeDelta: 0.025,
    longitudeDelta: 0.025,
};

export default function MapScreen() {
    const { parkings } = useParking();
    const [loading, setLoading] = useState(true);
    const mapViewRef = useRef<MapView>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permiso denegado',
                    'Se necesita acceso al GPS para posicionar el mapa de mejor manera.'
                );
            }
            setLoading(false);
        })();
    }, []);

    const handleRegionChange = (region: Region) => {
        let outOfBounds = false;
        let newLat = region.latitude;
        let newLng = region.longitude;

        if (region.latitude < LOJA_BOUNDS.minLatitude) {
            newLat = LOJA_BOUNDS.minLatitude;
            outOfBounds = true;
        } else if (region.latitude > LOJA_BOUNDS.maxLatitude) {
            newLat = LOJA_BOUNDS.maxLatitude;
            outOfBounds = true;
        }

        if (region.longitude < LOJA_BOUNDS.minLongitude) {
            newLng = LOJA_BOUNDS.minLongitude;
            outOfBounds = true;
        } else if (region.longitude > LOJA_BOUNDS.maxLongitude) {
            newLng = LOJA_BOUNDS.maxLongitude;
            outOfBounds = true;
        }

        if (outOfBounds && mapViewRef.current) {
            mapViewRef.current.animateToRegion({
                ...region,
                latitude: newLat,
                longitude: newLng,
            }, 500);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Localizando parqueaderos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapViewRef}
                style={styles.map}
                initialRegion={LOJA_CENTER}
                showsUserLocation={true}
                showsMyLocationButton={true}
                minZoomLevel={13}
                maxZoomLevel={18}
                onRegionChange={handleRegionChange}
            >
                {parkings.map((parking) => (
                    <Marker
                        key={parking.id}
                        coordinate={{ latitude: parking.latitude, longitude: parking.longitude }}
                        title={parking.name}
                        description={`Disponibles: ${parking.available}/${parking.total}`}
                        pinColor={parking.available > 0 ? 'green' : 'red'}
                    />
                ))}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' },
    loadingText: { marginTop: 10, color: '#666', fontSize: 14 },
});