// backend/src/schemas/timeslot.ts
import { z } from 'zod';

export const timeSlotCreateSchema = z.object({
  name: z.string().min(1, 'Time slot name is required'),
  startTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, 'Time must be in HH:MM:SS format'),
  endTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, 'Time must be in HH:MM:SS format'),
});

export type TimeSlotCreateInput = z.infer<typeof timeSlotCreateSchema>;