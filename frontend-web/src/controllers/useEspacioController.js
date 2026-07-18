import { useState, useEffect, useCallback } from 'react';
import { parqueaderoService } from '../services/parqueaderoService';
import { espacioService } from '../services/espacioService';
import { tarifaService } from '../services/tarifaService';
import { extraerErroresApi } from '../utils/apiError';

// Este hook sincroniza espacios contra /api/espacios/ en tiempo real.
// La tarifa por espacio se guarda como categoria_tarifa en Espacio.

const numeroEspacio = (indice) => String(indice + 1).padStart(2, '0');

const idsPorCodigo = (categorias) => ({
    GENERAL: categorias.general?.id ?? null,
    PREFERENCIAL: categorias.descuento?.id ?? null,
    PESADOS: categorias.grandes?.id ?? null,
});

export const useEspacioController = () => {
    const [parqueaderoId, setParqueaderoId] = useState(null);
    const [espacios, setEspacios] = useState([]);
    const [categoriaIdsPorCodigo, setCategoriaIdsPorCodigo] = useState({
        GENERAL: null,
        PREFERENCIAL: null,
        PESADOS: null,
    });
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

                const [lista, categorias] = await Promise.all([
                    espacioService.listarPorParqueadero(parqueadero.id),
                    tarifaService.obtenerCategoriasPorParqueadero(parqueadero.id),
                ]);
                if (cancelado) return;

                setEspacios(lista);
                setCategoriaIdsPorCodigo(idsPorCodigo(categorias));
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

        const categoriaId = categoriaIdsPorCodigo[selectedEspacio.tarifa];
        if (selectedEspacio.tarifa && !categoriaId) {
            setErrors({
                formulario: `Aun no has configurado un precio para la tarifa "${selectedEspacio.tarifa}". Hazlo primero en Configuracion General.`,
            });
            return;
        }

        setIsSyncing(true);
        try {
            const actualizado = await espacioService.actualizar(selectedEspacio.id, {
                estado: selectedEspacio.estado,
                categoriaTarifaId: categoriaId,
            });
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
