import { z } from 'zod';

export const manualTransactionSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  type: z.enum(['INPUT', 'OUTPUT']),
  value: z.number().int().min(1, 'Valor deve ser maior que 0'),
  payment_method: z.string().optional(),
});

export const calculateTaxSchema = z.object({
  amount: z.number().int().min(1, 'Valor deve ser maior que 0'),
  installments: z.number().int().min(1, 'Deve ter pelo menos 1 parcela').max(12, 'Máximo de 12 parcelas'),
});

export type ManualTransactionInput = z.infer<typeof manualTransactionSchema>;
export type CalculateTaxInput = z.infer<typeof calculateTaxSchema>;
