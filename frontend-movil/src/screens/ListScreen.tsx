// src/screens/ListScreen.tsx
import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { COLORS } from '../constants/theme';
import { useParking } from '../context/ParkingContext';
import ParkingCard from '../components/ParkingCard';

export default function ListScreen() {
    const { parkings } = useParking(); // Consumimos el contexto global

    return (
        <View style={styles.container}>
            <FlatList
                data={parkings}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listPadding}
                renderItem={({ item }) => <ParkingCard parking={item} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: COLORS.background,
    },
    listPadding: {
        padding: 15,
    },
});