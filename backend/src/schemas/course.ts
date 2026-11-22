// backend/src/schemas/course.ts
import { z } from 'zod';

// Schema for creating a course
export const courseCreateSchema = z.object({
  courseCode: z.string().min(1, 'Course code is required'),
  courseName: z.string().min(1, 'Course name is required'),
  credits: z.number().min(1, 'Credits must be at least 1'),
  type: z.enum(['CORE', 'GENERAL']),
  classIds: z.array(z.number()).optional(), // For assigning to classes on creation
});

// Schema for updating a course
export const courseUpdateSchema = courseCreateSchema.partial();

// TypeScript types
export type CourseCreateInput = z.infer<typeof courseCreateSchema>;
export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;