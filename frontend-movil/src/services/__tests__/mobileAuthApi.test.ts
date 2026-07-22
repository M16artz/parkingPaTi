import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as SecureStore from 'expo-secure-store';
import { loginOwner } from '../mobileAuthApi';

jest.mock('expo-secure-store', () => ({
    setItemAsync: jest.fn(() => Promise.resolve()),
}));

describe('mobile owner login', () => {
    beforeEach(() => {
        process.env.EXPO_PUBLIC_API_BASE_URL = 'https://staging.example.com/api/v1';
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('autentica al propietario y guarda el token y la sesión de forma segura', async () => {
        const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({
                access: 'access-token',
                username: 'Propietario',
                rol: 'PROPIETARIO',
                onboarding_estado: 'COMPLETO',
            }),
        } as Response);

        await expect(loginOwner(' Dueño@Example.com ', 'secreto')).resolves.toMatchObject({
            username: 'Propietario',
            rol: 'PROPIETARIO',
        });
        expect(fetchMock).toHaveBeenCalledWith(
            'https://staging.example.com/api/v1/auth/token/',
            expect.objectContaining({ body: JSON.stringify({ correo: 'dueño@example.com', password: 'secreto' }) }),
        );
        expect(SecureStore.setItemAsync).toHaveBeenCalledWith('parkingpati.mobile.access', 'access-token');
    });

    it('rechaza una cuenta que no sea de propietario sin guardar credenciales', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ access: 'access-token', rol: 'ADMIN' }),
        } as Response);

        await expect(loginOwner('admin@example.com', 'secreto')).rejects.toThrow('únicamente para propietarios');
        expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });
});
