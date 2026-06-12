import axios from 'axios';
import { API_BASE_PATH } from '@/lib/api-config';

export const api = axios.create({
  baseURL: API_BASE_PATH,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('mika_access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('mika_refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(`${API_BASE_PATH}/auth/refresh`, { refreshToken });
        localStorage.setItem('mika_access_token', data.accessToken);
        localStorage.setItem('mika_refresh_token', data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('mika_access_token');
        localStorage.removeItem('mika_refresh_token');
        window.location.href = '/login';
      }
    }
    if (!error.response && error.code === 'ECONNABORTED') {
      error.message = 'A requisição demorou demais. Verifique sua conexão e tente novamente.';
    } else if (!error.response) {
      error.message = 'Não foi possível conectar ao servidor. Tente novamente.';
    }
    return Promise.reject(error);
  },
);
