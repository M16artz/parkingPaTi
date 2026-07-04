import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { COLORS } from '../constants/theme';

interface Space {
    id: string;
    label: string;
    status: 'LIBRE' | 'OCUPADO' | 'INHABILITADO';
}

export default function ManageSpacesScreen() {
    const [spaces, setSpaces] = useState<Space[]>([
        { id: '1', label: 'E-1', status: 'LIBRE' },
        { id: '2', label: 'E-2', status: 'OCUPADO' },
        { id: '3', label: 'E-3', status: 'INHABILITADO' },
        { id: '4', label: 'E-4', status: 'LIBRE' },
        { id: '5', label: 'E-5', status: 'LIBRE' },
        { id: '6', label: 'E-6', status: 'OCUPADO' },
    ]);

    const cycleStatus = (id: string) => {
        setSpaces(prev => prev.map(space => {
            if (space.id === id) {
                const nextStatus: Record<string, Space['status']> = {
                    'LIBRE': 'OCUPADO',
                    'OCUPADO': 'INHABILITADO',
                    'INHABILITADO': 'LIBRE'
                };
                return { ...space, status: nextStatus[space.status] };
            }
            return space;
        }));
    };

    const getStatusColor = (status: string) => {
        if (status === 'LIBRE') return COLORS.success;
        if (status === 'OCUPADO') return COLORS.error;
        return COLORS.secondary; // Inhabilitado
    };

    return (
        <View style={styles.container}>
            <Text style={styles.hint}>💡 Toca sobre un espacio para alternar de forma interactiva su estado actual.</Text>

            <FlatList
                data={spaces}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.box, { backgroundColor: getStatusColor(item.status) }]}
                        onPress={() => cycleStatus(item.id)}
                    >
                        <Text style={styles.boxText}>{item.label}</Text>
                        <Text style={styles.statusText}>{item.status}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
    hint: { fontSize: 13, color: COLORS.secondary, marginBottom: 16, textAlign: 'center' },
    box: { flex: 0.48, height: 80, borderRadius: 8, justifyContent: 'center', alignItems: 'center', elevation: 2 },
    boxText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
    statusText: { color: '#FFF', fontSize: 11, fontWeight: '600', marginTop: 4 }
});