import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  role: z.enum(['MECHANIC', 'ADMIN', 'SUPER_ADMIN']).default('MECHANIC'),
  company_id: z.string().uuid('ID da empresa inválido').optional(),
});

export const updateUserSchema = z.object({
  role: z.enum(['MECHANIC', 'ADMIN', 'SUPER_ADMIN']).optional(),
  company_id: z.string().uuid('ID da empresa inválido').nullable().optional(),
});

export const sessionSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type SessionInput = z.infer<typeof sessionSchema>;
