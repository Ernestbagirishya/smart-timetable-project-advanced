import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import prisma from '../utils/database';
import { specialCaseCreateSchema } from '../schemas/specialCase';

export const createSpecialCase = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user.userId;
    const parsedData = specialCaseCreateSchema.safeParse(req.body);
    
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Invalid input data', errors: parsedData.error.issues });
    }

    const { type, courseId, description, evidence } = parsedData.data;

    // Verify student is assigned to a class
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { classId: true }
    });

    if (!student || !student.classId) {
      return res.status(400).json({ message: 'Student not assigned to any class' });
    }

    // Verify course is assigned to student's class with a lecturer
    const courseAssignment = await prisma.courseAssignment.findFirst({
      where: { courseId, classId: student.classId }
    });

    if (!courseAssignment) {
      return res.status(400).json({ message: 'Course is not assigned to your class with a lecturer' });
    }

    // Handle file evidence if uploaded
    let evidenceUrl = evidence;
    if (req.file) {
      evidenceUrl = `/special-cases/evidence/${req.file.filename}`;
    }

    const specialCase = await prisma.specialCase.create({
      data: {
        studentId,
        courseId,
        type,
        description,
        evidence: evidenceUrl,
        status: 'PENDING'
      },
      include: {
        course: { select: { courseCode: true, courseName: true } },
        student: { select: { fullName: true, registrationNumber: true } }
      }
    });

    res.status(201).json({
      message: 'Special case submitted successfully',
      specialCase,
    });
  } catch (error) {
    console.error('Create special case error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStudentSpecialCases = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user.userId;

    const specialCases = await prisma.specialCase.findMany({
      where: { studentId },
      include: {
        course: { select: { courseCode: true, courseName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(specialCases);
  } catch (error) {
    console.error('Get student special cases error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCourseSpecialCases = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lecturerId = req.user.userId;
    const courseId = parseInt(req.params.courseId);

    if (isNaN(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    // Verify lecturer teaches this course
    const assignment = await prisma.courseAssignment.findFirst({
      where: { courseId, lecturerId }
    });

    if (!assignment) {
      return res.status(403).json({ message: 'You do not teach this course' });
    }

    const specialCases = await prisma.specialCase.findMany({
      where: { courseId },
      include: {
        student: { select: { fullName: true, registrationNumber: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(specialCases);
  } catch (error) {
    console.error('Get course special cases error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDepartmentSpecialCases = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const departmentId = req.user.departmentId;

    const specialCases = await prisma.specialCase.findMany({
      where: {
        student: { class: { departmentId } }
      },
      select: {
        id: true,
        type: true,
        description: true,
        evidence: true,
        status: true,
        createdAt: true,
        course: {
          select: {
            courseCode: true,
            courseName: true
          }
        },
        student: {
          select: {
            fullName: true,
            registrationNumber: true,
            class: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(specialCases);
  } catch (error) {
    console.error('Get department special cases error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const approveSpecialCase = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const specialCaseId = parseInt(req.params.id);
    const departmentId = req.user.departmentId;

    if (isNaN(specialCaseId)) {
      return res.status(400).json({ message: 'Invalid special case ID' });
    }

    const specialCase = await prisma.specialCase.findUnique({
      where: { id: specialCaseId },
      include: { student: { include: { class: true } } }
    });

    if (!specialCase) {
      return res.status(404).json({ message: 'Special case not found' });
    }

    if (!specialCase.student.class || specialCase.student.class.departmentId !== departmentId) {
      return res.status(403).json({ message: 'Access denied to special cases from other departments' });
    }

    const updatedSpecialCase = await prisma.specialCase.update({
      where: { id: specialCaseId },
      data: { status: 'APPROVED' },
      include: {
        course: { select: { courseCode: true, courseName: true } },
        student: { select: { fullName: true, registrationNumber: true, class: { select: { name: true } } } }
      }
    });

    res.json({
      message: 'Special case approved successfully',
      specialCase: updatedSpecialCase,
    });
  } catch (error) {
    console.error('Approve special case error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const rejectSpecialCase = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const specialCaseId = parseInt(req.params.id);
    const departmentId = req.user.departmentId;

    if (isNaN(specialCaseId)) {
      return res.status(400).json({ message: 'Invalid special case ID' });
    }

    const specialCase = await prisma.specialCase.findUnique({
      where: { id: specialCaseId },
      include: { student: { include: { class: true } } }
    });

    if (!specialCase) {
      return res.status(404).json({ message: 'Special case not found' });
    }

    if (!specialCase.student.class || specialCase.student.class.departmentId !== departmentId) {
      return res.status(403).json({ message: 'Access denied to special cases from other departments' });
    }

    const updatedSpecialCase = await prisma.specialCase.update({
      where: { id: specialCaseId },
      data: { status: 'REJECTED' },
      include: {
        course: { select: { courseCode: true, courseName: true } },
        student: { select: { fullName: true, registrationNumber: true, class: { select: { name: true } } } }
      }
    });

    res.json({
      message: 'Special case rejected successfully',
      specialCase: updatedSpecialCase,
    });
  } catch (error) {
    console.error('Reject special case error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// New controller to delete a special case if not approved
export const deleteSpecialCase = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const specialCaseId = parseInt(req.params.id);
    const studentId = req.user.userId;

    if (isNaN(specialCaseId)) {
      return res.status(400).json({ message: 'Invalid special case ID' });
    }

    const specialCase = await prisma.specialCase.findUnique({
      where: { id: specialCaseId }
    });

    if (!specialCase) {
      return res.status(404).json({ message: 'Special case not found' });
    }

    if (specialCase.studentId !== studentId) {
      return res.status(403).json({ message: 'You can only delete your own special cases' });
    }

    if (specialCase.status === 'APPROVED') {
      return res.status(400).json({ message: 'Cannot delete an approved special case' });
    }

    await prisma.specialCase.delete({
      where: { id: specialCaseId }
    });

    res.json({ message: 'Special case deleted successfully' });
  } catch (error) {
    console.error('Delete special case error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// New controller to update a special case if not approved
export const updateSpecialCase = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const specialCaseId = parseInt(req.params.id);
    const studentId = req.user.userId;

    if (isNaN(specialCaseId)) {
      return res.status(400).json({ message: 'Invalid special case ID' });
    }

    const specialCase = await prisma.specialCase.findUnique({
      where: { id: specialCaseId }
    });

    if (!specialCase) {
      return res.status(404).json({ message: 'Special case not found' });
    }

    if (specialCase.studentId !== studentId) {
      return res.status(403).json({ message: 'You can only update your own special cases' });
    }

    if (specialCase.status === 'APPROVED') {
      return res.status(400).json({ message: 'Cannot update an approved special case' });
    }

    // Validate input data
    const parsedData = specialCaseCreateSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Invalid input data', errors: parsedData.error.issues });
    }

    const { type, courseId, description, evidence } = parsedData.data;

    // Verify student is assigned to a class
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { classId: true }
    });

    if (!student || !student.classId) {
      return res.status(400).json({ message: 'Student not assigned to any class' });
    }

    // Verify course is assigned to student's class with a lecturer
    const courseAssignment = await prisma.courseAssignment.findFirst({
      where: { courseId, classId: student.classId }
    });

    if (!courseAssignment) {
      return res.status(400).json({ message: 'Course is not assigned to your class with a lecturer' });
    }

    // Handle file evidence if uploaded
    let evidenceUrl = evidence;
    if (req.file) {
      evidenceUrl = `/special-cases/evidence/${req.file.filename}`;
    }

    const updatedSpecialCase = await prisma.specialCase.update({
      where: { id: specialCaseId },
      data: {
        type,
        courseId,
        description,
        evidence: evidenceUrl,
        status: 'PENDING' // reset status to pending on update
      },
      include: {
        course: { select: { courseCode: true, courseName: true } },
        student: { select: { fullName: true, registrationNumber: true } }
      }
    });

    res.json({
      message: 'Special case updated successfully',
      specialCase: updatedSpecialCase,
    });
  } catch (error) {
    console.error('Update special case error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
