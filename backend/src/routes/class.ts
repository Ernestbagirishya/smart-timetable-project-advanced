// backend/src/routes/class.ts
import { Router } from 'express';
import { getAllClasses, getDepartmentClasses, createClass, updateClass, deleteClass } from '../controllers/class.controller';
import { getClassesByDepartment } from '../controllers/public.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireHodDepartment } from '../middleware/department.middleware';

const router = Router();

// Public route for student registration
router.get('/department/:departmentId', getClassesByDepartment);

router.use(authenticateToken, requireHodDepartment);

router.get('/all', getAllClasses);
router.get('/', getDepartmentClasses);
router.post('/', createClass);
router.put('/:id', updateClass);
router.delete('/:id', deleteClass);

export default router;
