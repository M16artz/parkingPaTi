import { getMobileEnvironment } from '../config/environment';
import { getMobileAccessToken } from './mobileAuthApi';

export interface OwnerSchedule {
    id?: number;
    dia: string;
    hora_apertura: string;
    hora_cierre: string;
}

export interface OwnerRate {
    id: number;
    codigo: string;
    nombre_visible: string;
    precio_hora: string;
    activa: boolean;
}

export interface OwnerSpace {
    id: number;
    nombre: string;
    estado: 'LIBRE' | 'OCUPADO' | 'INHABILITADO';
    tarifa_predeterminada: number | null;
    tarifa_codigo: string | null;
    tarifa_precio_hora: string | null;
    is_active: boolean;
    deleted_at: string | null;
}

export interface OwnerConfiguration {
    estado_operativo: string;
    estado_operativo_manual: string | null;
    total_espacios: number;
    espacios_disponibles: number;
    configuracion_completa: boolean;
    horarios: OwnerSchedule[];
    tarifas: OwnerRate[];
    espacios: OwnerSpace[];
}

export interface OwnerMetrics {
    estancias_hoy: number;
    estancias_activas: number;
    ingresos_estimados: string;
    ingresos_finalizados: string;
    ingresos_en_curso: string;
}

export interface OwnerParking {
    id: number;
    nombre: string;
    descripcion: string;
    habilitacion_estado: string;
    configuracion_completa: boolean;
    direccion?: { calle_principal?: string; calle_secundaria?: string; numero_lote?: string };
    ubicacion?: { latitud?: string; longitud?: string };
    approved_at?: string | null;
    updated_at?: string;
}

export interface OwnerStay {
    id: number;
    espacio_nombre: string;
    tarifa_tipo_snapshot: string;
    precio_hora_snapshot: string;
    minutos_reales: number;
    horas_cobradas: number;
    costo_total: string;
    estado: string;
}

export interface OwnerManagementData {
    parking: OwnerParking;
    configuration: OwnerConfiguration;
    metrics: OwnerMetrics;
}

async function ownerRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
    const accessToken = await getMobileAccessToken();
    if (!accessToken) throw new Error('Tu sesión terminó. Inicia sesión nuevamente.');
    const { apiBaseUrl } = getMobileEnvironment();
    const response = await fetch(`${apiBaseUrl}${path}`, {
        ...init,
        headers: {
            Accept: 'application/json',
            ...(init.body ? { 'Content-Type': 'application/json' } : {}),
            Authorization: `Bearer ${accessToken}`,
            ...init.headers,
        },
    });
    if (!response.ok) {
        let message = response.status === 401
            ? 'Tu sesión terminó. Inicia sesión nuevamente.'
            : `La operación no pudo completarse (${response.status}).`;
        try {
            const error = await response.json() as { detail?: string; formulario?: string };
            message = error.detail || error.formulario || message;
        } catch { /* La respuesta no contiene JSON. */ }
        throw new Error(message);
    }
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
}

export async function fetchOwnerManagement(): Promise<OwnerManagementData> {
    const [configuration, metrics, parkingResponse] = await Promise.all([
        ownerRequest<OwnerConfiguration>('/owner/configuration/'),
        ownerRequest<OwnerMetrics>('/owner/stays/metrics/today/'),
        ownerRequest<{ results?: OwnerParking[] } | OwnerParking[]>('/parqueaderos/mios/'),
    ]);
    const parkings = Array.isArray(parkingResponse) ? parkingResponse : parkingResponse.results || [];
    if (!parkings[0]) throw new Error('No se encontró un parqueadero asociado a esta cuenta.');
    return { parking: parkings[0], configuration, metrics };
}

export const updateOwnerParking = (id: number, payload: { nombre: string; descripcion: string }) =>
    ownerRequest<OwnerParking>(`/parqueaderos/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) });

export const updateOperationalStatus = (estado: string) =>
    ownerRequest<OwnerConfiguration>('/owner/operational-status/', { method: 'PATCH', body: JSON.stringify({ estado }) });

export const saveOwnerConfiguration = (payload: { horarios: OwnerSchedule[]; tarifas: Array<Omit<OwnerRate, 'id'>>; cantidad_espacios: number }) =>
    ownerRequest<OwnerConfiguration>('/owner/configuration/', { method: 'PUT', body: JSON.stringify(payload) });

export const addOwnerSpaces = (cantidad: number) =>
    ownerRequest<OwnerConfiguration>('/owner/spaces/bulk/', { method: 'POST', body: JSON.stringify({ cantidad }) });

export const editOwnerSpace = (id: number, payload: Partial<Pick<OwnerSpace, 'nombre' | 'estado' | 'tarifa_predeterminada'>>) =>
    ownerRequest<OwnerSpace>(`/owner/spaces/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) });

export const deleteOwnerSpace = (id: number) =>
    ownerRequest<void>(`/owner/spaces/${id}/`, { method: 'DELETE' });

export const reactivateOwnerSpace = (id: number) =>
    ownerRequest<OwnerSpace>(`/owner/spaces/${id}/reactivate/`, { method: 'POST' });

export const startOwnerStay = (spaceId: number, rateId: number) =>
    ownerRequest<OwnerStay>(`/owner/spaces/${spaceId}/stays/start/`, { method: 'POST', body: JSON.stringify({ tarifa_id: rateId }) });

export const getOwnerStay = (spaceId: number) =>
    ownerRequest<OwnerStay>(`/owner/spaces/${spaceId}/stays/current/`);

export const finishOwnerStay = (spaceId: number) =>
    ownerRequest<OwnerStay>(`/owner/spaces/${spaceId}/stays/finish/`, { method: 'POST' });
