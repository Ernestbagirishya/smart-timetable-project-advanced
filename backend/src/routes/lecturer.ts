// backend/src/routes/lecturer.ts
import { Router } from 'express';
import { getDepartmentLecturers, createLecturer, updateLecturer, deleteLecturer, getAvailableLecturers } from '../controllers/lecturer.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireHodDepartment } from '../middleware/department.middleware';

const router = Router();

router.use(authenticateToken, requireHodDepartment);

router.get('/', getDepartmentLecturers);
router.post('/', createLecturer);
router.put('/:lecturerId', updateLecturer);
router.delete('/:lecturerId', deleteLecturer);
router.get('/available', getAvailableLecturers);

export default router;
