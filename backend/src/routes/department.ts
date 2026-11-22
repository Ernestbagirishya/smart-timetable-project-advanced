import { Router } from 'express';
import { getAllDepartments, createDepartment, updateDepartment, deleteDepartment, assignHod } from '../controllers/department.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Protected routes only below this line
router.use(authenticateToken);

// All other routes require authentication
router.use(authenticateToken);

// Department CRUD routes
router.get('/', getAllDepartments);
router.post('/', createDepartment);
router.put('/:id', updateDepartment);
router.delete('/:id', deleteDepartment);

// HOD assignment route
router.post('/:id/assign-hod', assignHod);

export default router;
