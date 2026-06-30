import apiClient from './api';
import type { Schedule } from '../types';

export const scheduleService = {
  async createSlot(data: {
    mechanic_id: string;
    start_time: string;
    end_time: string;
  }): Promise<Schedule> {
    const { data: response } = await apiClient.post<Schedule>('/schedule/slots', data);
    return response;
  },

  async getPublicSchedule(): Promise<Schedule[]> {
    const { data } = await apiClient.get<Schedule[]>('/schedule/public');
    return data;
  },

  async getMechanicSchedule(): Promise<Schedule[]> {
    const { data } = await apiClient.get<Schedule[]>('/schedule/mechanic');
    return data;
  },

  async updateSlotAvailability(id: string, is_available: boolean): Promise<Schedule> {
    const { data } = await apiClient.patch<Schedule>(`/schedule/slots/${id}`, {
      is_available,
    });
    return data;
  },
};
