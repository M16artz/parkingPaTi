// src/screens/MapScreen.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { COLORS } from '../constants/theme';
import { useParking } from '../context/ParkingContext';

export default function MapScreen() {
    const { parkings } = useParking(); // Consumimos el contexto global
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permiso denegado',
                    'Necesitamos acceso a tu GPS para mostrar los parqueaderos a tu alrededor.'
                );
                setLoading(false);
                return;
            }
            setLoading(false);
        })();
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Localizando parqueaderos cercanos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: -3.99313,
                    longitude: -79.20422,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.015,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                {parkings.map((parking) => (
                    <Marker
                        key={parking.id}
                        coordinate={{ latitude: parking.latitude, longitude: parking.longitude }}
                        title={parking.name}
                        description={`Disponibles: ${parking.available}/${parking.total}`}
                        pinColor={parking.available > 0 ? COLORS.success : COLORS.error}
                    />
                ))}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
    loadingText: { marginTop: 10, color: COLORS.secondary, fontSize: 14 },
});