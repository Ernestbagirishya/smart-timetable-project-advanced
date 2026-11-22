// backend/src/controllers/assignment.controller.ts
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { checkDepartmentAccess } from '../middleware/department.middleware';
import prisma from '../utils/database';
import { assignmentCreateSchema } from '../schemas/assignment';

export const getDepartmentAssignments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const departmentId = req.user.departmentId!;

    const assignments = await prisma.courseAssignment.findMany({
      where: {
        course: { departmentId }
      },
      include: {
        course: { select: { courseCode: true, courseName: true } },
        lecturer: { select: { fullName: true, email: true } },
        class: { select: { name: true, year: true } }
      },
      orderBy: { course: { courseCode: 'asc' } }
    });

    res.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createAssignment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const departmentId = req.user.departmentId!;
    const parsedData = assignmentCreateSchema.safeParse(req.body);
    
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Invalid input data', errors: parsedData.error.issues });
    }

    const { courseId, lecturerId, classId } = parsedData.data;

    // Verify all resources exist
    const [course, lecturer, class_] = await Promise.all([
      prisma.course.findUnique({ where: { id: courseId } }),
      prisma.user.findUnique({ where: { id: lecturerId } }),
      prisma.class.findUnique({ where: { id: classId } })
    ]);

    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (!lecturer) return res.status(404).json({ message: 'Lecturer not found' });
    if (!class_) return res.status(404).json({ message: 'Class not found' });

    // Check if lecturer belongs to the same department or if the lecturer's department is public
    const lecturerDepartment = await prisma.department.findUnique({
      where: { id: lecturer.departmentId! },
    });

    if (lecturer.departmentId !== departmentId && (lecturerDepartment as any)?.departmentType !== 'PUBLIC') {
      return res.status(403).json({ message: 'Lecturer does not belong to your department and their department is not public' });
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.courseAssignment.findFirst({
      where: { courseId, lecturerId, classId },
    });

    if (existingAssignment) {
      return res.status(409).json({ message: 'This assignment already exists' });
    }

    const assignment = await prisma.courseAssignment.create({
      data: { courseId, lecturerId, classId },
      include: {
        course: true,
        lecturer: { select: { fullName: true } },
        class: true
      }
    });

    res.status(201).json({
      message: 'Course assignment created successfully',
      assignment,
    });
  } catch (error: any) {
    console.error('Create assignment error:', error);
    if (error.message.includes('Access denied')) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getLecturerAssignments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lecturerId = req.user.userId;

    const assignments = await prisma.courseAssignment.findMany({
      where: { lecturerId },
      include: {
        course: { select: { id: true, courseCode: true, courseName: true } },
        class: { select: { id: true, name: true, year: true } }
      },
      orderBy: { course: { courseCode: 'asc' } }
    });

    res.json(assignments);
  } catch (error) {
    console.error('Get lecturer assignments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteAssignment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const assignmentId = parseInt(req.params.id);
    const departmentId = req.user.departmentId!;

    if (isNaN(assignmentId)) {
      return res.status(400).json({ message: 'Invalid assignment ID' });
    }

    // Check if assignment exists and belongs to HOD's department
    const assignment = await prisma.courseAssignment.findUnique({
      where: { id: assignmentId },
      include: { course: true }
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    checkDepartmentAccess(assignment.course.departmentId, departmentId);

    await prisma.courseAssignment.delete({
      where: { id: assignmentId },
    });

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error: any) {
    console.error('Delete assignment error:', error);
    if (error.message.includes('Access denied')) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
