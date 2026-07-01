import apiClient from './api';
import type { User, AuthResponse } from '../types';

export const authService = {
  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role?: 'MECHANIC' | 'ADMIN' | 'SUPER_ADMIN';
    company_id?: string;
  }): Promise<User> {
    const { data: response } = await apiClient.post<User>('/users', data);
    return response;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/session', { email, password });
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async getMe(): Promise<User> {
    const { data } = await apiClient.get<User>('/me');
    return data;
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  getStoredUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },
};
