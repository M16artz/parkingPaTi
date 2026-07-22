import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { COLORS } from '../constants/theme';
import { queryClient } from '../query/queryClient';
import { fetchOwnerManagement, updateOwnerParking } from '../services/ownerDashboardApi';

export default function OwnerInfoScreen() {
    const query = useQuery({ queryKey: ['owner', 'mobile-dashboard'], queryFn: fetchOwnerManagement });
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    useEffect(() => {
        if (query.data) {
            setName(query.data.parking.nombre);
            setDescription(query.data.parking.descripcion || '');
        }
    }, [query.data]);
    const mutation = useMutation({
        mutationFn: () => updateOwnerParking(query.data!.parking.id, { nombre: name.trim(), descripcion: description }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['owner', 'mobile-dashboard'] });
            Alert.alert('Información guardada', 'El parqueadero se actualizó correctamente.');
        },
        onError: (error) => Alert.alert('No se pudo guardar', error.message),
    });

    if (!query.data) return <Text style={styles.state}>{query.isError ? query.error.message : 'Cargando información...'}</Text>;
    const { parking } = query.data;
    const address = [parking.direccion?.calle_principal, parking.direccion?.calle_secundaria].filter(Boolean).join(' y ');
    return (
        <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Información del establecimiento</Text>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Identidad del parqueadero</Text>
                <Text style={styles.label}>Nombre *</Text>
                <TextInput style={styles.input} maxLength={150} value={name} onChangeText={setName} />
                <Text style={styles.label}>Descripción</Text>
                <TextInput style={[styles.input, styles.multiline]} multiline value={description} onChangeText={setDescription} />
                <TouchableOpacity disabled={!name.trim() || mutation.isPending} style={styles.button} onPress={() => mutation.mutate()}>
                    <Text style={styles.buttonText}>{mutation.isPending ? 'Guardando...' : 'Guardar información'}</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ubicación registrada</Text>
                <Text style={styles.help}>La ubicación aprobada es de solo lectura.</Text>
                <Info label="Dirección" value={address} />
                <Info label="Número de lote" value={parking.direccion?.numero_lote} />
                <Info label="Latitud" value={parking.ubicacion?.latitud} />
                <Info label="Longitud" value={parking.ubicacion?.longitud} />
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Estado administrativo</Text>
                <Info label="Habilitación" value={parking.habilitacion_estado} />
                <Info label="Configuración" value={parking.configuracion_completa ? 'Completa' : 'Pendiente'} />
            </View>
        </ScrollView>
    );
}

function Info({ label, value }: { label: string; value?: string }) {
    return <View style={styles.info}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value || 'No registrado'}</Text></View>;
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: COLORS.background }, content: { padding: 18, paddingBottom: 40 },
    state: { flex: 1, padding: 30, color: COLORS.secondary, textAlign: 'center' },
    title: { color: '#0B1B4F', fontSize: 25, fontWeight: '800', marginBottom: 16 },
    section: { marginBottom: 18, padding: 18, borderRadius: 22, backgroundColor: '#E2F2FE' },
    sectionTitle: { color: '#0B1B4F', fontSize: 17, fontWeight: '800', marginBottom: 12 },
    help: { color: '#65738D', fontSize: 12, marginBottom: 10 }, label: { color: '#34425F', fontSize: 12, fontWeight: '700', marginTop: 10, marginBottom: 6 },
    input: { minHeight: 50, paddingHorizontal: 14, borderWidth: 1, borderColor: '#D6DEEB', borderRadius: 14, backgroundColor: '#FFFFFF', color: '#18264A' },
    multiline: { minHeight: 100, paddingTop: 13, textAlignVertical: 'top' },
    button: { marginTop: 18, minHeight: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2E79F3' },
    buttonText: { color: '#FFFFFF', fontWeight: '800' },
    info: { marginTop: 9, padding: 13, borderRadius: 13, backgroundColor: '#FFFFFF' },
    infoLabel: { color: '#8B94A7', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    infoValue: { marginTop: 3, color: '#18264A', fontWeight: '700' },
});
