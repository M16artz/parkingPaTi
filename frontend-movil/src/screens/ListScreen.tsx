import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { useParking } from '../context/ParkingContext';

export default function ListScreen() {
    const { parkings } = useParking();

    return (
        <View style={styles.container}>
            <FlatList
                data={parkings}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>{item.name}</Text>
                            <Text style={[styles.statusText, { color: item.status === 'ABIERTO' ? '#4CAF50' : '#F44336' }]}>
                                {item.status}
                            </Text>
                        </View>

                        <View style={styles.cardBody}>
                            <Text style={styles.infoText}>🚗 Espacios Libres: <Text style={{fontWeight: 'bold'}}>{item.available} / {item.total}</Text></Text>
                            <Text style={styles.priceText}>💰 Tarifa General: <Text style={styles.priceValue}>$1.00 / Hora</Text></Text>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA', padding: 10 },
    card: { backgroundColor: '#FFF', padding: 16, borderRadius: 10, marginBottom: 12, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1 },
    statusText: { fontSize: 12, fontWeight: 'bold' },
    cardBody: { gap: 4 },
    infoText: { fontSize: 14, color: '#555' },
    priceText: { fontSize: 14, color: '#666', marginTop: 2 },
    priceValue: { color: '#2E7D32', fontWeight: 'bold' }
});