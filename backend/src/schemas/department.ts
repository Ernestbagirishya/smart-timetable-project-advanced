// backend/src/schemas/department.ts
import { z } from 'zod';

// Schema for creating a department
export const departmentCreateSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  code: z.string().min(1, 'Department code is required'),
  departmentType: z.enum(['PUBLIC', 'PRIVATE']).default('PRIVATE'),
});

// Schema for updating a department (all fields optional)
export const departmentUpdateSchema = departmentCreateSchema.partial();

// Schema for assigning an HOD
export const assignHodSchema = z.object({
  hodId: z.number().min(1, 'HOD user ID is required and must be a positive number'),
});

// TypeScript types inferred from the schemas
export type DepartmentCreateInput = z.infer<typeof departmentCreateSchema>;
export type DepartmentUpdateInput = z.infer<typeof departmentUpdateSchema>;
export type AssignHodInput = z.infer<typeof assignHodSchema>;