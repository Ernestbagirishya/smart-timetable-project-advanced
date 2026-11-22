import { Router } from 'express';
import { getClassesByDepartment, getPublicDepartments } from '../controllers/public.controller';

const router = Router();

// Public routes
router.get('/departments', getPublicDepartments);
router.get('/classes/department/:departmentId', getClassesByDepartment);

export default router;