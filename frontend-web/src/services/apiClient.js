import axios from 'axios';
import { API_BASE_URL } from '../config/env';

let accessToken = null;

export const tokenStorage = {
  getAccess: () => accessToken,
  setAccess: (token) => {
    accessToken = token;
  },
  clear: () => {
    accessToken = null;
  },
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const access = tokenStorage.getAccess();
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

let refreshPromise = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthEndpoint = [
      '/auth/token/',
      '/auth/token/refresh/',
      '/auth/register/',
      '/auth/verify-email/',
    ].some((path) => original?.url?.includes(path));

    if (error.response?.status === 401 && !original?._retry && !isAuthEndpoint) {
      original._retry = true;
      try {
        refreshPromise = refreshPromise ?? apiClient.post('/auth/token/refresh/').finally(() => {
          refreshPromise = null;
        });
        const { data } = await refreshPromise;
        tokenStorage.setAccess(data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return apiClient(original);
      } catch (refreshError) {
        tokenStorage.clear();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
