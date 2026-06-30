import apiClient from './api';
import type { Part } from '../types';

export const partService = {
  async createPart(data: {
    name: string;
    sku: string;
    cost_price: number;
    sale_price: number;
    quantity: number;
    min_quantity: number;
  }): Promise<Part> {
    const { data: response } = await apiClient.post<Part>('/part', data);
    return response;
  },

  async listParts(): Promise<Part[]> {
    const { data } = await apiClient.get<Part[]>('/parts');
    return data;
  },

  async updatePart(
    id: string,
    data: Partial<{
      name: string;
      sku: string;
      cost_price: number;
      sale_price: number;
      quantity: number;
      min_quantity: number;
    }>
  ): Promise<Part> {
    const { data: response } = await apiClient.put<Part>(`/part/${id}`, data);
    return response;
  },
};
