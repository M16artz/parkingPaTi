// App.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'; // <-- NUEVO COMPONENTE SEGURO
import { COLORS } from './src/constants/theme';
import { ParkingProvider } from './src/context/ParkingContext';
import { useRealTimeParkings } from './src/hooks/useRealTimeParkings';
import MapScreen from './src/screens/MapScreen';
import ListScreen from './src/screens/ListScreen';

function MainApp() {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Mantén el hook comentado por ahora para evitar el error de red
  // useRealTimeParkings();

  return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.tertiary} />

        {/* HEADER PRINCIPAL */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ParkingPaTi</Text>
          <Text style={styles.headerSubtitle}>Conductores — Loja</Text>
        </View>

        {/* CONTENIDO DE LA PANTALLA SELECCIONADA */}
        <View style={styles.content}>
          {viewMode === 'map' ? <MapScreen /> : <ListScreen />}
        </View>

        {/* TABS DE NAVEGACIÓN DUAL INFERIOR */}
        <View style={styles.tabBar}>
          <TouchableOpacity
              style={[styles.tabButton, viewMode === 'map' && styles.activeTab]}
              onPress={() => setViewMode('map')}
          >
            <Text style={[styles.tabText, viewMode === 'map' && styles.activeTabText]}>🗺️ Mapa</Text>
          </TouchableOpacity>

          <TouchableOpacity
              style={[styles.tabButton, viewMode === 'list' && styles.activeTab]}
              onPress={() => setViewMode('list')}
          >
            <Text style={[styles.tabText, viewMode === 'list' && styles.activeTabText]}>📋 Lista</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
  );
}

export default function App() {
  return (
      <SafeAreaProvider>
        <ParkingProvider>
          <MainApp />
        </ParkingProvider>
      </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.tertiary, paddingTop: 15, paddingBottom: 15, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  headerTitle: { color: COLORS.white, fontSize: 22, fontWeight: 'bold', letterSpacing: 0.5 },
  headerSubtitle: { color: COLORS.primary, fontSize: 11, fontWeight: '500', marginTop: 2 },
  content: { flex: 1 },
  tabBar: { flexDirection: 'row', height: 60, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: '#EAEAEA' },
  tabButton: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  activeTab: { borderTopWidth: 3, borderTopColor: COLORS.primary, backgroundColor: '#F4F7FF' },
  tabText: { color: COLORS.secondary, fontSize: 14, fontWeight: '500' },
  activeTabText: { color: COLORS.primary, fontWeight: 'bold' },
});