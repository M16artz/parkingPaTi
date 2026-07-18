import 'react-native-gesture-handler'; // Primera línea obligatoria
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation/AppNavigator';
import { AppLifecycleBridge } from './src/hooks/useAppLifecycle';
import { queryClient } from './src/query/queryClient';

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AppLifecycleBridge />
            <AppNavigator />
        </QueryClientProvider>
    );
}
