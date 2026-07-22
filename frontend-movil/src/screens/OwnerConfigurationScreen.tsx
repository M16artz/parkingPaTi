import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { COLORS } from '../constants/theme';
import { queryClient } from '../query/queryClient';
import {
    fetchOwnerManagement,
    type OwnerRate,
    saveOwnerConfiguration,
    updateOperationalStatus,
} from '../services/ownerDashboardApi';

const DAYS = [['LUNES', 'Lunes'], ['MARTES', 'Martes'], ['MIERCOLES', 'Miércoles'], ['JUEVES', 'Jueves'], ['VIERNES', 'Viernes'], ['SABADO', 'Sábado'], ['DOMINGO', 'Domingo']] as const;
const STATUSES = [['AUTOMATICO', 'Automático'], ['ABIERTO', 'Abierto'], ['CERRADO', 'Cerrado'], ['FUERA_DE_SERVICIO', 'Fuera de servicio']] as const;
type ScheduleForm = Record<string, { active: boolean; open: string; close: string }>;

export default function OwnerConfigurationScreen() {
    const query = useQuery({ queryKey: ['owner', 'mobile-dashboard'], queryFn: fetchOwnerManagement });
    const [schedules, setSchedules] = useState<ScheduleForm>({});
    const [rates, setRates] = useState<OwnerRate[]>([]);
    const [quickOpen, setQuickOpen] = useState('08:00');
    const [quickClose, setQuickClose] = useState('18:00');
    useEffect(() => {
        if (!query.data) return;
        const byDay = new Map(query.data.configuration.horarios.map((item) => [item.dia, item]));
        setSchedules(Object.fromEntries(DAYS.map(([code]) => {
            const current = byDay.get(code);
            return [code, { active: Boolean(current), open: current?.hora_apertura.slice(0, 5) || '08:00', close: current?.hora_cierre.slice(0, 5) || '18:00' }];
        })));
        setRates(query.data.configuration.tarifas);
    }, [query.data]);

    const refresh = () => queryClient.invalidateQueries({ queryKey: ['owner', 'mobile-dashboard'] });
    const statusMutation = useMutation({
        mutationFn: updateOperationalStatus,
        onSuccess: async () => { await refresh(); Alert.alert('Estado actualizado'); },
        onError: (error) => Alert.alert('No se pudo actualizar', error.message),
    });
    const saveMutation = useMutation({
        mutationFn: () => saveOwnerConfiguration({
            horarios: DAYS.flatMap(([code]) => {
                const schedule = schedules[code];
                return schedule?.active ? [{ dia: code, hora_apertura: schedule.open, hora_cierre: schedule.close }] : [];
            }),
            tarifas: rates.map(({ codigo, nombre_visible, precio_hora, activa }) => ({ codigo, nombre_visible, precio_hora, activa })),
            cantidad_espacios: query.data!.configuration.total_espacios,
        }),
        onSuccess: async () => { await refresh(); Alert.alert('Configuración guardada', 'Los horarios y tarifas fueron actualizados.'); },
        onError: (error) => Alert.alert('No se pudo guardar', error.message),
    });

    if (!query.data) return <Text style={styles.state}>{query.isError ? query.error.message : 'Cargando configuración...'}</Text>;
    const configuration = query.data.configuration;
    const selectedStatus = configuration.estado_operativo_manual || 'AUTOMATICO';
    const changeSchedule = (day: string, values: Partial<ScheduleForm[string]>) => setSchedules((current) => ({
        ...current,
        [day]: { ...(current[day] || { active: false, open: '08:00', close: '18:00' }), ...values },
    }));
    const changeRate = (code: string, values: Partial<OwnerRate>) => setRates((current) => current.map((rate) => rate.codigo === code ? { ...rate, ...values } : rate));

    return (
        <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Configuración general</Text>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Estado de disponibilidad</Text>
                <Text style={styles.live}>Estado calculado: {configuration.estado_operativo}</Text>
                <View style={styles.optionWrap}>{STATUSES.map(([code, label]) => (
                    <TouchableOpacity key={code} style={[styles.option, selectedStatus === code && styles.optionActive]} onPress={() => statusMutation.mutate(code)}>
                        <Text style={[styles.optionText, selectedStatus === code && styles.optionTextActive]}>{label}</Text>
                    </TouchableOpacity>
                ))}</View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Horario rápido</Text>
                <View style={styles.timeRow}><TimeInput value={quickOpen} onChange={setQuickOpen} /><Text style={styles.to}>a</Text><TimeInput value={quickClose} onChange={setQuickClose} /></View>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => setSchedules(Object.fromEntries(DAYS.map(([code]) => [code, { active: true, open: quickOpen, close: quickClose }]))) }>
                    <Text style={styles.secondaryText}>Aplicar a todos</Text>
                </TouchableOpacity>
                {DAYS.map(([code, label]) => {
                    const item = schedules[code] || { active: false, open: '08:00', close: '18:00' };
                    return <View key={code} style={styles.dayCard}>
                        <View style={styles.dayHeader}><Text style={styles.dayName}>{label}</Text><Switch value={item.active} onValueChange={(active) => changeSchedule(code, { active })} /></View>
                        {item.active ? <View style={styles.timeRow}><TimeInput value={item.open} onChange={(open) => changeSchedule(code, { open })} /><Text style={styles.to}>a</Text><TimeInput value={item.close} onChange={(close) => changeSchedule(code, { close })} /></View> : <Text style={styles.closed}>Cerrado</Text>}
                    </View>;
                })}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tarifas por hora</Text>
                {rates.map((rate) => <View key={rate.codigo} style={styles.rateCard}>
                    <View style={styles.dayHeader}><Text style={styles.dayName}>{rate.nombre_visible}</Text><Switch disabled={rate.codigo === 'NORMAL'} value={rate.activa} onValueChange={(activa) => changeRate(rate.codigo, { activa })} /></View>
                    <TextInput editable={rate.activa} keyboardType="decimal-pad" style={styles.rateInput} value={rate.precio_hora} onChangeText={(precio_hora) => changeRate(rate.codigo, { precio_hora: precio_hora.replace(',', '.') })} />
                </View>)}
                <TouchableOpacity style={styles.saveButton} disabled={saveMutation.isPending} onPress={() => saveMutation.mutate()}>
                    <Text style={styles.saveText}>{saveMutation.isPending ? 'Guardando...' : 'Guardar horarios y tarifas'}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

function TimeInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    return <TextInput accessibilityLabel="Hora en formato HH:MM" maxLength={5} placeholder="08:00" keyboardType="numbers-and-punctuation" style={styles.timeInput} value={value} onChangeText={onChange} />;
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: COLORS.background }, content: { padding: 18, paddingBottom: 40 }, state: { padding: 30, textAlign: 'center' },
    title: { color: '#0B1B4F', fontSize: 25, fontWeight: '800', marginBottom: 16 }, section: { marginBottom: 18, padding: 17, borderRadius: 22, backgroundColor: '#E2F2FE' },
    sectionTitle: { color: '#0B1B4F', fontSize: 17, fontWeight: '800', marginBottom: 11 }, live: { color: '#52617C', fontWeight: '700', marginBottom: 11 },
    optionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, option: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: '#FFFFFF' },
    optionActive: { backgroundColor: '#2E79F3' }, optionText: { color: '#52617C', fontSize: 12, fontWeight: '700' }, optionTextActive: { color: '#FFFFFF' },
    timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, timeInput: { width: 88, height: 45, borderRadius: 12, backgroundColor: '#FFFFFF', textAlign: 'center', color: '#18264A', fontWeight: '700' }, to: { color: '#65738D' },
    secondaryButton: { marginVertical: 12, minHeight: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#D2E7FC' }, secondaryText: { color: '#2367CF', fontWeight: '800' },
    dayCard: { marginTop: 9, padding: 13, borderRadius: 15, backgroundColor: '#FFFFFF' }, dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, dayName: { flex: 1, color: '#18264A', fontWeight: '800' }, closed: { marginTop: 5, color: '#8B94A7', fontStyle: 'italic' },
    rateCard: { marginBottom: 10, padding: 14, borderRadius: 15, backgroundColor: '#FFFFFF' }, rateInput: { marginTop: 10, height: 46, paddingHorizontal: 13, borderRadius: 12, backgroundColor: '#F3F6FA', color: '#18264A', fontWeight: '800' },
    saveButton: { marginTop: 7, minHeight: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2E79F3' }, saveText: { color: '#FFFFFF', fontWeight: '800' },
});
