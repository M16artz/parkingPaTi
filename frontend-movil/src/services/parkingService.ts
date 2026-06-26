// src/services/parkingService.ts

const API_URL = 'http://TU_IP_BACKEND:8000/api';
const WS_URL = 'ws://TU_IP_BACKEND:8000/ws/parking';

export const parkingService = {
    // Petición HTTP inicial
    async getInitialParkings() {
        try {
            const response = await fetch(`${API_URL}/parkings/`);
            return await response.json();
        } catch (error) {
            console.error("Error al traer parqueaderos:", error);
            return null;
        }
    },

    // Conexión en tiempo real por WebSockets
    connectToRealTimeUpdates(onMessageReceived: (data: any) => void) {
        const socket = new WebSocket(WS_URL);

        socket.onopen = () => {
            console.log('¡Conectado exitosamente al WebSocket!');
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            onMessageReceived(data);
        };

        socket.onerror = (error) => {
            console.error('Error WebSocket:', error);
        };

        return socket;
    }
};