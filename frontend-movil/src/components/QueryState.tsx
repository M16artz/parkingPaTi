import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';

interface QueryStateProps {
    kind: 'loading' | 'error' | 'empty';
    message?: string;
    onRetry?: () => void;
}

export default function QueryState({ kind, message, onRetry }: QueryStateProps) {
    if (kind === 'loading') {
        return (
            <View style={styles.container} accessibilityLabel="Cargando parqueaderos">
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.message}>Consultando parqueaderos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{kind === 'empty' ? 'Sin resultados' : 'No se pudo actualizar'}</Text>
            <Text style={styles.message}>
                {message || (kind === 'empty'
                    ? 'No hay parqueaderos visibles en esta zona.'
                    : 'Revisa tu conexión e intenta nuevamente.')}
            </Text>
            {kind === 'error' && onRetry ? (
                <Pressable accessibilityRole="button" onPress={onRetry} style={styles.button}>
                    <Text style={styles.buttonText}>Reintentar</Text>
                </Pressable>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, minHeight: 180, justifyContent: 'center', alignItems: 'center', padding: 24 },
    title: { color: COLORS.textDark, fontSize: 18, fontWeight: '700' },
    message: { color: COLORS.secondary, marginTop: 8, textAlign: 'center' },
    button: { backgroundColor: COLORS.primary, borderRadius: 6, marginTop: 16, paddingHorizontal: 18, paddingVertical: 10 },
    buttonText: { color: COLORS.white, fontWeight: '700' },
});
