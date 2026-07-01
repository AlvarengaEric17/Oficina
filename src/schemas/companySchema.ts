import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Nome da empresa é obrigatório'),
  plan: z.enum(['FREE', 'PRO']).default('FREE'),
  active: z.boolean().default(true),
});

export const updateCompanySchema = z.object({
  name: z.string().min(1, 'Nome da empresa é obrigatório').optional(),
  plan: z.enum(['FREE', 'PRO']).optional(),
  active: z.boolean().optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
