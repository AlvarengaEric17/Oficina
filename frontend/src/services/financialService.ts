import apiClient from './api';
import type { CashFlow, TaxCalculation, Transaction } from '../types';

export const financialService = {
  async createManualTransaction(data: {
    description: string;
    type: 'INPUT' | 'OUTPUT';
    value: number;
    payment_method?: string;
  }): Promise<Transaction> {
    const { data: response } = await apiClient.post<Transaction>(
      '/financial/transaction',
      data
    );
    return response;
  },

  async getCashFlow(): Promise<CashFlow> {
    const { data } = await apiClient.get<CashFlow>('/financial/cashflow');
    return data;
  },

  async calculateTax(amount: number, installments: number): Promise<TaxCalculation> {
    const { data } = await apiClient.post<TaxCalculation>('/financial/calculate-tax', {
      amount,
      installments,
    });
    return data;
  },
};
