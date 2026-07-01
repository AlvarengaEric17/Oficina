import apiClient from './api';

export const companyService = {
  async listCompanies() {
    const { data } = await apiClient.get('/companies');
    return data;
  },

  async createCompany(data: { name: string; plan?: 'FREE' | 'PRO'; active?: boolean }) {
    const { data: response } = await apiClient.post('/companies', data);
    return response;
  },

  async updateCompany(id: string, data: { name?: string; plan?: 'FREE' | 'PRO'; active?: boolean }) {
    const { data: response } = await apiClient.patch(`/companies/${id}`, data);
    return response;
  },
};
