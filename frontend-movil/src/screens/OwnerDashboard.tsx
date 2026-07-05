import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';

export default function OwnerDashboard({ navigation }: any) {
    const [status, setStatus] = useState('ABIERTO');

    const getStatusColor = () => {
        switch(status) {
            case 'ABIERTO': return '#4CAF50';
            case 'CERRADO': return '#F44336';
            case 'LLENO': return '#FF9800';
            default: return '#9E9E9E';
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.welcome}>¡Bienvenido de nuevo!</Text>
            <Text style={styles.sub}>Parqueadero Central Loja</Text>

            <View style={[styles.statusCard, { borderColor: getStatusColor() }]}>
                <Text style={styles.cardLabel}>Estado actual del establecimiento:</Text>
                <Text style={[styles.statusText, { color: getStatusColor() }]}>{status}</Text>
            </View>

            <Text style={styles.sectionTitle}>Cambiar Estado Rápido:</Text>
            <View style={styles.grid}>
                {['ABIERTO', 'CERRADO', 'LLENO', 'FUERA DE SERVICIO'].map((state) => (
                    <TouchableOpacity
                        key={state}
                        style={[styles.gridButton, status === state && { backgroundColor: COLORS.primary }]}
                        onPress={() => setStatus(state)}
                    >
                        <Text style={[styles.gridButtonText, status === state && { color: '#FFF' }]}>{state}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.actionContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ParkingInfo')}>
                    <Text style={styles.actionText}>ℹ️ Ver Información del Parqueadero</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ManageSpaces')}>
                    <Text style={styles.actionText}>🚗 Gestionar Espacios Individuales</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] })}
                >
                    <Text style={styles.logoutText}>🚪 Salir del Panel</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA', padding: 20 },
    welcome: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    sub: { fontSize: 14, color: '#666', marginBottom: 20 },
    statusCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 10, borderWidth: 2, alignItems: 'center', marginBottom: 25 },
    cardLabel: { fontSize: 14, color: '#444' },
    statusText: { fontSize: 22, fontWeight: 'bold', marginTop: 4 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#444' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 35 },
    gridButton: { width: '47%', backgroundColor: '#FFF', padding: 14, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#DDD' },
    gridButtonText: { fontWeight: '600', color: '#555', fontSize: 13 },
    actionContainer: { gap: 12 },
    actionButton: { backgroundColor: '#FFF', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#CCC' },
    actionText: { color: COLORS.primary, fontWeight: '600', fontSize: 15 },
    logoutButton: { backgroundColor: '#FFF', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#F44336', marginTop: 10, alignItems: 'center' },
    logoutText: { color: '#F44336', fontWeight: 'bold', fontSize: 15 }
});