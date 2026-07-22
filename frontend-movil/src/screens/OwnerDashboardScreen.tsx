import React from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { queryClient } from '../query/queryClient';
import { clearMobileSession } from '../services/mobileAuthApi';
import { fetchOwnerManagement } from '../services/ownerDashboardApi';

const STATUS_LABELS: Record<string, string> = {
    ABIERTO: 'Abierto',
    CERRADO: 'Cerrado',
    LLENO: 'Lleno',
    FUERA_DE_SERVICIO: 'Fuera de servicio',
    INACTIVO: 'Inactivo',
};

export default function OwnerDashboardScreen() {
    const navigation = useNavigation();
    const dashboard = useQuery({
        queryKey: ['owner', 'mobile-dashboard'],
        queryFn: fetchOwnerManagement,
        retry: 1,
        refetchInterval: 60_000,
    });

    const logout = async () => {
        await clearMobileSession();
        queryClient.removeQueries({ queryKey: ['owner'] });
        navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Welcome' }] });
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <View>
                    <Text style={styles.eyebrow}>PARKINGPATI</Text>
                    <Text style={styles.headerTitle}>Dashboard</Text>
                </View>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Cerrar sesión" style={styles.logout} onPress={logout}>
                    <Ionicons name="log-out-outline" color="#FFFFFF" size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={dashboard.isFetching} onRefresh={() => dashboard.refetch()} />}
            >
                {dashboard.isPending ? <Text style={styles.stateText}>Cargando información del parqueadero...</Text> : null}
                {dashboard.isError ? (
                    <View style={styles.errorCard}>
                        <Text style={styles.errorTitle}>No se pudo cargar el dashboard</Text>
                        <Text style={styles.errorText}>{dashboard.error.message}</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={() => dashboard.refetch()}>
                            <Text style={styles.retryText}>Reintentar</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}

                {dashboard.data ? (
                    <>
                        <View style={styles.parkingCard}>
                            <View style={styles.parkingIcon}>
                                <MaterialCommunityIcons name="car-outline" color="#FFFFFF" size={30} />
                            </View>
                            <View style={styles.parkingCopy}>
                                <Text style={styles.parkingLabel}>MI PARQUEADERO</Text>
                                <Text style={styles.parkingName}>{dashboard.data.parking.nombre}</Text>
                            </View>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>{STATUS_LABELS[dashboard.data.configuration.estado_operativo] || dashboard.data.configuration.estado_operativo}</Text>
                            </View>
                        </View>

                        <Text style={styles.sectionTitle}>Resumen de hoy</Text>
                        <View style={styles.grid}>
                            <MetricCard icon="checkmark-circle-outline" label="Disponibles" value={dashboard.data.configuration.espacios_disponibles} color="#179B67" />
                            <MetricCard icon="car-sport-outline" label="Ocupados" value={dashboard.data.configuration.espacios.filter((space) => space.is_active && space.estado === 'OCUPADO').length} color="#E05A67" />
                            <MetricCard icon="people-outline" label="Estancias" value={dashboard.data.metrics.estancias_hoy} color="#2E79F3" />
                            <MetricCard icon="cash-outline" label="Ingreso estimado" value={`$${dashboard.data.metrics.ingresos_estimados}`} color="#D68A14" />
                        </View>

                        <View style={styles.infoCard}>
                            <Text style={styles.infoTitle}>Actividad actual</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Espacios totales</Text>
                                <Text style={styles.infoValue}>{dashboard.data.configuration.total_espacios}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Estancias en curso</Text>
                                <Text style={styles.infoValue}>{dashboard.data.metrics.estancias_activas}</Text>
                            </View>
                        </View>
                    </>
                ) : null}
            </ScrollView>
        </SafeAreaView>
    );
}

function MetricCard({ icon, label, value, color }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string | number; color: string }) {
    return (
        <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: `${color}18` }]}>
                <Ionicons name={icon} size={22} color={color} />
            </View>
            <Text style={styles.metricLabel}>{label}</Text>
            <Text style={styles.metricValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#2E79F3' },
    header: { minHeight: 88, paddingHorizontal: 22, paddingBottom: 18, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
    eyebrow: { color: '#BFD8FF', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
    headerTitle: { marginTop: 2, color: '#FFFFFF', fontSize: 30, fontWeight: '800' },
    logout: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
    container: { flex: 1, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: COLORS.background },
    content: { padding: 18, paddingBottom: 40 },
    stateText: { paddingVertical: 45, color: COLORS.secondary, textAlign: 'center' },
    errorCard: { padding: 20, borderRadius: 18, backgroundColor: '#FFF0F0' },
    errorTitle: { color: '#A52D38', fontSize: 17, fontWeight: '800' },
    errorText: { marginTop: 6, color: '#7A3B43', lineHeight: 20 },
    retryButton: { alignSelf: 'flex-start', marginTop: 15, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 12, backgroundColor: '#A52D38' },
    retryText: { color: '#FFFFFF', fontWeight: '700' },
    parkingCard: { padding: 17, flexDirection: 'row', alignItems: 'center', borderRadius: 20, backgroundColor: '#FFFFFF' },
    parkingIcon: { width: 52, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2E79F3' },
    parkingCopy: { flex: 1, marginLeft: 13 },
    parkingLabel: { color: '#8B94A7', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
    parkingName: { marginTop: 3, color: '#0B1B4F', fontSize: 18, fontWeight: '800' },
    statusBadge: { maxWidth: 96, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 20, backgroundColor: '#E8F2FF' },
    statusText: { color: '#2367CF', fontSize: 10, fontWeight: '800', textAlign: 'center' },
    sectionTitle: { marginTop: 24, marginBottom: 12, color: '#0B1B4F', fontSize: 20, fontWeight: '800' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    metricCard: { width: '48%', minHeight: 130, padding: 15, borderRadius: 18, backgroundColor: '#FFFFFF' },
    metricIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
    metricLabel: { marginTop: 10, color: '#7B8498', fontSize: 12, fontWeight: '700' },
    metricValue: { marginTop: 3, color: '#0B1B4F', fontSize: 23, fontWeight: '800' },
    infoCard: { marginTop: 18, padding: 18, borderRadius: 20, backgroundColor: '#E2F2FE' },
    infoTitle: { marginBottom: 8, color: '#0B1B4F', fontSize: 17, fontWeight: '800' },
    infoRow: { paddingVertical: 11, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#BBD6EC' },
    infoLabel: { color: '#52617C', fontWeight: '600' },
    infoValue: { color: '#0B1B4F', fontWeight: '800' },
});
