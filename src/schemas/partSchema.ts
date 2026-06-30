import { z } from 'zod';

export const createPartSchema = z.object({
  name: z.string().min(1, 'Nome da peça é obrigatório'),
  sku: z.string().min(1, 'SKU é obrigatório'),
  cost_price: z.number().int().min(0, 'Preço de custo deve ser maior ou igual a 0'),
  sale_price: z.number().int().min(0, 'Preço de venda deve ser maior ou igual a 0'),
  quantity: z.number().int().min(0, 'Quantidade deve ser maior ou igual a 0'),
  min_quantity: z.number().int().min(0, 'Quantidade mínima deve ser maior ou igual a 0'),
});

export const updatePartSchema = z.object({
  name: z.string().min(1, 'Nome da peça é obrigatório').optional(),
  sku: z.string().min(1, 'SKU é obrigatório').optional(),
  cost_price: z.number().int().min(0, 'Preço de custo deve ser maior ou igual a 0').optional(),
  sale_price: z.number().int().min(0, 'Preço de venda deve ser maior ou igual a 0').optional(),
  quantity: z.number().int().min(0, 'Quantidade deve ser maior ou igual a 0').optional(),
  min_quantity: z.number().int().min(0, 'Quantidade mínima deve ser maior ou igual a 0').optional(),
});

export type CreatePartInput = z.infer<typeof createPartSchema>;
export type UpdatePartInput = z.infer<typeof updatePartSchema>;
