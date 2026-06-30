import { z } from 'zod';

export const createBudgetSchema = z.object({
  vehicle_plate: z.string().min(1, 'Placa do veículo é obrigatória'),
  vehicle_model: z.string().min(1, 'Modelo do veículo é obrigatório'),
  client_name: z.string().min(1, 'Nome do cliente é obrigatório'),
  client_phone: z.string().min(1, 'Telefone do cliente é obrigatório'),
});

export const addItemBudgetSchema = z.object({
  budget_id: z.string().uuid('ID do orçamento inválido'),
  part_id: z.string().uuid('ID da peça inválido').optional(),
  labor_name: z.string().min(1, 'Nome da mão de obra é obrigatório').optional(),
  cost: z.number().int().min(0, 'Custo deve ser maior ou igual a 0'),
  price: z.number().int().min(0, 'Preço deve ser maior ou igual a 0'),
  quantity: z.number().int().min(1, 'Quantidade deve ser maior que 0'),
});

export const updateStatusSchema = z.object({
  status: z.enum(['DRAFT', 'WAITING_APPROVAL', 'APPROVED', 'IN_PROGRESS', 'TESTING', 'READY', 'DELIVERED', 'REJECTED']),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type AddItemBudgetInput = z.infer<typeof addItemBudgetSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
