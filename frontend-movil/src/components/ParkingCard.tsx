// src/components/ParkingCard.tsx
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS } from '../constants/theme';
import { Parking } from '../context/ParkingContext';

interface ParkingCardProps {
    parking: Parking;
}

export default function ParkingCard({ parking }: ParkingCardProps) {
    const isAvailable = parking.available > 0;

    return (
        <View style={styles.card}>
            <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{parking.name}</Text>
                <Text style={styles.cardAddress}>{parking.address || 'Dirección no disponible'}</Text>
            </View>
            <View style={[
                styles.badge,
                { backgroundColor: isAvailable ? '#E8F8F5' : '#FDEDEC' }
            ]}>
                <Text style={[
                    styles.badgeText,
                    { color: isAvailable ? COLORS.success : COLORS.error }
                ]}>
                    {isAvailable ? `${parking.available} Libres` : 'Lleno'}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    cardInfo: {
        flex: 1,
        paddingRight: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
    cardAddress: {
        fontSize: 12,
        color: COLORS.secondary,
        marginTop: 4,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
});