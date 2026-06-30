import apiClient from './api';
import type { Budget, BudgetStatus } from '../types';

export const budgetService = {
  async createBudget(data: {
    vehicle_plate: string;
    vehicle_model: string;
    client_name: string;
    client_phone: string;
  }): Promise<Budget> {
    const { data: response } = await apiClient.post<Budget>('/budget', data);
    return response;
  },

  async addItemToBudget(data: {
    budget_id: string;
    part_id?: string;
    labor_name?: string;
    cost: number;
    price: number;
    quantity: number;
  }): Promise<any> {
    const { data: response } = await apiClient.post('/budget/item', data);
    return response;
  },

  async getBudgetPublic(id: string): Promise<Budget> {
    const { data } = await apiClient.get<Budget>(`/budget/share/${id}`);
    return data;
  },

  async approveBudget(id: string): Promise<Budget> {
    const { data } = await apiClient.patch<Budget>(`/budget/approve/${id}`);
    return data;
  },

  async updateBudgetStatus(id: string, status: BudgetStatus): Promise<Budget> {
    const { data } = await apiClient.patch<Budget>(`/budget/status/${id}`, {
      status,
    });
    return data;
  },

  async getVehicleHistory(filters?: {
    vehicle_plate?: string;
    mechanic_id?: string;
  }): Promise<Budget[]> {
    const params = new URLSearchParams();
    if (filters?.vehicle_plate) params.append('vehicle_plate', filters.vehicle_plate);
    if (filters?.mechanic_id) params.append('mechanic_id', filters.mechanic_id);

    const { data } = await apiClient.get<Budget[]>(`/vehicles/history?${params.toString()}`);
    return data;
  },
};
