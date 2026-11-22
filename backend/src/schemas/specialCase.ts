import { z } from 'zod';

export const specialCaseCreateSchema = z.object({
  type: z.enum(['RETAKE', 'SPECIAL', 'REASSESSMENT']),
  courseId: z.number().min(1, 'Course selection is required'),
  description: z.string().min(1, 'Description is required'),
  evidence: z.string().optional(), // URL or file path
});

export type SpecialCaseCreateInput = z.infer<typeof specialCaseCreateSchema>;