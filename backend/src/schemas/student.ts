// backend/src/schemas/student.ts
import { z } from 'zod';

export const studentRegisterSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  departmentId: z.number().min(1, 'Department selection is required'),
  classId: z.number().min(1, 'Class selection is required'),
});

export type StudentRegisterInput = z.infer<typeof studentRegisterSchema>;