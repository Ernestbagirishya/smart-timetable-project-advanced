// backend/src/routes/course.ts
import { Router } from 'express';
import { getDepartmentCourses, createCourse, updateCourse, deleteCourse } from '../controllers/course.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireHodDepartment } from '../middleware/department.middleware';

const router = Router();

// All routes require HOD authentication and department access
router.use(authenticateToken, requireHodDepartment);

router.get('/', getDepartmentCourses);
router.post('/', createCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

export default router;