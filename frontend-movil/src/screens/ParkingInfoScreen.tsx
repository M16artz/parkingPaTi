import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { COLORS } from '../constants/theme';

export default function ParkingInfoScreen() {
    // Mock simulando la persistencia DTO del negocio
    const info = {
        tarifa: "$1.00 / Hora",
        horario: "Lunes a Viernes: 07:00 - 22:00",
        totalEspacios: 12,
        libres: 7
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.infoCard}>
                <Text style={styles.title}>Datos del Establecimiento</Text>
                <Text style={styles.text}>💰 **Tarifa:** {info.tarifa}</Text>
                <Text style={styles.text}>🕒 **Horario:** {info.horario}</Text>
                <Text style={styles.text}>📊 **Capacidad:** {info.libres} disponibles de {info.totalEspacios}</Text>
            </View>

            <View style={styles.gridSection}>
                <Text style={styles.title}>Mapa Visual de Ocupación</Text>
                <View style={styles.grid}>
                    {Array.from({ length: info.totalEspacios }).map((_, i) => {
                        const isOcupado = i % 3 === 0; // simulación
                        return (
                            <View
                                key={i}
                                style={[styles.spaceBox, { backgroundColor: isOcupado ? COLORS.error : COLORS.success }]}
                            >
                                <Text style={styles.spaceText}>E-{i+1}</Text>
                                <Text style={styles.statusLabel}>{isOcupado ? 'OCUPADO' : 'LIBRE'}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
    infoCard: { backgroundColor: COLORS.white, padding: 16, borderRadius: 10, marginBottom: 20, elevation: 2 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: COLORS.textDark },
    text: { fontSize: 14, marginBottom: 8, color: COLORS.secondary },
    gridSection: { marginBottom: 24 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
    spaceBox: { width: '30%', aspectRatio: 1, borderRadius: 8, justifyContent: 'center', alignItems: 'center', padding: 4 },
    spaceText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
    statusLabel: { color: '#FFF', fontSize: 9, opacity: 0.9, marginTop: 4 }
});