// src/services/parkingService.ts

// ⚠️ REEMPLAZA "192.168.1.XX" CON TU DIRECCIÓN IPV4 DEL COMANDO IPCONFIG
const BASE_IP = '192.168.1.5';

const API_URL = `http://${BASE_IP}:8000/api`;
const WS_URL = `ws://${BASE_IP}:8000/ws/parking`;

export interface Parking {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    total: number;
    available: number;
}

export const parkingService = {
    /**
     * Obtiene el listado inicial de parqueaderos vía REST API
     */
    async getParkings(): Promise<Parking[]> {
        try {
            const response = await fetch(`${API_URL}/parqueaderos/`);
            if (!response.ok) {
                throw new Error('Error al conectar con el servidor');
            }
            return await response.json();
        } catch (error) {
            console.error('Error en getParkings:', error);
            // Retornamos un arreglo vacío en caso de fallo para evitar que la app se rompa
            return [];
        }
    },

    /**
     * Inicializa y retorna una conexión WebSocket para escuchar actualizaciones en tiempo real
     */
    connectToRealTimeUpdates(onMessageReceived: (data: any) => void): WebSocket {
        const socket = new WebSocket(WS_URL);

        socket.onopen = () => {
            console.log('✅ Conexión WebSocket establecida con el Backend de ParkingPaTi');
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessageReceived(data);
            } catch (error) {
                console.error('Error al parsear mensaje del WebSocket:', error);
            }
        };

        socket.onerror = (error) => {
            console.error('❌ Error en el canal de WebSocket:', error);
        };

        socket.onclose = (e) => {
            console.log('🔌 Conexión WebSocket cerrada:', e.reason);
        };

        return socket;
    }
};