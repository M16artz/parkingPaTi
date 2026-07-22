import * as SecureStore from 'expo-secure-store';
import { getMobileEnvironment } from '../config/environment';

const ACCESS_TOKEN_KEY = 'parkingpati.mobile.access';
const SESSION_KEY = 'parkingpati.mobile.session';

interface TokenResponse {
    access?: string;
    username?: string;
    rol?: string;
    onboarding_estado?: string;
    detail?: string;
}

export interface MobileOwnerSession {
    username: string;
    rol: 'PROPIETARIO';
    onboarding_estado: string;
}

async function readErrorMessage(response: Response): Promise<string> {
    try {
        const body = (await response.json()) as TokenResponse;
        return body.detail || 'El correo o la contraseña no son correctos.';
    } catch {
        return 'No fue posible iniciar sesión. Inténtalo nuevamente.';
    }
}

export async function loginOwner(correo: string, password: string): Promise<MobileOwnerSession> {
    const { apiBaseUrl } = getMobileEnvironment();
    const response = await fetch(`${apiBaseUrl}/auth/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ correo: correo.trim().toLowerCase(), password }),
    });

    if (!response.ok) {
        throw new Error(await readErrorMessage(response));
    }

    const body = (await response.json()) as TokenResponse;
    if (!body.access) {
        throw new Error('El servidor no devolvió un token de acceso válido.');
    }
    if (body.rol !== 'PROPIETARIO') {
        throw new Error('Este acceso móvil está disponible únicamente para propietarios.');
    }

    const session: MobileOwnerSession = {
        username: body.username || correo.trim(),
        rol: 'PROPIETARIO',
        onboarding_estado: body.onboarding_estado || '',
    };

    await Promise.all([
        SecureStore.setItemAsync(ACCESS_TOKEN_KEY, body.access),
        SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session)),
    ]);

    return session;
}

export function getMobileAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function clearMobileSession(): Promise<void> {
    await Promise.all([
        SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.deleteItemAsync(SESSION_KEY),
    ]);
}
