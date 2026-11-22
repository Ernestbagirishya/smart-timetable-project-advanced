import { Request, Response } from 'express';
import prisma from '../utils/database';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const getStudentDashboard = async (req: AuthenticatedRequest, res: Response) => {
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

    // Get active courses for the student's class
    const courses = await prisma.course.count({
      where: {
        classes: {
          some: {
            id: student.classId
          }
        }
      }
    });

    // Get courses assigned with lecturer in the student's class
    const coursesAssignedWithLecturer = await prisma.courseAssignment.count({
      where: {
        classId: student.classId
      }
    });

    // Get today's classes
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const classes = await prisma.session.count({
      where: {
        classId: student.classId,
        dayOfWeek: today.getDay()
      }
    });

    // Get special cases (pending tasks)
    const tasks = await prisma.specialCase.count({
      where: {
        studentId: userId,
        status: 'PENDING'
      }
    });

    // Get available resources
    const resources = await prisma.resource.count({
      where: {
        classId: student.classId
      }
    });

    // Get approved CAT plans for the student's class
    const approvedCATs = await prisma.cATPlan.count({
      where: {
        classId: student.classId,
        status: 'APPROVED'
      }
    });

    // Get recent updates from assignments and special cases
    const [recentSpecialCases, recentResources] = await Promise.all([
      prisma.specialCase.findMany({
        where: {
          studentId: userId
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 3,
        include: {
          course: true
        }
      }),
      prisma.resource.findMany({
        where: {
          classId: student.classId
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 2,
        include: {
          course: true
        }
      })
    ]);

    // Combine and format updates
    const updates = [
      ...recentSpecialCases.map(sc => ({
        id: sc.id,
        type: sc.type.toLowerCase(),
        message: `${sc.type} request for ${sc.course.courseName}: ${sc.status}`,
        timestamp: sc.createdAt
      })),
      ...recentResources.map(res => ({
        id: res.id,
        type: 'resource',
        message: `New resource added for ${res.course.courseName}: ${res.title}`,
        timestamp: res.createdAt
      }))
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    res.json({
      success: true,
      data: {
        activeCourses: courses,
        coursesAssignedWithLecturer: coursesAssignedWithLecturer,
        todayClasses: classes,
        pendingTasks: tasks,
        pendingCATs: approvedCATs,
        resources: resources,
        recentUpdates: updates
      }
    });
  } catch (error) {
    console.error('Student Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student dashboard data'
    });
  }
};

export const getHodDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get the HOD's department
    const hod = await prisma.user.findUnique({
      where: { id: userId },
      include: { department: true }
    });

    if (!hod || !hod.departmentId) {
      return res.status(404).json({ message: 'HOD department not found' });
    }

    // Get department statistics
    const [
      studentsCount,
      lecturersCount,
      coursesCount,
      classesCount
    ] = await Promise.all([
      prisma.user.count({
        where: {
          role: 'STUDENT',
          departmentId: hod.departmentId
        }
      }),
      prisma.user.count({
        where: {
          role: 'LECTURER',
          departmentId: hod.departmentId
        }
      }),
      prisma.course.count({
        where: {
          departmentId: hod.departmentId
        }
      }),
      prisma.class.count({
        where: {
          departmentId: hod.departmentId
        }
      })
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
      message: 'Error fetching HOD dashboard data'
    });
  }
};

export const getManagerDashboard = async (req: Request, res: Response) => {
  try {
    // counts: match your Prisma schema (User with roles, Department, Room, Round)
    const [
      departmentsCount,
      lecturersCount,
      hodsCount,
      studentsCount,
      coursesCount,
      roomsCount,
      classesCount,
      activeRoundsCount
    ] = await Promise.all([
      prisma.department.count(),
      // Users with role LECTURER
      prisma.user.count({ where: { role: 'LECTURER' } }),
      // Users with role HOD
      prisma.user.count({ where: { role: 'HOD' } }),
      // Users with role STUDENT
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.course.count(),
      prisma.room.count(),
      prisma.class.count(),
      prisma.round.count({ where: { isActive: true } })
    ]);

    // timetablesCount: number of distinct rounds that have sessions (distinct roundId in sessions)
    const distinctRounds = await prisma.session.findMany({
      distinct: ['roundId'],
      select: { roundId: true }
    });
    const timetablesCount = distinctRounds.length;

    // recent activity: use CourseAssignment (assignment of course -> lecturer -> class)
    const recentActivity = await prisma.courseAssignment.findMany({
      take: 5,
      orderBy: { id: 'desc' }, // no createdAt on CourseAssignment; use id (or add timestamp to model)
      include: {
        course: true,
        lecturer: true, // relation to User
        class: true     // relation to Class (field name is `class` in your schema)
      }
    });

    const dashboardData = {
      totalDepartments: departmentsCount,
      totalLecturers: lecturersCount,
      totalHods: hodsCount,
      totalStudents: studentsCount,
      totalCourses: coursesCount,
      totalRooms: roomsCount,
      totalClasses: classesCount,
      activeRounds: activeRoundsCount,
      generatedTimetables: timetablesCount,
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        // use bracket access for `class` to avoid any reserved word parsing issues
        description: `${activity.course.courseName} assigned to ${activity.lecturer.fullName} for ${activity['class'].name}`,
        // CourseAssignment doesn't have createdAt in your schema; fallback to id-based timestamp-like value
        time: activity.id.toString()
      })),
      systemStats: {
        activeTimetables: timetablesCount,
        pendingAssignments: 0, // compute if you have logic for pending
        completedRounds: await prisma.round.count({ where: { isActive: false } })
      }
    };

    res.json({
      success: true,
      data: dashboardData,
      message: 'Manager dashboard data fetched successfully'
    });
  } catch (error: unknown) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getLecturerDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get lecturer's assigned courses and classes
    const assignments = await prisma.courseAssignment.findMany({
      where: { lecturerId: userId },
      select: {
        courseId: true,
        classId: true
      }
    });

    const uniqueCourses = new Set(assignments.map(a => a.courseId));
    const uniqueClasses = new Set(assignments.map(a => a.classId));

    // Get course IDs for the lecturer
    const courseIds = Array.from(uniqueCourses);

    // Get pending CAT plans created by lecturer
    const pendingCATs = await prisma.cATPlan.count({
      where: {
        lecturerId: userId,
        status: 'PENDING'
      }
    });

    // Get pending special cases for lecturer's courses
    const pendingSpecialCases = await prisma.specialCase.count({
      where: {
        courseId: { in: courseIds },
        status: 'PENDING'
      }
    });

    // Get recent activities
    const [recentCATPlans, recentSpecialCases, recentResources] = await Promise.all([
      prisma.cATPlan.findMany({
        where: { lecturerId: userId },
        orderBy: { createdAt: 'desc' },
        take: 2,
        include: { course: true }
      }),
      prisma.specialCase.findMany({
        where: { courseId: { in: courseIds } },
        orderBy: { createdAt: 'desc' },
        take: 2,
        include: { course: true, student: { select: { fullName: true } } }
      }),
      prisma.resource.findMany({
        where: { lecturerId: userId },
        orderBy: { createdAt: 'desc' },
        take: 2,
        include: { course: true }
      })
    ]);

    // Combine recent activities
    const recentActivities = [
      ...recentCATPlans.map(cat => ({
        id: cat.id,
        type: 'cat_plan',
        message: `CAT Plan created for ${cat.course.courseName}`,
        timestamp: cat.createdAt
      })),
      ...recentSpecialCases.map(sc => ({
        id: sc.id,
        type: 'special_case',
        message: `${sc.student.fullName} submitted ${sc.type} for ${sc.course.courseName}`,
        timestamp: sc.createdAt
      })),
      ...recentResources.map(res => ({
        id: res.id,
        type: 'resource',
        message: `Resource uploaded for ${res.course.courseName}: ${res.title}`,
        timestamp: res.createdAt
      }))
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);

    const dashboardData = {
      assignedCourses: uniqueCourses.size,
      assignedClasses: uniqueClasses.size,
      pendingCATs,
      pendingSpecialCases,
      recentActivities
    };

    res.json({
      success: true,
      data: dashboardData,
      message: 'Lecturer dashboard data fetched successfully'
    });
  } catch (error) {
    console.error('Lecturer Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lecturer dashboard data'
    });
  }
};

export const getLecturerCourses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const assignments = await prisma.courseAssignment.findMany({
      where: { lecturerId: userId },
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

    const uniqueCourses = Array.from(
      new Map(assignments.map(a => [a.course.id, a.course])).values()
    );

    res.json({
      success: true,
      data: uniqueCourses,
      message: 'Lecturer courses fetched successfully'
    });
  } catch (error: unknown) {
    console.error('Get lecturer courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lecturer courses',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        department: true,
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

    res.json({
      success: true,
      data: courses,
      message: 'All courses fetched successfully'
    });
  } catch (error: unknown) {
    console.error('Get all courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
