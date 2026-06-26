// src/hooks/useRealTimeParkings.ts
import { useEffect } from 'react';
import { useParking } from '../context/ParkingContext';
import { parkingService } from '../services/parkingService';

export function useRealTimeParkings() {
    const { updateParkingStatus } = useParking();

    useEffect(() => {
        // Activamos la escucha en vivo
        const socket = parkingService.connectToRealTimeUpdates((data) => {
            if (data && data.id && typeof data.available === 'number') {
                updateParkingStatus(data.id, data.available);
            }
        });

        // Desconectar cuando se cierre la app
        return () => {
            socket.close();
        };
    }, []);
}