// backend/src/middleware/department.middleware.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import prisma from '../utils/database';

// Middleware to check if user is an HOD and has access to the department
export const requireHodDepartment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }
    const userId = req.user.userId;
    
    // Find user with department info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { department: true }
    });

    if (!user || user.role !== 'HOD' || !user.department) {
      return res.status(403).json({ message: 'Access denied. HOD role and department assignment required.' });
    }

    // Attach department ID to request for easier access in controllers
    req.user.departmentId = user.department.id;
    next();
  } catch (error) {
    console.error('HOD department middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Middleware to ensure HOD only accesses their own department's data
export const checkDepartmentAccess = (resourceDepartmentId: number, userDepartmentId: number) => {
  if (resourceDepartmentId !== userDepartmentId) {
    throw new Error('Access denied to another department\'s resources');
  }
};