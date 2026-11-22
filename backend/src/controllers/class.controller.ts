// backend/src/controllers/class.controller.ts
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { checkDepartmentAccess } from '../middleware/department.middleware';
import prisma from '../utils/database';
import { classCreateSchema } from '../schemas/class';

export const getAllClasses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const classes = await prisma.class.findMany({
      include: {
        _count: {
          select: { students: true, courses: true }
        },
        courses: {
          include: {
            assignments: {
              include: {
                lecturer: { select: { fullName: true } }
              }
            }
          }
        },
        department: { select: { name: true } }
      },
      orderBy: [{ year: 'asc' }, { name: 'asc' }]
    });

    res.json(classes);
  } catch (error) {
    console.error('Get all classes error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDepartmentClasses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const departmentId = req.user.departmentId!;

    const classes = await prisma.class.findMany({
      where: { departmentId },
      include: {
        _count: {
          select: { students: true, courses: true }
        },
        courses: {
          include: {
            assignments: {
              include: {
                lecturer: { select: { fullName: true } }
              }
            }
          }
        }
      },
      orderBy: [{ year: 'asc' }, { name: 'asc' }]
    });

    res.json(classes);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createClass = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const departmentId = req.user.departmentId!;
    const parsedData = classCreateSchema.safeParse(req.body);
    
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Invalid input data', errors: parsedData.error });
    }

    const { name, year } = parsedData.data;

    // Check if class already exists in department
    const existingClass = await prisma.class.findFirst({
      where: { name, departmentId },
    });

    if (existingClass) {
      return res.status(409).json({ message: 'Class with this name already exists in your department' });
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        year,
        departmentId,
      },
      include: {
        department: true
      }
    });

    res.status(201).json({
      message: 'Class created successfully',
      class: newClass,
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateClass = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const classId = parseInt(req.params.id);
    const departmentId = req.user.departmentId!;

    if (isNaN(classId)) {
      return res.status(400).json({ message: 'Invalid class ID' });
    }

    // Check if class exists and belongs to HOD's department
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!existingClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    checkDepartmentAccess(existingClass.departmentId, departmentId);

    const parsedData = classCreateSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Invalid input data', errors: parsedData.error });
    }

    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: parsedData.data,
    });

    res.json({
      message: 'Class updated successfully',
      class: updatedClass,
    });
  } catch (error: any) {
    console.error('Update class error:', error);
    if (error.message.includes('Access denied')) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteClass = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const classId = parseInt(req.params.id);
    const departmentId = req.user.departmentId!;

    if (isNaN(classId)) {
      return res.status(400).json({ message: 'Invalid class ID' });
    }

    // Check if class exists and belongs to HOD's department
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!existingClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    checkDepartmentAccess(existingClass.departmentId, departmentId);

    // Check if class has any course assignments
    const assignmentCount = await prisma.courseAssignment.count({
      where: { classId },
    });

    if (assignmentCount > 0) {
      return res.status(400).json({ message: 'You cannot delete this class because it is assigned to courses' });
    }

    await prisma.class.delete({
      where: { id: classId },
    });

    res.json({ message: 'Class deleted successfully' });
  } catch (error: any) {
    console.error('Delete class error:', error);
    if (error.message.includes('Access denied')) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
