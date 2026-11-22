// backend/src/schemas/round.ts
import { z } from 'zod';

export const roundCreateSchema = z.object({
  name: z.string().min(1, 'Round name is required'),
  startDate: z.string().datetime('Invalid date format'),
  endDate: z.string().datetime('Invalid date format'),
});

export type RoundCreateInput = z.infer<typeof roundCreateSchema>;