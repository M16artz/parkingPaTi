import {
    adaptPublicParkingDetail,
    adaptPublicParkingList,
    fetchPublicParkings,
} from '../publicParkingApi';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { getMobileEnvironment } from '../../config/environment';

const summary = {
    id: 7,
    name: 'Centro Loja',
    latitude: -3.99,
    longitude: -79.2,
    address: 'Bolívar y Rocafuerte',
    total_spaces: 20,
    available_spaces: 4,
    status: 'OPEN',
    updated_at: '2026-07-13T12:00:00Z',
};

describe('public parking adapter', () => {
    beforeEach(() => {
        process.env.EXPO_PUBLIC_API_BASE_URL = 'https://staging.example.com/api/v1';
        delete process.env.EXPO_PUBLIC_MAP_TILE_URL;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('adapta la lista y el detalle definidos por OpenAPI', () => {
        expect(adaptPublicParkingList({ updated_at: summary.updated_at, results: [summary] }).results[0]).toEqual(summary);
        expect(adaptPublicParkingDetail({
            ...summary,
            description: 'Cubierto',
            rates: [{ code: 'NORMAL', name: 'Normal', price_per_hour: '1.50' }],
            schedules: [{ day: 'LUNES', opens_at: '08:00:00', closes_at: '18:00:00' }],
        })).toMatchObject({ id: 7, rates: [{ price_per_hour: '1.50' }] });
    });

    it('rechaza estados que no pertenecen al contrato público', () => {
        expect(() => adaptPublicParkingList({
            updated_at: summary.updated_at,
            results: [{ ...summary, status: 'INACTIVE' }],
        })).toThrow('status no reconocido');
    });

    it('construye bbox contra Django y conserva el envelope', async () => {
        const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ updated_at: summary.updated_at, results: [summary] }),
        } as Response);

        const result = await fetchPublicParkings({ minLng: -79.277, minLat: -4.08, maxLng: -79.13, maxLat: -3.895 });

        expect(fetchMock).toHaveBeenCalledWith(
            'https://staging.example.com/api/v1/public/parkings/?bbox=-79.277%2C-4.08%2C-79.13%2C-3.895',
            expect.objectContaining({ headers: { Accept: 'application/json' } }),
        );
        expect(result.results).toHaveLength(1);
    });

    it('rechaza HTTP y hosts locales o privados', () => {
        process.env.EXPO_PUBLIC_API_BASE_URL = 'http://api.example.com/api/v1';
        expect(getMobileEnvironment).toThrow('HTTPS');
        process.env.EXPO_PUBLIC_API_BASE_URL = 'https://192.168.1.20/api/v1';
        expect(getMobileEnvironment).toThrow('IP privada');
        process.env.EXPO_PUBLIC_API_BASE_URL = 'https://localhost/api/v1';
        expect(getMobileEnvironment).toThrow('IP privada');
    });

    it('permite una API HTTP de la red local durante el desarrollo', () => {
        process.env.EXPO_PUBLIC_API_BASE_URL = 'http://192.168.100.26:8000/api/v1';
        expect(getMobileEnvironment().apiBaseUrl).toBe('http://192.168.100.26:8000/api/v1');
    });

    it('exige atribución al configurar tiles personalizados', () => {
        process.env.EXPO_PUBLIC_MAP_TILE_URL = 'https://tiles.example.com/{z}/{x}/{y}.png';
        delete process.env.EXPO_PUBLIC_MAP_ATTRIBUTION;
        expect(getMobileEnvironment).toThrow('ATTRIBUTION');
    });
});
