// src/services/apiClient.js
//
// Antes: src/services/ solo tenía un .gitkeep. No existía ninguna instancia
// de axios, ningún interceptor y ninguna inyección de la URL base en todo
// el proyecto (axios está en package.json pero nunca se importaba en
// ningún archivo .js/.jsx del repo).
//
// Este cliente centraliza:
//  1. La URL base (config/env.ts).
//  2. El header de autenticación en el formato EXACTO que exige
//     rest_framework_simplejwt por defecto: "Authorization: Bearer <access>"
//     (el proyecto usa SIMPLE_JWT sin override de AUTH_HEADER_TYPES, así
//     que NO es "Token <key>", es "Bearer <key>").
//  3. Refresh automático del access token cuando el backend responde 401,
//     usando POST /api/auth/refresh/ (access dura 15 min, ver config/urls.py).
//  4. Claves de almacenamiento consistentes, usadas por authService.js.

import axios from 'axios';
import { API_BASE_URL } from '../config/env';

export const ACCESS_TOKEN_KEY = 'pp_access_token';
export const REFRESH_TOKEN_KEY = 'pp_refresh_token';

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (access, refresh) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// --- Interceptor de request: adjunta el access token ------------------
apiClient.interceptors.request.use((config) => {
  const access = tokenStorage.getAccess();
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

// --- Interceptor de response: refresca el token una vez si expiró -----
let refreshPromise = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    const isAuthEndpoint =
      original?.url?.includes('/auth/token') ||
      original?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      const refresh = tokenStorage.getRefresh();

      if (!refresh) {
        tokenStorage.clear();
        return Promise.reject(error);
      }

      try {
        // Evita disparar varios refresh en paralelo si varias requests
        // fallan con 401 al mismo tiempo.
        refreshPromise =
          refreshPromise ??
          axios
            .post(`${API_BASE_URL}/auth/refresh/`, { refresh })
            .finally(() => {
              refreshPromise = null;
            });

        const { data } = await refreshPromise;
        tokenStorage.setTokens(data.access, refresh);
        original.headers.Authorization = `Bearer ${data.access}`;
        return apiClient(original);
      } catch (refreshError) {
        tokenStorage.clear();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
