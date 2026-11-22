// backend/src/routes/assignment.ts
import { Router } from 'express';
import { getDepartmentAssignments, createAssignment, deleteAssignment, getLecturerAssignments } from '../controllers/assignment.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireHodDepartment } from '../middleware/department.middleware';

const router = Router();

// Lecturer route (no HOD requirement)
router.get('/my-assignments', authenticateToken, getLecturerAssignments);

// HOD routes
router.use(authenticateToken, requireHodDepartment);

router.get('/', getDepartmentAssignments);
router.post('/', createAssignment);
router.delete('/:id', deleteAssignment);

export default router;