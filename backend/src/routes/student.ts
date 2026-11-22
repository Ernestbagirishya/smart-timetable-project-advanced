import { Router } from 'express';
import { registerStudent, getStudents, updateStudent, getStudentTimetable, getStudentCourses } from '../controllers/student.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public route - student registration
router.post('/register', registerStudent);

// Protected routes
router.get('/', authenticateToken, getStudents);
router.put('/:studentId', authenticateToken, updateStudent);
router.get('/:studentId/timetable/:roundId', authenticateToken, getStudentTimetable);
router.get('/my-courses', authenticateToken, getStudentCourses);

export default router;
