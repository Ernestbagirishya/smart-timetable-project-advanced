import { z } from 'zod';

export const resourceCreateSchema = z.object({
  courseId: z.number().min(1, 'Course selection is required'),
  classId: z.number().min(1, 'Class selection is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  fileUrl: z.string().min(1, 'File URL is required'), // We'll handle file upload separately
  fileType: z.enum(['PDF', 'DOCUMENT', 'SLIDES', 'VIDEO', 'OTHER']),
});

export type ResourceCreateInput = z.infer<typeof resourceCreateSchema>;