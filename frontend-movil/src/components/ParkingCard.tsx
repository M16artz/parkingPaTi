import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';
import type { PublicParkingSummary } from '../types/publicParking';

interface ParkingCardProps {
    parking: PublicParkingSummary;
    onPress: () => void;
}

const STATUS_LABELS: Record<PublicParkingSummary['status'], string> = {
    OPEN: 'Abierto',
    FULL: 'Lleno',
    CLOSED: 'Cerrado',
};

export default function ParkingCard({ parking, onPress }: ParkingCardProps) {
    const isAvailable = parking.status === 'OPEN' && parking.available_spaces > 0;

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ver detalle de ${parking.name}`}
            onPress={onPress}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
            <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{parking.name}</Text>
                <Text style={styles.cardAddress}>{parking.address || 'Dirección no disponible'}</Text>
                <Text style={styles.capacity}>
                    {parking.available_spaces} de {parking.total_spaces} espacios libres
                </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: isAvailable ? '#E1F2EB' : '#F7E7E7' }]}>
                <Text style={[styles.badgeText, { color: isAvailable ? COLORS.success : COLORS.error }]}>
                    {STATUS_LABELS[parking.status]}
                </Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderColor: COLORS.border,
        borderRadius: 8,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        padding: 14,
    },
    pressed: { opacity: 0.72 },
    cardInfo: { flex: 1, paddingRight: 10 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
    cardAddress: { fontSize: 12, color: COLORS.secondary, marginTop: 4 },
    capacity: { fontSize: 13, color: COLORS.textDark, marginTop: 8 },
    badge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 },
    badgeText: { fontSize: 12, fontWeight: '700' },
});
