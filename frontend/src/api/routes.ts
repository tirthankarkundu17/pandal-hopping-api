import { api } from './client';
import { Pandal } from './pandals';

export interface Route {
  id: string;
  title: string;
  description: string;
  duration: string;
  stops: string[]; // object ids
  stopCount: number;
  createdAt: string;
}

export interface RouteWithStops extends Omit<Route, 'stops'> {
  stops: Pandal[];
}

interface ApiResponse<T> {
  data: T;
}

export const routesApi = {
  listRoutes: async (): Promise<Route[]> => {
    const res = await api.get<ApiResponse<Route[]>>('/routes/');
    return res.data.data;
  },
};
