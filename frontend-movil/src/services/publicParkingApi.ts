import { getMobileEnvironment } from '../config/environment';
import type {
    ParkingBbox,
    PublicParkingDetail,
    PublicParkingList,
    PublicParkingStatus,
    PublicParkingSummary,
    PublicRate,
    PublicSchedule,
} from '../types/publicParking';

const VALID_STATUSES: PublicParkingStatus[] = ['OPEN', 'FULL', 'CLOSED'];

function asRecord(value: unknown, context: string): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`Contrato inválido en ${context}.`);
    }
    return value as Record<string, unknown>;
}

function stringField(record: Record<string, unknown>, field: string): string {
    if (typeof record[field] !== 'string') {
        throw new Error(`Contrato inválido: ${field} debe ser texto.`);
    }
    return record[field] as string;
}

function numberField(record: Record<string, unknown>, field: string): number {
    if (typeof record[field] !== 'number' || !Number.isFinite(record[field])) {
        throw new Error(`Contrato inválido: ${field} debe ser numérico.`);
    }
    return record[field] as number;
}

export function adaptPublicParkingSummary(value: unknown): PublicParkingSummary {
    const record = asRecord(value, 'parqueadero');
    const status = stringField(record, 'status') as PublicParkingStatus;
    if (!VALID_STATUSES.includes(status)) {
        throw new Error('Contrato inválido: status no reconocido.');
    }
    return {
        id: numberField(record, 'id'),
        name: stringField(record, 'name'),
        latitude: numberField(record, 'latitude'),
        longitude: numberField(record, 'longitude'),
        address: stringField(record, 'address'),
        total_spaces: numberField(record, 'total_spaces'),
        available_spaces: numberField(record, 'available_spaces'),
        status,
        updated_at: stringField(record, 'updated_at'),
    };
}

function adaptRate(value: unknown): PublicRate {
    const record = asRecord(value, 'tarifa');
    return {
        code: stringField(record, 'code'),
        name: stringField(record, 'name'),
        price_per_hour: stringField(record, 'price_per_hour'),
    };
}

function adaptSchedule(value: unknown): PublicSchedule {
    const record = asRecord(value, 'horario');
    return {
        day: stringField(record, 'day'),
        opens_at: stringField(record, 'opens_at'),
        closes_at: stringField(record, 'closes_at'),
    };
}

export function adaptPublicParkingList(value: unknown): PublicParkingList {
    const record = asRecord(value, 'lista pública');
    if (!Array.isArray(record.results)) {
        throw new Error('Contrato inválido: results debe ser una lista.');
    }
    return {
        updated_at: stringField(record, 'updated_at'),
        results: record.results.map(adaptPublicParkingSummary),
    };
}

export function adaptPublicParkingDetail(value: unknown): PublicParkingDetail {
    const record = asRecord(value, 'detalle público');
    if (!Array.isArray(record.rates) || !Array.isArray(record.schedules)) {
        throw new Error('Contrato inválido: rates y schedules deben ser listas.');
    }
    return {
        ...adaptPublicParkingSummary(record),
        description: stringField(record, 'description'),
        rates: record.rates.map(adaptRate),
        schedules: record.schedules.map(adaptSchedule),
    };
}

async function request(path: string, signal?: AbortSignal): Promise<unknown> {
    const { apiBaseUrl } = getMobileEnvironment();
    const response = await fetch(`${apiBaseUrl}${path}`, {
        headers: { Accept: 'application/json' },
        signal,
    });
    if (!response.ok) {
        throw new Error(`La API respondió ${response.status}.`);
    }
    return response.json();
}

export async function fetchPublicParkings(
    bbox: ParkingBbox,
    signal?: AbortSignal,
): Promise<PublicParkingList> {
    const bboxValue = [bbox.minLng, bbox.minLat, bbox.maxLng, bbox.maxLat].join(',');
    return adaptPublicParkingList(
        await request(`/public/parkings/?bbox=${encodeURIComponent(bboxValue)}`, signal),
    );
}

export async function fetchPublicParkingDetail(
    parkingId: number,
    signal?: AbortSignal,
): Promise<PublicParkingDetail> {
    return adaptPublicParkingDetail(
        await request(`/public/parkings/${parkingId}/`, signal),
    );
}
