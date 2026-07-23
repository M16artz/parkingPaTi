import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { COLORS } from '../constants/theme';
import { queryClient } from '../query/queryClient';
import {
    addOwnerSpaces, deleteOwnerSpace, editOwnerSpace, fetchOwnerManagement, finishOwnerStay,
    getOwnerStay, reactivateOwnerSpace, startOwnerStay, type OwnerSpace, type OwnerStay,
} from '../services/ownerDashboardApi';

type Dialog = { mode: 'start' | 'stay' | 'edit'; space: OwnerSpace; stay?: OwnerStay } | null;

export default function OwnerSpacesScreen() {
    const query = useQuery({ queryKey: ['owner', 'mobile-dashboard'], queryFn: fetchOwnerManagement, refetchInterval: 15_000 });
    const [quantity, setQuantity] = useState('1');
    const [dialog, setDialog] = useState<Dialog>(null);
    const [selectedRate, setSelectedRate] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [busy, setBusy] = useState(false);
    const [now, setNow] = useState(Date.now());
    useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
    const refresh = async () => { await queryClient.invalidateQueries({ queryKey: ['owner', 'mobile-dashboard'] }); };
    const run = async (action: () => Promise<unknown>, message: string) => {
        setBusy(true);
        try { await action(); await refresh(); setDialog(null); Alert.alert('Operación completada', message); }
        catch (error) { Alert.alert('No se pudo completar', error instanceof Error ? error.message : 'Inténtalo nuevamente.'); }
        finally { setBusy(false); }
    };

    if (!query.data) return <Text style={styles.state}>{query.isError ? query.error.message : 'Cargando espacios...'}</Text>;
    const { configuration } = query.data;
    const active = configuration.espacios.filter((space) => space.is_active);
    const deleted = configuration.espacios.map((space) => {
        const elapsed = space.deleted_at ? Math.floor((now - new Date(space.deleted_at).getTime()) / 1000) : 99;
        return { ...space, remaining: 15 - elapsed };
    }).filter((space) => !space.is_active && space.remaining > 0);
    const rates = configuration.tarifas.filter((rate) => rate.activa);

    const confirmAdd = () => {
        const count = Number(quantity);
        if (!Number.isInteger(count) || count < 1 || count > 100) return Alert.alert('Cantidad inválida', 'Ingresa un valor entre 1 y 100.');
        Alert.alert('Agregar espacios', `¿Deseas agregar ${count} espacio(s)?`, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Agregar', onPress: () => run(() => addOwnerSpaces(count), 'Los espacios se agregaron correctamente.') }]);
    };
    const confirmState = (space: OwnerSpace) => {
        const disabling = space.estado !== 'INHABILITADO';
        Alert.alert(disabling ? 'Inhabilitar espacio' : 'Reactivar espacio', `¿Deseas ${disabling ? 'inhabilitar' : 'reactivar'} ${space.nombre}?`, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Confirmar', onPress: () => run(() => editOwnerSpace(space.id, { estado: disabling ? 'INHABILITADO' : 'LIBRE' }), `El espacio fue ${disabling ? 'inhabilitado' : 'reactivado'}.`) },
        ]);
    };
    const confirmDelete = (space: OwnerSpace) => Alert.alert('Espacio no disponible', `¿Deseas retirar ${space.nombre}? Tendrás 15 segundos para revertirlo.`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Retirar', style: 'destructive', onPress: () => run(() => deleteOwnerSpace(space.id), 'El espacio fue retirado. Puedes revertirlo durante 15 segundos.') },
    ]);
    const openStart = (space: OwnerSpace) => { setSelectedRate(space.tarifa_predeterminada || rates[0]?.id || null); setDialog({ mode: 'start', space }); };
    const openEdit = (space: OwnerSpace) => { setEditName(space.nombre); setSelectedRate(space.tarifa_predeterminada || rates[0]?.id || null); setDialog({ mode: 'edit', space }); };
    const openStay = async (space: OwnerSpace) => {
        setBusy(true);
        try { setDialog({ mode: 'stay', space, stay: await getOwnerStay(space.id) }); }
        catch (error) { Alert.alert('No se pudo consultar', error instanceof Error ? error.message : 'Inténtalo nuevamente.'); }
        finally { setBusy(false); }
    };

    return <View style={styles.page}>
        <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Gestión de espacios</Text>
            <View style={styles.summary}><Text style={styles.free}>{active.filter((s) => s.estado === 'LIBRE').length} libres</Text><Text style={styles.occupied}>{active.filter((s) => s.estado === 'OCUPADO').length} ocupados</Text><Text style={styles.disabled}>{active.filter((s) => s.estado === 'INHABILITADO').length} inhabilitados</Text></View>
            <View style={styles.addRow}><TextInput keyboardType="number-pad" style={styles.quantity} value={quantity} onChangeText={setQuantity} /><TouchableOpacity style={styles.addButton} onPress={confirmAdd}><Ionicons name="add" size={19} color="#FFFFFF" /><Text style={styles.addText}>Agregar espacios</Text></TouchableOpacity></View>
            {active.map((space) => <View key={space.id} style={[styles.card, space.estado === 'LIBRE' ? styles.cardFree : space.estado === 'OCUPADO' ? styles.cardOccupied : styles.cardDisabled]}>
                <View style={styles.cardHeader}><Text style={styles.spaceName}>{space.nombre}</Text><Text style={styles.status}>{space.estado}</Text></View>
                <Text style={styles.rateLabel}>
                    Tarifa: {(space.estado === 'OCUPADO' ? space.estancia_tarifa_codigo : null) || space.tarifa_codigo || 'Sin configurar'}
                </Text>
                <View style={styles.actions}>
                    {space.estado === 'LIBRE' ? <TouchableOpacity style={styles.primaryAction} onPress={() => openStart(space)}><Text style={styles.primaryActionText}>Iniciar</Text></TouchableOpacity> : null}
                    {space.estado === 'OCUPADO' ? <TouchableOpacity style={styles.stopAction} onPress={() => openStay(space)}><Text style={styles.stopText}>Ver estancia</Text></TouchableOpacity> : null}
                    {space.estado !== 'OCUPADO' ? <TouchableOpacity style={styles.smallAction} onPress={() => confirmState(space)}><Ionicons name={space.estado === 'INHABILITADO' ? 'refresh' : 'ban-outline'} size={18} color="#B76A00" /></TouchableOpacity> : null}
                    <TouchableOpacity style={styles.smallAction} onPress={() => openEdit(space)}><Ionicons name="pencil" size={17} color="#2E79F3" /></TouchableOpacity>
                    {space.estado !== 'OCUPADO' ? <TouchableOpacity style={styles.smallAction} onPress={() => confirmDelete(space)}><Ionicons name="trash-outline" size={18} color="#C23838" /></TouchableOpacity> : null}
                </View>
            </View>)}
            {deleted.length ? <View style={styles.deletedSection}><Text style={styles.deletedTitle}>Espacios no disponibles</Text>{deleted.map((space) => <View key={space.id} style={styles.deletedRow}><View><Text style={styles.deletedName}>{space.nombre}</Text><Text style={styles.deletedTime}>{space.remaining}s para revertir</Text></View><TouchableOpacity onPress={() => run(() => reactivateOwnerSpace(space.id), 'El espacio volvió a estar disponible.')}><Text style={styles.undo}>Revertir</Text></TouchableOpacity></View>)}</View> : null}
        </ScrollView>

        <Modal visible={Boolean(dialog)} transparent animationType="fade" onRequestClose={() => setDialog(null)}>
            <View style={styles.modalBackdrop}><View style={styles.modalCard}>
                <Text style={styles.modalTitle}>{dialog?.mode === 'start' ? 'Iniciar estancia' : dialog?.mode === 'edit' ? `Editar ${dialog.space.nombre}` : 'Estancia actual'}</Text>
                {dialog?.mode === 'edit' ? <><Text style={styles.modalLabel}>Nombre</Text><TextInput style={styles.modalInput} value={editName} onChangeText={setEditName} /></> : null}
                {dialog?.mode === 'start' || dialog?.mode === 'edit' ? <><Text style={styles.modalLabel}>Tarifa</Text>{rates.map((rate) => <TouchableOpacity key={rate.id} style={[styles.rateOption, selectedRate === rate.id && styles.rateSelected]} onPress={() => setSelectedRate(rate.id)}><Text style={selectedRate === rate.id ? styles.rateSelectedText : styles.rateOptionText}>{rate.nombre_visible} · ${rate.precio_hora}/h</Text></TouchableOpacity>)}</> : null}
                {dialog?.mode === 'stay' && dialog.stay ? <View style={styles.staySummary}><Text style={styles.stayValue}>{dialog.stay.minutos_reales} min · {dialog.stay.horas_cobradas} hora(s)</Text><Text style={styles.stayValue}>Tarifa {dialog.stay.tarifa_tipo_snapshot} · ${dialog.stay.precio_hora_snapshot}/h</Text><Text style={styles.cost}>${dialog.stay.costo_total}</Text></View> : null}
                <View style={styles.modalActions}><TouchableOpacity style={styles.cancel} onPress={() => setDialog(null)}><Text>Cancelar</Text></TouchableOpacity>
                    {dialog?.mode === 'start' ? <TouchableOpacity disabled={!selectedRate || busy} style={styles.confirm} onPress={() => run(() => startOwnerStay(dialog.space.id, selectedRate!), 'La estancia inició correctamente.')}><Text style={styles.confirmText}>Confirmar inicio</Text></TouchableOpacity> : null}
                    {dialog?.mode === 'edit' ? <TouchableOpacity disabled={!editName.trim() || busy} style={styles.confirm} onPress={() => run(() => editOwnerSpace(dialog.space.id, { nombre: editName.trim(), tarifa_predeterminada: selectedRate }), 'El espacio se actualizó correctamente.')}><Text style={styles.confirmText}>Guardar</Text></TouchableOpacity> : null}
                    {dialog?.mode === 'stay' ? <TouchableOpacity disabled={busy} style={styles.finish} onPress={() => run(() => finishOwnerStay(dialog.space.id), 'Estancia finalizada. El espacio volvió a estar libre.')}><Text style={styles.confirmText}>Finalizar</Text></TouchableOpacity> : null}
                </View>
            </View></View>
        </Modal>
    </View>;
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: COLORS.background }, content: { padding: 18, paddingBottom: 40 }, state: { padding: 30, textAlign: 'center' }, title: { color: '#0B1B4F', fontSize: 25, fontWeight: '800', marginBottom: 15 },
    summary: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 13 }, free: { color: '#137A53', backgroundColor: '#E5F7EF', padding: 8, borderRadius: 10, fontWeight: '700' }, occupied: { color: '#A73B48', backgroundColor: '#FCEAEC', padding: 8, borderRadius: 10, fontWeight: '700' }, disabled: { color: '#9B6500', backgroundColor: '#FFF3D6', padding: 8, borderRadius: 10, fontWeight: '700' },
    addRow: { flexDirection: 'row', gap: 10, marginBottom: 16 }, quantity: { width: 58, height: 50, borderRadius: 13, backgroundColor: '#FFFFFF', textAlign: 'center', fontWeight: '800' }, addButton: { flex: 1, height: 50, borderRadius: 13, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2E79F3' }, addText: { color: '#FFFFFF', fontWeight: '800' },
    card: { marginBottom: 12, padding: 16, borderWidth: 2, borderRadius: 18, backgroundColor: '#FFFFFF' }, cardFree: { borderColor: '#61C89D' }, cardOccupied: { borderColor: '#E4828D' }, cardDisabled: { borderColor: '#EBC66C' }, cardHeader: { flexDirection: 'row', justifyContent: 'space-between' }, spaceName: { color: '#18264A', fontSize: 19, fontWeight: '800' }, status: { color: '#69758B', fontSize: 10, fontWeight: '800' }, rateLabel: { marginTop: 5, color: '#8B94A7', fontSize: 12 }, actions: { marginTop: 14, flexDirection: 'row', gap: 8 }, primaryAction: { flex: 1, padding: 11, borderRadius: 11, alignItems: 'center', backgroundColor: '#DDF5E9' }, primaryActionText: { color: '#137A53', fontWeight: '800' }, stopAction: { flex: 1, padding: 11, borderRadius: 11, alignItems: 'center', backgroundColor: '#FCEAEC' }, stopText: { color: '#A73B48', fontWeight: '800' }, smallAction: { width: 42, height: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F6F9' },
    deletedSection: { marginTop: 8, padding: 15, borderRadius: 16, backgroundColor: '#FFFFFF' }, deletedTitle: { color: '#18264A', fontWeight: '800', marginBottom: 8 }, deletedRow: { paddingVertical: 9, flexDirection: 'row', justifyContent: 'space-between' }, deletedName: { color: '#34425F', fontWeight: '700' }, deletedTime: { color: '#8B94A7', fontSize: 11 }, undo: { color: '#2E79F3', fontWeight: '800' },
    modalBackdrop: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(5,15,35,0.6)' }, modalCard: { width: '100%', maxWidth: 430, padding: 22, borderRadius: 24, backgroundColor: '#FFFFFF' }, modalTitle: { color: '#0B1B4F', fontSize: 21, fontWeight: '800', marginBottom: 14 }, modalLabel: { marginTop: 9, marginBottom: 6, color: '#52617C', fontWeight: '700' }, modalInput: { height: 48, paddingHorizontal: 13, borderRadius: 12, backgroundColor: '#F2F5F9' }, rateOption: { marginTop: 7, padding: 12, borderWidth: 1, borderColor: '#DDE4EE', borderRadius: 12 }, rateSelected: { borderColor: '#2E79F3', backgroundColor: '#EAF2FF' }, rateOptionText: { color: '#52617C' }, rateSelectedText: { color: '#2367CF', fontWeight: '800' }, staySummary: { padding: 15, borderRadius: 14, backgroundColor: '#F3F6FA' }, stayValue: { color: '#52617C', marginBottom: 7 }, cost: { color: '#0B1B4F', fontSize: 26, fontWeight: '800' }, modalActions: { marginTop: 19, flexDirection: 'row', justifyContent: 'flex-end', gap: 9 }, cancel: { padding: 12, borderRadius: 12, backgroundColor: '#EEF1F5' }, confirm: { padding: 12, borderRadius: 12, backgroundColor: '#2E79F3' }, finish: { padding: 12, borderRadius: 12, backgroundColor: '#C23838' }, confirmText: { color: '#FFFFFF', fontWeight: '800' },
});
