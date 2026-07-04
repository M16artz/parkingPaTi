import React, { createContext, useState, useContext } from 'react';

export interface Parking {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    available: number;
    total: number;
    status: 'ABIERTO' | 'CERRADO' | 'LLENO' | 'FUERA DE SERVICIO';
}

interface ParkingContextType {
    parkings: Parking[];
    setParkings: React.Dispatch<React.SetStateAction<Parking[]>>;
}

export const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export const ParkingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [parkings, setParkings] = useState<Parking[]>([
        {
            id: '1',
            name: 'Parqueadero Central Loja',
            latitude: -3.99313,
            longitude: -79.20422,
            available: 15,
            total: 30,
            status: 'ABIERTO',
        },
        {
            id: '2',
            name: 'Estacionamiento Jipiro',
            latitude: -3.97850,
            longitude: -79.20110,
            available: 0,
            total: 20,
            status: 'LLENO',
        },
        {
            id: '3',
            name: 'Parqueadero San Sebastián',
            latitude: -3.99810,
            longitude: -79.20640,
            available: 8,
            total: 25,
            status: 'ABIERTO',
        }
    ]);

    return (
        <ParkingContext.Provider value={{ parkings, setParkings }}>
            {children}
        </ParkingContext.Provider>
    );
};

export const useParking = () => {
    const context = useContext(ParkingContext);
    if (!context) {
        throw new Error('useParking debe ser utilizado dentro de un ParkingProvider');
    }
    return context;
};