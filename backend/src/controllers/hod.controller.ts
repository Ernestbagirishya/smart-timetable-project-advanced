import { Request, Response } from 'express';
import prisma from '../utils/database';
import { hodCreateSchema, userUpdateSchema } from '../schemas/user';
import { hashPassword } from '../utils/auth';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const getAllHods = async (req: Request, res: Response) => {
  try {
    const hods = await prisma.user.findMany({
      where: { role: 'HOD' },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        departmentId: true,
        department: {
          select: { id: true, name: true, code: true }
        },
        createdAt: true,
      },
      orderBy: { fullName: 'asc' }
    });

    res.json(hods);
  } catch (error) {
    console.error('Get HODs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createHod = async (req: Request, res: Response) => {
  try {
    const parsedData = hodCreateSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Invalid input data', errors: parsedData.error.issues });
    }

    const { username, password, fullName, email, departmentId } = parsedData.data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'User with this username or email already exists' });
    }

    // Create HOD
    const hod = await prisma.user.create({
      data: {
        username,
        password: await hashPassword(password),
        fullName,
        email,
        role: 'HOD',
        departmentId,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        departmentId: true,
        department: {
          select: { id: true, name: true, code: true }
        },
        createdAt: true
      }
    });

    // Assign HOD to department
    await prisma.department.update({
      where: { id: departmentId },
      data: { hodId: hod.id }
    });

    res.status(201).json({
      message: 'HOD created successfully',
      hod,
    });
  } catch (error) {
    console.error('Create HOD error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateHod = async (req: Request, res: Response) => {
  try {
    const hodId = parseInt(req.params.id);
    if (isNaN(hodId)) {
      return res.status(400).json({ message: 'Invalid HOD ID' });
    }

    const parsedData = userUpdateSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Invalid input data', errors: parsedData.error });
    }

    const updateData = parsedData.data;

    // Check if HOD exists
    const existingHod = await prisma.user.findUnique({
      where: { id: hodId },
      select: { id: true, role: true }
    });

    if (!existingHod) {
      return res.status(404).json({ message: 'HOD not found' });
    }

    if (existingHod.role !== 'HOD') {
      return res.status(400).json({ message: 'User is not an HOD' });
    }

    // If updating username or email, check for conflicts
    if (updateData.username || updateData.email) {
      const conflictCheck = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: hodId } },
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

    // Update HOD
    const updatedHod = await prisma.user.update({
      where: { id: hodId },
      data: updateData,
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        departmentId: true,
        department: {
          select: { id: true, name: true, code: true }
        },
        createdAt: true
      }
    });

    res.json({
      message: 'HOD updated successfully',
      hod: updatedHod,
    });
  } catch (error) {
    console.error('Update HOD error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteHod = async (req: Request, res: Response) => {
  try {
    const hodId = parseInt(req.params.id);
    if (isNaN(hodId)) {
      return res.status(400).json({ message: 'Invalid HOD ID' });
    }

    // Check if HOD exists
    const existingHod = await prisma.user.findUnique({
      where: { id: hodId },
      select: { id: true, role: true, departmentId: true }
    });

    if (!existingHod) {
      return res.status(404).json({ message: 'HOD not found' });
    }

    if (existingHod.role !== 'HOD') {
      return res.status(400).json({ message: 'User is not an HOD' });
    }

    // Remove HOD from department
    if (existingHod.departmentId) {
      await prisma.department.update({
        where: { id: existingHod.departmentId },
        data: { hodId: null }
      });
    }

    await prisma.user.delete({
      where: { id: hodId },
    });

    res.json({ message: 'HOD deleted successfully' });
  } catch (error) {
    console.error('Delete HOD error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getHodDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get the HOD user with departmentId
    const hodUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { departmentId: true }
    });

    if (!hodUser || !hodUser.departmentId) {
      return res.status(404).json({ message: 'HOD or department not found' });
    }

    const departmentId = hodUser.departmentId;

    // Fetch counts filtered by departmentId
    const [
      studentsCount,
      lecturersCount,
      coursesCount,
      classesCount
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT', departmentId } }),
      prisma.user.count({ where: { role: 'LECTURER', departmentId } }),
      prisma.course.count({ where: { departmentId } }),
      prisma.class.count({ where: { departmentId } })
    ]);

    const dashboardData = {
      totalStudents: studentsCount,
      totalLecturers: lecturersCount,
      totalCourses: coursesCount,
      totalClasses: classesCount
    };

    res.json({
      success: true,
      data: dashboardData,
      message: 'HOD dashboard data fetched successfully'
    });
  } catch (error) {
    console.error('HOD Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching HOD dashboard data',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
