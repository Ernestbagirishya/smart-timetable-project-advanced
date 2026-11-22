// backend/src/controllers/department.controller.ts
import { Request, Response } from 'express';
import prisma from '../utils/database';
import { departmentCreateSchema, departmentUpdateSchema, assignHodSchema } from '../schemas/department';

export const getAllDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        hod: { // Include the HOD's details
          select: { id: true, fullName: true, email: true }
        },
        _count: { // Include counts of related entities
          select: { students: true, lecturers: true, classes: true, courses: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    // 1. Validate input data
    const parsedData = departmentCreateSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Invalid input data', errors: parsedData.error });
    }

    const { name, code, departmentType } = parsedData.data;

    // 2. Check if department already exists
    const existingDept = await prisma.department.findFirst({
      where: { OR: [{ name }, { code }] },
    });

    if (existingDept) {
      return res.status(409).json({ message: 'Department with this name or code already exists' });
    }

    // 3. Create the department
    const department = await prisma.department.create({
      data: { name, code, departmentType },
    });

    res.status(201).json({
      message: 'Department created successfully',
      department,
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const departmentId = parseInt(req.params.id);
    if (isNaN(departmentId)) {
      return res.status(400).json({ message: 'Invalid department ID' });
    }

    // 1. Validate input data
    const parsedData = departmentUpdateSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Invalid input data', errors: parsedData.error });
    }

    // 2. Check if department exists
    const existingDept = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!existingDept) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // 3. Update the department
    const department = await prisma.department.update({
      where: { id: departmentId },
      data: parsedData.data,
    });

    res.json({
      message: 'Department updated successfully',
      department,
    });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const departmentId = parseInt(req.params.id);
    if (isNaN(departmentId)) {
      return res.status(400).json({ message: 'Invalid department ID' });
    }

    // Check if department exists and get all its dependencies
    const existingDept = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        _count: {
          select: {
            classes: true,
            courses: true,
            lecturers: true,
            students: true
          }
        },
        hod: true
      }
    });

    if (!existingDept) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check for dependencies
    const dependencyErrors = [];

    if (existingDept._count.classes > 0) {
      dependencyErrors.push(`${existingDept._count.classes} classes`);
    }
    if (existingDept._count.courses > 0) {
      dependencyErrors.push(`${existingDept._count.courses} courses`);
    }
    if (existingDept._count.lecturers > 0) {
      dependencyErrors.push(`${existingDept._count.lecturers} lecturers`);
    }
    if (existingDept._count.students > 0) {
      dependencyErrors.push(`${existingDept._count.students} students`);
    }
    if (existingDept.hod) {
      dependencyErrors.push('an assigned HOD');
    }

    if (dependencyErrors.length > 0) {
      return res.status(400).json({
        message: `Cannot delete department because it has: ${dependencyErrors.join(', ')}. Please remove these dependencies first.`
      });
    }

    // If no dependencies exist, delete the department
    await prisma.department.delete({
      where: { id: departmentId },
    });

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const assignHod = async (req: Request, res: Response) => {
  try {
    const departmentId = parseInt(req.params.id);
    if (isNaN(departmentId)) {
      return res.status(400).json({ message: 'Invalid department ID' });
    }

    // 1. Validate input data
    const parsedData = assignHodSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Invalid input data', errors: parsedData.error.issues });
    }

    const { hodId } = parsedData.data;

    // 2. Check if department exists
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // 3. Check if user exists and is an HOD
    const user = await prisma.user.findUnique({
      where: { id: hodId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'HOD') {
      return res.status(400).json({ message: 'User must have the HOD role' });
    }

    // 4. Use a transaction to update both department and user atomically
    const [updatedDepartment, updatedUser] = await prisma.$transaction([
      // Update the department with the new HOD
      prisma.department.update({
        where: { id: departmentId },
        data: { hodId },
        include: {
          hod: { select: { id: true, fullName: true, email: true } }
        }
      }),
      // Update the user's departmentId
      prisma.user.update({
        where: { id: hodId },
        data: { departmentId: departmentId }
      })
    ]);

    res.json({
      message: 'HOD assigned successfully',
      department: updatedDepartment,
    });
  } catch (error) {
    console.error('Assign HOD error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};