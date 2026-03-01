import { api } from './client';

export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Pandal {
  id: string;
  name: string;
  description: string;
  area: string;
  district: string;
  state: string;
  country: string;
  theme: string;
  tags: string[];
  location: Location;
  images: string[];
  ratingAvg: number;
  ratingCount: number;
  status: 'pending' | 'approved' | 'rejected';
  approvalCount: number;
  approvedBy: string[];
  createdBy: string;
  createdAt: string;
}

export interface District {
  id: string;
  name: string;
  pandalCount: number;
  image?: string;
}

export interface CreatePandalInput {
  name: string;
  area: string;
  district: string;
  state: string;
  country: string;
  description?: string;
  theme?: string;
  tags?: string[];
  location: Location;
  images?: string[];
}

interface ApiResponse<T> {
  data: T;
}

export const pandalApi = {
  listApproved: async (params?: { lng?: number; lat?: number; radius?: number }): Promise<Pandal[]> => {
    let url = '/pandals/';
    if (params && params.lng !== undefined && params.lat !== undefined && params.radius !== undefined) {
      url += `?lng=${params.lng}&lat=${params.lat}&radius=${params.radius}`;
    }
    const res = await api.get<ApiResponse<Pandal[]>>(url);
    return res.data.data;
  },

  listPending: async (): Promise<Pandal[]> => {
    const res = await api.get<ApiResponse<Pandal[]>>('/pandals/pending');
    return res.data.data;
  },

  createPandal: async (data: CreatePandalInput): Promise<Pandal> => {
    const res = await api.post<ApiResponse<Pandal>>('/pandals/', data);
    return res.data.data;
  },

  listDistricts: async (): Promise<District[]> => {
    const res = await api.get<ApiResponse<District[]>>('/pandals/districts');
    return res.data.data;
  },

  approvePandal: async (id: string): Promise<Pandal> => {
    const res = await api.put<ApiResponse<Pandal>>(`/pandals/${id}/approve`);
    return res.data.data;
  },
};
