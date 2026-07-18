import React, { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager } from '@tanstack/react-query';
import { AppState, type AppStateStatus, Platform } from 'react-native';

export function isPollingEnabled(appState: AppStateStatus, screenFocused: boolean): boolean {
    return appState === 'active' && screenFocused;
}

export function useAppStateStatus(): AppStateStatus {
    const [status, setStatus] = useState<AppStateStatus>(AppState.currentState ?? 'active');

    useEffect(() => {
        const subscription = AppState.addEventListener('change', setStatus);
        return () => subscription.remove();
    }, []);

    return status;
}

export function AppLifecycleBridge() {
    useEffect(() => {
        const appStateSubscription = AppState.addEventListener('change', (status) => {
            if (Platform.OS !== 'web') {
                focusManager.setFocused(status === 'active');
            }
        });
        onlineManager.setEventListener((setOnline) =>
            NetInfo.addEventListener((state) => setOnline(state.isConnected !== false)),
        );
        return () => {
            appStateSubscription.remove();
        };
    }, []);

    return null;
}
