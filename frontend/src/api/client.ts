import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from '../utils/storage';

export const BASE_URL = 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await storage.getItemAsync('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = await storage.getItemAsync('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        const res = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        const { access_token, refresh_token } = res.data;
        await storage.setItemAsync('access_token', access_token);
        await storage.setItemAsync('refresh_token', refresh_token);
        original.headers.Authorization = `Bearer ${access_token}`;
        return api(original);
      } catch {
        await storage.deleteItemAsync('access_token');
        await storage.deleteItemAsync('refresh_token');
      }
    }
    return Promise.reject(error);
  }
);
