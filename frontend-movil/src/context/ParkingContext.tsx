// src/context/ParkingContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Definimos la estructura de un Parqueadero en TypeScript
export interface Parking {
    id: string;
    name: string;
    address?: string;
    latitude: number;
    longitude: number;
    available: number;
    total: number;
}

interface ParkingContextType {
    parkings: Parking[];
    updateParkingStatus: (parkingId: string, availableSpaces: number) => void;
    setAllParkings: (parkings: Parking[]) => void;
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export function ParkingProvider({ children }: { children: ReactNode }) {
    // Inicializamos con los 3 parqueaderos de prueba en Loja
    const [parkings, setParkings] = useState<Parking[]>([
        { id: '1', name: 'Parqueadero Parque Jipiro', address: 'Av. Salvador Bustamante Celi', latitude: -3.9782, longitude: -79.2015, available: 12, total: 20 },
        { id: '2', name: 'Parqueadero Central Loja', address: '10 de Agosto y Bernardo Valdivieso', latitude: -3.9935, longitude: -79.2045, available: 0, total: 15 },
        { id: '3', name: 'Estacionamiento San Sebastián', address: 'Bolívar y Mercadillo', latitude: -3.9982, longitude: -79.2061, available: 5, total: 10 },
    ]);

    // Función para actualizar un solo parqueadero cuando cambie en el WebSocket
    const updateParkingStatus = (parkingId: string, availableSpaces: number) => {
        setParkings(prevParkings =>
            prevParkings.map(p => p.id === parkingId ? { ...p, available: availableSpaces } : p)
        );
    };

    const setAllParkings = (newParkings: Parking[]) => {
        setParkings(newParkings);
    };

    return (
        <ParkingContext.Provider value={{ parkings, updateParkingStatus, setAllParkings }}>
            {children}
        </ParkingContext.Provider>
    );
}

// Hook personalizado para usar el contexto fácilmente
export function useParking() {
    const context = useContext(ParkingContext);
    if (!context) {
        throw new Error('useParking debe ser usado dentro de un ParkingProvider');
    }
    return context;
}