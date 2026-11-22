// backend/src/controllers/lecturer.controller.ts
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import prisma from '../utils/database';
import { lecturerCreateSchema } from '../schemas/user';
import { hashPassword } from '../utils/auth';

export const getDepartmentLecturers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const departmentId = req.user.departmentId!;

    const lecturers = await prisma.user.findMany({
      where: { 
        role: 'LECTURER',
        departmentId 
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        createdAt: true,
        taughtCourses: {
          include: {
            course: { select: { courseCode: true, courseName: true } },
            class: { select: { name: true } }
          }
        }
      },
      orderBy: { fullName: 'asc' }
    });

    res.json(lecturers);
  } catch (error) {
    console.error('Get lecturers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createLecturer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const departmentId = req.user.departmentId!;
    const parsedData = lecturerCreateSchema.safeParse(req.body);

    if (!parsedData.success) {
      return res.status(400).json({ message: 'Invalid input data', errors: parsedData.error.issues });
    }

    const { username, password, fullName, email } = parsedData.data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'User with this username or email already exists' });
    }

    // Create lecturer in HOD's department
    const lecturer = await prisma.user.create({
      data: {
        username,
        password: await hashPassword(password), // Hash the password
        fullName,
        email,
        role: 'LECTURER',
        departmentId,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'Lecturer created successfully',
      lecturer,
    });
  } catch (error) {
    console.error('Create lecturer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateLecturer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lecturerId = parseInt(req.params.lecturerId);
    const departmentId = req.user.departmentId!;

    if (isNaN(lecturerId)) {
      return res.status(400).json({ message: 'Invalid lecturer ID' });
    }

    const parsedData = lecturerCreateSchema.partial().safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Invalid input data', errors: parsedData.error.issues });
    }

    const updateData = parsedData.data;

    // Check if lecturer exists and belongs to HOD's department
    const existingLecturer = await prisma.user.findUnique({
      where: { id: lecturerId },
      select: { id: true, role: true, departmentId: true }
    });

    if (!existingLecturer) {
      return res.status(404).json({ message: 'Lecturer not found' });
    }

    if (existingLecturer.role !== 'LECTURER') {
      return res.status(400).json({ message: 'User is not a lecturer' });
    }

    if (existingLecturer.departmentId !== departmentId) {
      return res.status(403).json({ message: 'Access denied: Lecturer belongs to different department' });
    }

    // If updating username or email, check for conflicts
    if (updateData.username || updateData.email) {
      const conflictCheck = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: lecturerId } },
            {
              OR: [
                updateData.username ? { username: updateData.username } : {},
                updateData.email ? { email: updateData.email } : {},
              ].filter(obj => Object.keys(obj).length > 0)
            }
          ]
        }
      });

      if (conflictCheck) {
        return res.status(409).json({ message: 'Username or email already exists' });
      }
    }

    // Hash password if provided
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    // Update lecturer
    const updatedLecturer = await prisma.user.update({
      where: { id: lecturerId },
      data: updateData,
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.json({
      message: 'Lecturer updated successfully',
      lecturer: updatedLecturer,
    });
  } catch (error) {
    console.error('Update lecturer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteLecturer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lecturerId = parseInt(req.params.lecturerId);
    const departmentId = req.user.departmentId!;

    if (isNaN(lecturerId)) {
      return res.status(400).json({ message: 'Invalid lecturer ID' });
    }

    // Check if lecturer exists and belongs to HOD's department
    const existingLecturer = await prisma.user.findUnique({
      where: { id: lecturerId },
      select: { id: true, role: true, departmentId: true }
    });

    if (!existingLecturer) {
      return res.status(404).json({ message: 'Lecturer not found' });
    }

    if (existingLecturer.role !== 'LECTURER') {
      return res.status(400).json({ message: 'User is not a lecturer' });
    }

    if (existingLecturer.departmentId !== departmentId) {
      return res.status(403).json({ message: 'Access denied: Lecturer belongs to different department' });
    }

    // Check if lecturer has any course assignments
    const assignmentCount = await prisma.courseAssignment.count({
      where: { lecturerId },
    });

    if (assignmentCount > 0) {
      return res.status(400).json({ message: 'You cannot delete this lecturer because they are assigned to courses' });
    }

    // Check if lecturer has any sessions
    const sessionCount = await prisma.session.count({
      where: { lecturerId },
    });

    if (sessionCount > 0) {
      return res.status(400).json({ message: 'You cannot delete this lecturer because they have scheduled sessions' });
    }

    // Check if lecturer has any CAT plans
    const catPlanCount = await prisma.cATPlan.count({
      where: { lecturerId },
    });

    if (catPlanCount > 0) {
      return res.status(400).json({ message: 'You cannot delete this lecturer because they have associated CAT plans' });
    }

    await prisma.user.delete({
      where: { id: lecturerId },
    });

    res.json({ message: 'Lecturer deleted successfully' });
  } catch (error: any) {
    console.error('Delete lecturer error:', error);
    if (error?.code === 'P2003') {
      return res.status(400).json({ 
        message: 'Cannot delete lecturer: They have associated data in the system (CAT plans or other dependencies)'
      });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAvailableLecturers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const departmentId = req.user.departmentId!;

    const lecturers = await prisma.user.findMany({
      where: { 
        role: 'LECTURER',
        departmentId 
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        _count: {
          select: { taughtCourses: true }
        }
      },
      orderBy: { fullName: 'asc' }
    });

    res.json(lecturers);
  } catch (error) {
    console.error('Get available lecturers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};