import 'react-native-gesture-handler'; // Primera línea obligatoria
import React from 'react';
import { ParkingProvider } from './src/context/ParkingContext';
import AppNavigator from './src/navigation/AppNavigator';
// 1. Comenta esta importación:
// import { useRealTimeParkings } from './src/hooks/useRealTimeParkings';

function MainApp() {
    // 2. Comenta o borra esta línea de aquí abajo:
    // useRealTimeParkings();

    return <AppNavigator />;
}

export default function App() {
    return (
        <ParkingProvider>
            <MainApp />
        </ParkingProvider>
    );
}