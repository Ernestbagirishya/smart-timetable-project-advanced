import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import prisma from '../utils/database';
import { resourceCreateSchema } from '../schemas/resource';
import { getFileTypeFromExtension } from '../utils/upload';

export const createResource = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lecturerId = req.user.userId;
    const parsedData = resourceCreateSchema.safeParse(req.body);
    
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Invalid input data', errors: parsedData.error.issues });
    }

    const { courseId, classId, title, description, fileUrl, fileType } = parsedData.data;

    // Verify the lecturer is assigned to this course and class
    const assignment = await prisma.courseAssignment.findFirst({
      where: {
        courseId,
        classId,
        lecturerId
      }
    });

    if (!assignment) {
      return res.status(403).json({ message: 'You are not assigned to teach this course for the selected class' });
    }

    const resource = await prisma.resource.create({
      data: {
        courseId,
        classId,
        lecturerId,
        title,
        description,
        fileUrl,
        fileType,
      },
      include: {
        course: { select: { courseCode: true, courseName: true } },
        class: { select: { name: true } },
        lecturer: { select: { fullName: true } }
      }
    });

    res.status(201).json({
      message: 'Resource created successfully',
      resource,
    });
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getLecturerResources = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lecturerId = req.user.userId;

    const resources = await prisma.resource.findMany({
      where: { lecturerId },
      include: {
        course: { select: { courseCode: true, courseName: true } },
        class: { select: { name: true, year: true } },
        lecturer: { select: { fullName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(resources);
  } catch (error) {
    console.error('Get lecturer resources error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCourseResources = async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const classId = parseInt(req.params.classId);

    if (isNaN(courseId) || isNaN(classId)) {
      return res.status(400).json({ message: 'Invalid course ID or class ID' });
    }

    const resources = await prisma.resource.findMany({
      where: { 
        courseId,
        classId
      },
      include: {
        lecturer: { select: { fullName: true } },
        course: { select: { courseCode: true, courseName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(resources);
  } catch (error) {
    console.error('Get course resources error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStudentResources = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user.userId;
    console.log('Fetching resources for student:', studentId);

    // Get student's class and courses
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        class: {
          include: {
            courseAssignments: {
              include: {
                course: true
              }
            }
          }
        }
      }
    });

    if (!student || !student.class) {
      console.log('Student not found or not assigned to class:', { studentId, student });
      return res.status(400).json({ message: 'Student not assigned to any class' });
    }

    console.log('Student class:', student.class.id);
    const courseIds = student.class.courseAssignments.map(ca => ca.course.id);
    console.log('Student course IDs:', courseIds);

    // Get resources for all courses in the student's class
    const resources = await prisma.resource.findMany({
      where: {
        classId: student.class.id,
        courseId: { in: courseIds }
      },
      include: {
        lecturer: { select: { fullName: true } },
        course: { select: { courseCode: true, courseName: true } },
        class: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('Found resources:', resources.length);

    res.json(resources);
  } catch (error) {
    console.error('Get student resources error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteResource = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const resourceId = parseInt(req.params.id);
    const lecturerId = req.user.userId;

    if (isNaN(resourceId)) {
      return res.status(400).json({ message: 'Invalid resource ID' });
    }

    // Verify the resource belongs to the lecturer
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId }
    });

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.lecturerId !== lecturerId) {
      return res.status(403).json({ message: 'You can only delete your own resources' });
    }

    await prisma.resource.delete({
      where: { id: resourceId }
    });

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const uploadFile = async (req: Request, res: Response) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please select a file.' });
    }

    // Construct the URL where the file can be accessed
    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      message: 'File uploaded successfully',
      fileUrl: fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: getFileTypeFromExtension(req.file.originalname)
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'File upload failed' });
  }
};