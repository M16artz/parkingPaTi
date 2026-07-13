import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import ParkingCard from '../components/ParkingCard';
import QueryState from '../components/QueryState';
import { COLORS } from '../constants/theme';
import { LOJA_BBOX, usePublicParkings } from '../hooks/usePublicParkings';

interface Props {
    navigation: StackNavigationProp<RootStackParamList, 'PublicParkings'>;
}

export default function ListScreen({ navigation }: Props) {
    const query = usePublicParkings(LOJA_BBOX);
    const network = useNetInfo();

    if (query.isPending) return <QueryState kind="loading" />;
    if (query.isError && !query.data) {
        return <QueryState kind="error" message={query.error.message} onRetry={() => query.refetch()} />;
    }
    if (!query.data?.results.length) return <QueryState kind="empty" />;

    return (
        <View style={styles.container}>
            {network.isConnected === false ? (
                <Text accessibilityRole="alert" style={styles.offline}>Sin conexión. Se muestran los últimos datos.</Text>
            ) : null}
            <Text style={styles.updated}>Actualizado: {new Date(query.data.updated_at).toLocaleTimeString()}</Text>
            <FlatList
                data={query.data.results}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={() => query.refetch()} />}
                renderItem={({ item }) => (
                    <ParkingCard
                        parking={item}
                        onPress={() => navigation.navigate('ParkingDetail', { parkingId: item.id })}
                    />
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    list: { padding: 12 },
    updated: { color: COLORS.secondary, fontSize: 12, paddingHorizontal: 12, paddingTop: 10 },
    offline: { backgroundColor: '#FFF1D6', color: '#6D4700', padding: 10, textAlign: 'center' },
});
