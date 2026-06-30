import { z } from 'zod';

export const createSlotSchema = z.object({
  mechanic_id: z.string().uuid('ID do mecânico inválido'),
  start_time: z.string().datetime('Data/hora de início inválida'),
  end_time: z.string().datetime('Data/hora de término inválida'),
});

export type CreateSlotInput = z.infer<typeof createSlotSchema>;
