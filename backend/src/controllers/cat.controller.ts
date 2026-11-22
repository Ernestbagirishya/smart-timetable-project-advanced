import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import prisma from '../utils/database';
import { catCreateSchema, catUpdateSchema } from '../schemas/cat';

export const createCatPlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lecturerId = req.user.userId;
    const parsedData = catCreateSchema.safeParse(req.body);

    if (!parsedData.success) {
      return res.status(400).json({ message: 'Invalid input data', errors: parsedData.error.issues });
    }

    const { courseId, title, description, maxMarks, dueDate } = parsedData.data;

    // Get all classes assigned to this lecturer for the course
    const assignments = await prisma.courseAssignment.findMany({
      where: {
        courseId,
        lecturerId
      },
      include: {
        class: true
      }
    });

    if (assignments.length === 0) {
      return res.status(403).json({ message: 'You are not assigned to teach this course for any class' });
    }

    // Create CAT plans for all assigned classes
    const catPlans = await Promise.all(
      assignments.map(async (assignment) => {
        return await prisma.cATPlan.create({
          data: {
            courseId,
            classId: assignment.classId,
            lecturerId,
            title,
            description,
            maxMarks,
            dueDate: new Date(dueDate),
            status: 'PENDING' // Needs HOD approval
          },
          include: {
            course: { select: { courseCode: true, courseName: true } },
            class: { select: { name: true } },
            lecturer: { select: { fullName: true } }
          }
        });
      })
    );

    res.status(201).json({
      message: `CAT plans created successfully for ${catPlans.length} class(es). Waiting for HOD approval.`,
      catPlans,
    });
  } catch (error) {
    console.error('Create CAT plan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getLecturerCatPlans = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lecturerId = req.user.userId;

    const catPlans = await prisma.cATPlan.findMany({
      where: { lecturerId },
      include: {
        course: { select: { courseCode: true, courseName: true } },
        class: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(catPlans);
  } catch (error) {
    console.error('Get CAT plans error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStudentCatPlans = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get student details
    const student = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        class: true
      }
    });

    if (!student || !student.classId) {
      return res.status(404).json({
        success: false,
        message: 'Student or class not found'
      });
    }

    const catPlans = await prisma.cATPlan.findMany({
      where: {
        classId: student.classId
      },
      include: {
        course: { select: { courseCode: true, courseName: true } },
        lecturer: { select: { fullName: true } }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: catPlans,
      message: 'Student CAT plans fetched successfully'
    });
  } catch (error: unknown) {
    console.error('Get student CAT plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student CAT plans',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getPendingCatPlans = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const departmentId = req.user.departmentId;

    const pendingCatPlans = await prisma.cATPlan.findMany({
      where: {
        status: 'PENDING',
        course: { departmentId }
      },
      include: {
        course: { select: { courseCode: true, courseName: true } },
        class: { select: { name: true } },
        lecturer: { select: { fullName: true, email: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      data: pendingCatPlans,
      message: 'CAT plans retrieved successfully'
    });
  } catch (error) {
    console.error('Get pending CAT plans error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllCatPlans = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const departmentId = req.user.departmentId;

    const allCatPlans = await prisma.cATPlan.findMany({
      where: {
        course: { departmentId }
      },
      include: {
        course: { select: { courseCode: true, courseName: true } },
        class: { select: { name: true } },
        lecturer: { select: { fullName: true, email: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      data: allCatPlans,
      message: 'CAT plans retrieved successfully'
    });
  } catch (error) {
    console.error('Get all CAT plans error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const approveCatPlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const catPlanId = parseInt(req.params.id);
    const departmentId = req.user.departmentId;

    if (isNaN(catPlanId)) {
      return res.status(400).json({ message: 'Invalid CAT plan ID' });
    }

    const catPlan = await prisma.cATPlan.findUnique({
      where: { id: catPlanId },
      include: { course: true }
    });

    if (!catPlan) {
      return res.status(404).json({ message: 'CAT plan not found' });
    }

    if (catPlan.course.departmentId !== departmentId) {
      return res.status(403).json({ message: 'Access denied to CAT plans from other departments' });
    }

    const updatedCatPlan = await prisma.cATPlan.update({
      where: { id: catPlanId },
      data: { status: 'APPROVED' },
      include: {
        course: { select: { courseCode: true } },
        class: { select: { name: true } },
        lecturer: { select: { fullName: true } }
      }
    });

    res.json({
      message: 'CAT plan approved successfully',
      catPlan: updatedCatPlan,
    });
  } catch (error) {
    console.error('Approve CAT plan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCatPlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const catPlanId = parseInt(req.params.id);
    const lecturerId = req.user.userId;

    if (isNaN(catPlanId)) {
      return res.status(400).json({ message: 'Invalid CAT plan ID' });
    }

    const parsedData = catUpdateSchema.safeParse(req.body);

    if (!parsedData.success) {
      return res.status(400).json({ message: 'Invalid input data', errors: parsedData.error.issues });
    }

    const catPlan = await prisma.cATPlan.findUnique({
      where: { id: catPlanId }
    });

    if (!catPlan) {
      return res.status(404).json({ message: 'CAT plan not found' });
    }

    if (catPlan.lecturerId !== lecturerId) {
      return res.status(403).json({ message: 'Access denied. You can only update your own CAT plans' });
    }

    if (catPlan.status !== 'PENDING') {
      return res.status(403).json({ message: 'Cannot update CAT plan that has been approved or rejected' });
    }

    const updatedCatPlan = await prisma.cATPlan.update({
      where: { id: catPlanId },
      data: {
        ...parsedData.data,
        dueDate: parsedData.data.dueDate ? new Date(parsedData.data.dueDate) : undefined
      },
      include: {
        course: { select: { courseCode: true, courseName: true } },
        class: { select: { name: true } }
      }
    });

    res.json({
      message: 'CAT plan updated successfully',
      catPlan: updatedCatPlan,
    });
  } catch (error) {
    console.error('Update CAT plan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteCatPlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const catPlanId = parseInt(req.params.id);
    const lecturerId = req.user.userId;

    if (isNaN(catPlanId)) {
      return res.status(400).json({ message: 'Invalid CAT plan ID' });
    }

    const catPlan = await prisma.cATPlan.findUnique({
      where: { id: catPlanId }
    });

    if (!catPlan) {
      return res.status(404).json({ message: 'CAT plan not found' });
    }

    if (catPlan.lecturerId !== lecturerId) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own CAT plans' });
    }

    if (catPlan.status !== 'PENDING') {
      return res.status(403).json({ message: 'Cannot delete CAT plan that has been approved or rejected' });
    }

    await prisma.cATPlan.delete({
      where: { id: catPlanId }
    });

    res.json({ message: 'CAT plan deleted successfully' });
  } catch (error) {
    console.error('Delete CAT plan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const rejectCatPlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const catPlanId = parseInt(req.params.id);
    const departmentId = req.user.departmentId;

    if (isNaN(catPlanId)) {
      return res.status(400).json({ message: 'Invalid CAT plan ID' });
    }

    const catPlan = await prisma.cATPlan.findUnique({
      where: { id: catPlanId },
      include: { course: true }
    });

    if (!catPlan) {
      return res.status(404).json({ message: 'CAT plan not found' });
    }

    if (catPlan.course.departmentId !== departmentId) {
      return res.status(403).json({ message: 'Access denied to CAT plans from other departments' });
    }

    const updatedCatPlan = await prisma.cATPlan.update({
      where: { id: catPlanId },
      data: { status: 'REJECTED' },
      include: {
        course: { select: { courseCode: true } },
        class: { select: { name: true } },
        lecturer: { select: { fullName: true } }
      }
    });

    res.json({
      message: 'CAT plan rejected successfully',
      catPlan: updatedCatPlan,
    });
  } catch (error) {
    console.error('Reject CAT plan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
