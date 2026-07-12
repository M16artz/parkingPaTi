// src/hooks/useDisponibilidadSocket.js
//
// Antes: no existía NINGÚN cliente WebSocket en el frontend, a pesar de
// que apps/parqueaderos/consumers.py ya implementa push en tiempo real
// (RNF06: notificar cambios de espacio en <= 5s) en
// ws://<host>/ws/parqueaderos/<parqueadero_id>/. Sin esto, el dashboard
// del propietario solo se entera de cambios (p. ej. un conductor
// ocupando/liberando un espacio desde otra pantalla) si recarga la
// página.
//
// Uso: useDisponibilidadSocket(parqueaderoId, (evento) => { ... })
// evento = { espacio_id, numero_espacio, parqueadero_id, estado, disponibles }

import { useEffect, useRef } from 'react';
import { WS_BASE_URL } from '../config/env';

export function useDisponibilidadSocket(parqueaderoId, onEspacioActualizado) {
  const callbackRef = useRef(onEspacioActualizado);
  callbackRef.current = onEspacioActualizado;

  useEffect(() => {
    if (!parqueaderoId) return undefined;

    const socket = new WebSocket(`${WS_BASE_URL}/ws/parqueaderos/${parqueaderoId}/`);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        callbackRef.current?.(data);
      } catch {
        // Mensaje no-JSON inesperado: se ignora en vez de romper el socket.
      }
    };

    return () => socket.close();
  }, [parqueaderoId]);
}
