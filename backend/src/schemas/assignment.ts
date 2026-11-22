// backend/src/schemas/assignment.ts
import { z } from 'zod';

export const assignmentCreateSchema = z.object({
  courseId: z.number().min(1, 'Course ID is required'),
  lecturerId: z.number().min(1, 'Lecturer ID is required'),
  classId: z.number().min(1, 'Class ID is required'),
});

export type AssignmentCreateInput = z.infer<typeof assignmentCreateSchema>;