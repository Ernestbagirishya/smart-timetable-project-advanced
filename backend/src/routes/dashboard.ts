import { Router } from 'express';
import { 
  getManagerDashboard, 
  getAllCourses, 
  getHodDashboard, 
  getLecturerDashboard, 
  getLecturerCourses,
  getStudentDashboard 
} from '../controllers/dashboard.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Manager dashboard route
router.get('/manager', authenticateToken, requireRole('TIMETABLE_MANAGER'), getManagerDashboard);

// HOD dashboard route
router.get('/hod', authenticateToken, requireRole('HOD'), getHodDashboard);

// Lecturer dashboard route
router.get('/lecturer', authenticateToken, requireRole('LECTURER'), getLecturerDashboard);

// Lecturer courses route
router.get('/lecturer/courses', authenticateToken, requireRole('LECTURER'), getLecturerCourses);

// Get all courses for manager
router.get('/manager/courses', authenticateToken, requireRole('TIMETABLE_MANAGER'), getAllCourses);

// Student dashboard route
router.get('/student', authenticateToken, requireRole('STUDENT'), getStudentDashboard);

export default router;
