import { api } from './client';
import { storage } from '../utils/storage';

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export const authApi = {
  register: async (name: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    const { access_token, refresh_token } = res.data;
    await storage.setItemAsync('access_token', access_token);
    await storage.setItemAsync('refresh_token', refresh_token);
    return res.data;
  },

  logout: async () => {
    await storage.deleteItemAsync('access_token');
    await storage.deleteItemAsync('refresh_token');
  },

  isAuthenticated: async (): Promise<boolean> => {
    const token = await storage.getItemAsync('access_token');
    return !!token;
  },
};
