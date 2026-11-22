import { z } from 'zod';

export const catCreateSchema = z.object({
  courseId: z.number().min(1, 'Course selection is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  maxMarks: z.number().min(1, 'Maximum marks must be at least 1'),
  dueDate: z.string().datetime('Invalid date format'),
});

export const catUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  maxMarks: z.number().min(1, 'Maximum marks must be at least 1').optional(),
  dueDate: z.string().datetime('Invalid date format').optional(),
});

export type CatCreateInput = z.infer<typeof catCreateSchema>;
export type CatUpdateInput = z.infer<typeof catUpdateSchema>;
