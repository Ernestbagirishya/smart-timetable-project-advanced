import { Request, Response } from 'express';
import prisma from '../utils/database';

export const getPublicDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
        code: true
      },
      orderBy: { name: 'asc' }
    });
    res.json(departments);
  } catch (error) {
    console.error('Get public departments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getClassesByDepartment = async (req: Request, res: Response) => {
  try {
    const departmentId = parseInt(req.params.departmentId);
    if (isNaN(departmentId)) {
      return res.status(400).json({ message: 'Invalid department ID' });
    }

    const classes = await prisma.class.findMany({
      where: { departmentId },
      orderBy: [{ year: 'asc' }, { name: 'asc' }]
    });

    res.json(classes);
  } catch (error) {
    console.error('Get classes by department error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
