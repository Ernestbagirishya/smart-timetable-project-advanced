// backend/src/schemas/user.ts
import { z } from 'zod';

// Schema for user registration/login
export const authSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Schema for creating a user (extends authSchema)
export const userCreateSchema = authSchema.extend({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['TIMETABLE_MANAGER', 'HOD', 'LECTURER', 'STUDENT']),
  departmentId: z.number().optional(),
  classId: z.number().optional(),
});

// Schema for updating a user (all fields optional)
export const userUpdateSchema = userCreateSchema.partial();

// TypeScript types inferred from the schemas
export type AuthInput = z.infer<typeof authSchema>;
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;



// Schema for creating a lecturer (automatically sets role to LECTURER)
export const lecturerCreateSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
});

export type LecturerCreateInput = z.infer<typeof lecturerCreateSchema>;

// Schema for creating a HOD (automatically sets role to HOD)
export const hodCreateSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  departmentId: z.number(),
});

export type HodCreateInput = z.infer<typeof hodCreateSchema>;
