import { useState, useEffect, useCallback } from 'react';
import { parqueaderoService } from '../services/parqueaderoService';
import { espacioService } from '../services/espacioService';
import { useDisponibilidadSocket } from '../hooks/useDisponibilidadSocket';
import { extraerErroresApi } from '../utils/apiError';

// Antes: OwnerConfigEspacios.jsx no usaba ningún controlador - todo el
// estado era local (`useState` con 12 espacios simulados) y
// handleSaveAll() hacía console.log(espacios) + alert(). Este hook
// reemplaza esa simulación por llamadas reales a /api/espacios/.
//
// Cambio de diseño importante: cada acción (crear un espacio, borrar uno,
// cambiar su estado) se envía a la API en el momento en que ocurre, no
// se acumula para un botón "Guardar Todo". Motivo: apps/parqueaderos
// tiene un WebSocket real (consumers.py) que empuja estos mismos cambios
// a otros clientes en <= 5s (conductores viendo el mapa, otra pestaña del
// mismo propietario, etc.) - simular un buffer local y "guardar" al final
// rompería esa garantía de tiempo real y generaría desincronización
// mientras el propietario edita.
//
// También se elimina el campo `tarifa` por espacio: Espacio (backend)
// solo tiene numero_espacio + estado. Ver el informe, "Gap de negocio:
// tarifas por espacio".

const numeroEspacio = (indice) => String(indice + 1).padStart(2, '0');

export const useEspacioController = () => {
    const [parqueaderoId, setParqueaderoId] = useState(null);
    const [espacios, setEspacios] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [errors, setErrors] = useState({});

    const [selectedEspacio, setSelectedEspacio] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        let cancelado = false;

        async function cargar() {
            setIsLoading(true);
            setLoadError(null);
            try {
                const propios = await parqueaderoService.obtenerMios();
                const parqueadero = propios[0];
                if (!parqueadero) {
                    if (!cancelado) setLoadError('Aún no tienes un parqueadero registrado.');
                    return;
                }
                if (cancelado) return;
                setParqueaderoId(parqueadero.id);

                const lista = await espacioService.listarPorParqueadero(parqueadero.id);
                if (!cancelado) setEspacios(lista);
            } catch (error) {
                if (!cancelado) setLoadError(extraerErroresApi(error).formulario ?? 'No se pudo cargar los espacios.');
            } finally {
                if (!cancelado) setIsLoading(false);
            }
        }

        cargar();
        return () => {
            cancelado = true;
        };
    }, []);

    // Recibe en vivo los cambios de estado que hagan OTROS clientes
    // (conductores ocupando/liberando un espacio, otra pestaña, etc.) sobre
    // este mismo parqueadero, vía consumers.py::DisponibilidadConsumer.
    useDisponibilidadSocket(parqueaderoId, (evento) => {
        setEspacios((prev) =>
            prev.map((esp) => (esp.id === evento.espacio_id ? { ...esp, estado: evento.estado } : esp))
        );
    });

    const numEspacios = espacios.length;

    // Sincroniza el total de espacios contra el backend: crea los que
    // faltan, borra los sobrantes (empezando por el número más alto).
    // Antes: handleNumEspaciosChange solo recortaba/extendía un array local.
    const sincronizarCantidad = useCallback(
        async (cantidadObjetivo) => {
            if (!parqueaderoId) return;
            const objetivo = Math.max(1, cantidadObjetivo || 1);
            setIsSyncing(true);
            setErrors({});

            try {
                if (objetivo > espacios.length) {
                    const nuevos = [];
                    for (let i = espacios.length; i < objetivo; i++) {
                        // eslint-disable-next-line no-await-in-loop
                        const creado = await espacioService.crear(parqueaderoId, numeroEspacio(i));
                        nuevos.push(creado);
                    }
                    setEspacios((prev) => [...prev, ...nuevos]);
                } else if (objetivo < espacios.length) {
                    const sobrantes = [...espacios]
                        .sort((a, b) => a.numero_espacio.localeCompare(b.numero_espacio))
                        .slice(objetivo);

                    await Promise.all(sobrantes.map((esp) => espacioService.eliminar(esp.id)));
                    const idsEliminados = new Set(sobrantes.map((e) => e.id));
                    setEspacios((prev) => prev.filter((esp) => !idsEliminados.has(esp.id)));
                }
            } catch (error) {
                setErrors(extraerErroresApi(error));
            } finally {
                setIsSyncing(false);
            }
        },
        [parqueaderoId, espacios]
    );

    const openEditModal = (espacio) => {
        setSelectedEspacio({ ...espacio });
        setIsModalOpen(true);
    };

    // Antes: saveEspacioChanges solo actualizaba el array local (setEspacios).
    const saveEspacioChanges = async () => {
        if (!selectedEspacio) return;
        setIsSyncing(true);
        try {
            const actualizado = await espacioService.cambiarEstado(selectedEspacio.id, selectedEspacio.estado);
            setEspacios((prev) => prev.map((esp) => (esp.id === actualizado.id ? actualizado : esp)));
            setIsModalOpen(false);
        } catch (error) {
            setErrors(extraerErroresApi(error));
        } finally {
            setIsSyncing(false);
        }
    };

    return {
        parqueaderoId,
        espacios,
        numEspacios,
        isLoading,
        loadError,
        isSyncing,
        errors,
        sincronizarCantidad,
        selectedEspacio,
        setSelectedEspacio,
        isModalOpen,
        setIsModalOpen,
        openEditModal,
        saveEspacioChanges,
    };
};