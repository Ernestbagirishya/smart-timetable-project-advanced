import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import prisma from '../utils/database';
import { hashPassword } from '../utils/auth';
import { studentRegisterSchema } from '../schemas/student';

export const registerStudent = async (req: Request, res: Response) => {
  try {
    const parsedData = studentRegisterSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Invalid input data', errors: parsedData.error.issues });
    }

    const { username, password, fullName, email, registrationNumber, departmentId, classId } = parsedData.data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { username }, 
          { email }, 
          { registrationNumber }  // This will now work after schema update
        ] 
      },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'User with this username, email or registration number already exists' });
    }

    // Verify department and class exist and match
    const department = await prisma.department.findUnique({ where: { id: departmentId } });
    const class_ = await prisma.class.findUnique({ where: { id: classId } });

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    if (!class_ || class_.departmentId !== departmentId) {
      return res.status(400).json({ message: 'Class not found or does not belong to the selected department' });
    }

    // Create student
    const student = await prisma.user.create({
      data: {
        username,
        password: await hashPassword(password),
        fullName,
        email,
        registrationNumber,  // This will now work after schema update
        role: 'STUDENT',
        departmentId,
        classId,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        registrationNumber: true,  // This will now work after schema update
        role: true,
        department: true,
        class: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'Student registered successfully',
      student,
    });
  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration' });
  }
};

export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        registrationNumber: true,
        role: true,
        department: { select: { id: true, name: true } },
        class: { select: { id: true, name: true, year: true } },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const studentId = parseInt(req.params.studentId);
    if (isNaN(studentId)) {
      return res.status(400).json({ message: 'Invalid student ID' });
    }

    const parsedData = studentRegisterSchema.partial().safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Invalid input data', errors: parsedData.error.issues });
    }

    const updateData = parsedData.data;

    // Check if student exists
    const existingStudent = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, role: true }
    });

    if (!existingStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (existingStudent.role !== 'STUDENT') {
      return res.status(400).json({ message: 'User is not a student' });
    }

    // If updating username, email, or registrationNumber, check for conflicts
    if (updateData.username || updateData.email || updateData.registrationNumber) {
      const conflictCheck = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: studentId } },
            {
              OR: [
                updateData.username ? { username: updateData.username } : {},
                updateData.email ? { email: updateData.email } : {},
                updateData.registrationNumber ? { registrationNumber: updateData.registrationNumber } : {},
              ].filter(obj => Object.keys(obj).length > 0)
            }
          ]
        }
      });

      if (conflictCheck) {
        return res.status(409).json({ message: 'Username, email, or registration number already exists' });
      }
    }

    // If updating department and class, verify they exist and match
    if (updateData.departmentId || updateData.classId) {
      const departmentId = updateData.departmentId || (await prisma.user.findUnique({ where: { id: studentId }, select: { departmentId: true } }))?.departmentId;
      const classId = updateData.classId;

      if (departmentId) {
        const department = await prisma.department.findUnique({ where: { id: departmentId } });
        if (!department) {
          return res.status(404).json({ message: 'Department not found' });
        }
      }

      if (classId) {
        const class_ = await prisma.class.findUnique({ where: { id: classId } });
        if (!class_ || (departmentId && class_.departmentId !== departmentId)) {
          return res.status(400).json({ message: 'Class not found or does not belong to the selected department' });
        }
      }
    }

    // Hash password if provided
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    // Update student
    const updatedStudent = await prisma.user.update({
      where: { id: studentId },
      data: updateData,
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        registrationNumber: true,
        role: true,
        department: { select: { id: true, name: true } },
        class: { select: { id: true, name: true, year: true } },
        createdAt: true
      }
    });

    res.json({
      message: 'Student updated successfully',
      student: updatedStudent,
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStudentTimetable = async (req: Request, res: Response) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const roundId = parseInt(req.params.roundId);

    if (isNaN(studentId) || isNaN(roundId)) {
      return res.status(400).json({ message: 'Invalid student ID or round ID' });
    }

    // Get student's class
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { classId: true }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Handle case where student might not have a class assigned
    if (!student.classId) {
      return res.status(400).json({ message: 'Student is not assigned to any class' });
    }

    const sessions = await prisma.session.findMany({
      where: {
        roundId,
        classId: student.classId
      },
      include: {
        timeSlot: true,
        course: { select: { courseCode: true, courseName: true } },
        lecturer: { select: { fullName: true } },
        room: { select: { roomId: true, roomName: true } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { timeSlot: { startTime: 'asc' } }],
    });

    res.json(sessions);
  } catch (error) {
    console.error('Get student timetable error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStudentCourses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user.userId;

    // Get student's class
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { classId: true }
    });

    if (!student || !student.classId) {
      return res.status(400).json({ message: 'Student not assigned to any class' });
    }

    // Get courses assigned to the student's class with lecturers
    const courseAssignments = await prisma.courseAssignment.findMany({
      where: { classId: student.classId },
      include: {
        course: {
          select: {
            id: true,
            courseCode: true,
            courseName: true
          }
        }
      }
    });

    const courses = courseAssignments.map(ca => ca.course);

    res.json(courses);
  } catch (error) {
    console.error('Get student courses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
