export interface MobileEnvironment {
    apiBaseUrl: string;
    mapTileUrl?: string;
    mapAttribution: string;
}

const PRIVATE_OR_LOCAL_HOST = /^(localhost|0\.0\.0\.0|127\.|10\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$)|\.local$/i;

function parseHttpsUrl(value: string, variableName: string): string {
    let url: URL;
    try {
        url = new URL(value);
    } catch {
        throw new Error(`${variableName} debe ser una URL válida.`);
    }
    if (url.protocol !== 'https:') {
        throw new Error(`${variableName} debe usar HTTPS.`);
    }
    if (PRIVATE_OR_LOCAL_HOST.test(url.hostname) || url.hostname.toLowerCase().endsWith('.local')) {
        throw new Error(`${variableName} no puede apuntar a localhost ni a una IP privada.`);
    }
    return value.replace(/\/+$/, '');
}

export function getMobileEnvironment(): MobileEnvironment {
    const apiValue = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
    if (!apiValue) {
        throw new Error('Falta EXPO_PUBLIC_API_BASE_URL para conectar con Django.');
    }

    const tileValue = process.env.EXPO_PUBLIC_MAP_TILE_URL?.trim();
    if (tileValue && (!tileValue.includes('{x}') || !tileValue.includes('{y}'))) {
        throw new Error('EXPO_PUBLIC_MAP_TILE_URL debe incluir las variables {x} y {y}.');
    }
    const attributionValue = process.env.EXPO_PUBLIC_MAP_ATTRIBUTION?.trim();
    if (tileValue && !attributionValue) {
        throw new Error('EXPO_PUBLIC_MAP_ATTRIBUTION es obligatoria al configurar tiles.');
    }

    return {
        apiBaseUrl: parseHttpsUrl(apiValue, 'EXPO_PUBLIC_API_BASE_URL'),
        mapTileUrl: tileValue ? parseHttpsUrl(tileValue, 'EXPO_PUBLIC_MAP_TILE_URL') : undefined,
        mapAttribution: attributionValue || 'Proveedor de mapa nativo',
    };
}
