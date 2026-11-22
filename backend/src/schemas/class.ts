// backend/src/schemas/class.ts
import { z } from 'zod';

export const classCreateSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  year: z.number().min(1, 'Year must be at least 1'),
});

export type ClassCreateInput = z.infer<typeof classCreateSchema>;