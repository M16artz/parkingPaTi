import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import QueryState from '../components/QueryState';
import { COLORS } from '../constants/theme';
import { usePublicParkingDetail } from '../hooks/usePublicParkings';
import type { RootStackParamList } from '../navigation/AppNavigator';

interface Props {
    route: RouteProp<RootStackParamList, 'ParkingDetail'>;
}

const STATUS_LABELS = { OPEN: 'Abierto', FULL: 'Lleno', CLOSED: 'Cerrado' } as const;

export default function ParkingDetailScreen({ route }: Props) {
    const query = usePublicParkingDetail(route.params.parkingId);

    if (query.isPending) return <QueryState kind="loading" />;
    if (query.isError || !query.data) {
        return <QueryState kind="error" message={query.error?.message} onRetry={() => query.refetch()} />;
    }

    const parking = query.data;
    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={() => query.refetch()} />}
        >
            <Text style={styles.name}>{parking.name}</Text>
            <Text style={styles.address}>{parking.address || 'Dirección no disponible'}</Text>
            <View style={styles.availability}>
                <Text style={styles.availabilityValue}>{parking.available_spaces}</Text>
                <Text style={styles.availabilityLabel}>de {parking.total_spaces} espacios libres</Text>
                <Text style={styles.status}>{STATUS_LABELS[parking.status]}</Text>
            </View>

            {parking.description ? <Text style={styles.description}>{parking.description}</Text> : null}

            <Text style={styles.sectionTitle}>Tarifas informativas</Text>
            {parking.rates.length ? parking.rates.map((rate) => (
                <View key={rate.code} style={styles.row}>
                    <Text style={styles.rowLabel}>{rate.name}</Text>
                    <Text style={styles.rowValue}>${rate.price_per_hour} / hora</Text>
                </View>
            )) : <Text style={styles.muted}>No hay tarifas publicadas.</Text>}

            <Text style={styles.sectionTitle}>Horarios</Text>
            {parking.schedules.length ? parking.schedules.map((schedule) => (
                <View key={`${schedule.day}-${schedule.opens_at}`} style={styles.row}>
                    <Text style={styles.rowLabel}>{schedule.day}</Text>
                    <Text style={styles.rowValue}>{schedule.opens_at} - {schedule.closes_at}</Text>
                </View>
            )) : <Text style={styles.muted}>No hay horarios publicados.</Text>}

            <Text style={styles.updated}>Última actualización: {new Date(parking.updated_at).toLocaleString()}</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: 18, paddingBottom: 32 },
    name: { color: COLORS.textDark, fontSize: 24, fontWeight: '800' },
    address: { color: COLORS.secondary, fontSize: 14, marginTop: 6 },
    availability: { backgroundColor: COLORS.white, borderColor: COLORS.border, borderRadius: 8, borderWidth: 1, marginTop: 18, padding: 16 },
    availabilityValue: { color: COLORS.primary, fontSize: 32, fontWeight: '800' },
    availabilityLabel: { color: COLORS.textDark, marginTop: 2 },
    status: { color: COLORS.primary, fontWeight: '700', marginTop: 8 },
    description: { color: COLORS.textDark, lineHeight: 21, marginTop: 18 },
    sectionTitle: { color: COLORS.textDark, fontSize: 17, fontWeight: '700', marginTop: 24, marginBottom: 8 },
    row: { borderBottomColor: COLORS.border, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
    rowLabel: { color: COLORS.textDark, flex: 1 },
    rowValue: { color: COLORS.primary, fontWeight: '700' },
    muted: { color: COLORS.secondary },
    updated: { color: COLORS.secondary, fontSize: 12, marginTop: 24 },
});
