// backend/src/controllers/course.controller.ts
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { checkDepartmentAccess } from '../middleware/department.middleware';
import prisma from '../utils/database';
import { courseCreateSchema, courseUpdateSchema } from '../schemas/course';

export const getDepartmentCourses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const departmentId = req.user.departmentId!;

    const courses = await prisma.course.findMany({
      where: { departmentId },
      include: {
        classes: true,
        assignments: {
          include: {
            lecturer: { select: { id: true, fullName: true } },
            class: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { courseCode: 'asc' }
    });

    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createCourse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const departmentId = req.user.departmentId!;
    const parsedData = courseCreateSchema.safeParse(req.body);
    
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Invalid input data', errors: parsedData.error });
    }

    const { courseCode, courseName, credits, type, classIds } = parsedData.data;

    // Check if course code already exists in department
    const existingCourse = await prisma.course.findFirst({
      where: { courseCode, departmentId },
    });

    if (existingCourse) {
      return res.status(409).json({ message: 'Course with this code already exists in your department' });
    }

    // Create course with class connections if provided
    const course = await prisma.course.create({
      data: {
        courseCode,
        courseName,
        credits,
        type,
        departmentId,
        classes: classIds && classIds.length > 0 ? {
          connect: classIds.map(id => ({ id }))
        } : undefined
      },
      include: {
        classes: true,
        department: true
      }
    });

    res.status(201).json({
      message: 'Course created successfully',
      course,
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCourse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const courseId = parseInt(req.params.id);
    const departmentId = req.user.departmentId!;

    if (isNaN(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    // Check if course exists and belongs to HOD's department
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    checkDepartmentAccess(existingCourse.departmentId, departmentId);

    const parsedData = courseUpdateSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Invalid input data', errors: parsedData.error });
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: parsedData.data,
      include: { classes: true }
    });

    res.json({
      message: 'Course updated successfully',
      course: updatedCourse,
    });
  } catch (error: any) {
    console.error('Update course error:', error);
    if (error.message.includes('Access denied')) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteCourse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const courseId = parseInt(req.params.id);
    const departmentId = req.user.departmentId!;

    if (isNaN(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    // Check if course exists and belongs to HOD's department
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        assignments: true,
        catPlans: true,
        specialCases: true,
        resources: true,
        sessions: true
      }
    });

    if (!existingCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    checkDepartmentAccess(existingCourse.departmentId, departmentId);

    // Check for dependencies
    if (existingCourse.assignments.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete course: There are lecturer assignments for this course. Please remove the assignments first.'
      });
    }

    if (existingCourse.catPlans.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete course: There are CAT plans for this course. Please delete the CAT plans first.'
      });
    }

    if (existingCourse.specialCases.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete course: There are special cases for this course. Please handle the special cases first.'
      });
    }

    if (existingCourse.resources.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete course: There are resources uploaded for this course. Please delete the resources first.'
      });
    }

    if (existingCourse.sessions.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete course: This course is included in timetable sessions. Please clear the timetable first.'
      });
    }

    // If no dependencies exist, proceed with deletion
    await prisma.$transaction([
      // First disconnect the course from all classes
      prisma.course.update({
        where: { id: courseId },
        data: {
          classes: {
            set: [] // Remove all class associations
          }
        }
      }),
      // Then delete the course
      prisma.course.delete({
        where: { id: courseId }
      })
    ]);

    res.json({ message: 'Course deleted successfully' });
  } catch (error: any) {
    console.error('Delete course error:', error);
    if (error.message.includes('Access denied')) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};