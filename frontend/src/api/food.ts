import { api } from './client';

export interface Location {
  type: 'Point';
  coordinates: [number, number];
}

export interface FoodStop {
  id: string;
  name: string;
  type: string;
  image: string;
  location: Location;
  area: string;
  district: string;
}

interface ApiResponse<T> {
  data: T;
}

export const foodApi = {
  listFoodStops: async (): Promise<FoodStop[]> => {
    const res = await api.get<ApiResponse<FoodStop[]>>('/food/');
    return res.data.data;
  },
};
