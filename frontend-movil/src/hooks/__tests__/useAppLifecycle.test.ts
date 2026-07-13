import { isPollingEnabled } from '../useAppLifecycle';
import { describe, expect, it } from '@jest/globals';
import { LOJA_BBOX, regionToLojaBbox } from '../usePublicParkings';

describe('isPollingEnabled', () => {
    it('solo habilita polling con app y pantalla activas', () => {
        expect(isPollingEnabled('active', true)).toBe(true);
        expect(isPollingEnabled('active', false)).toBe(false);
        expect(isPollingEnabled('background', true)).toBe(false);
        expect(isPollingEnabled('inactive', true)).toBe(false);
    });
});

describe('regionToLojaBbox', () => {
    it('limita el viewport a Loja y nunca produce un bbox invertido', () => {
        expect(regionToLojaBbox({
            latitude: -3.99,
            longitude: -79.2,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
        })).toEqual({ minLng: -79.22, minLat: -4.01, maxLng: -79.18, maxLat: -3.97 });

        expect(regionToLojaBbox({
            latitude: 0,
            longitude: 0,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        })).toEqual(LOJA_BBOX);
    });
});
