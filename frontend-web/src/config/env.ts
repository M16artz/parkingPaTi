export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const MAP_TILE_URL: string =
  import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export const MAP_ATTRIBUTION: string =
  import.meta.env.VITE_MAP_ATTRIBUTION || '&copy; OpenStreetMap contributors';
