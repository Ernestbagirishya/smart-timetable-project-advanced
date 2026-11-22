import { Router } from 'express';
import { createCatPlan, getLecturerCatPlans, getStudentCatPlans, getPendingCatPlans, getAllCatPlans, approveCatPlan, updateCatPlan, deleteCatPlan, rejectCatPlan } from '../controllers/cat.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireHodDepartment } from '../middleware/department.middleware';

const router = Router();

// Lecturer routes
router.post('/', authenticateToken, createCatPlan);
router.get('/my-plans', authenticateToken, getLecturerCatPlans);
router.put('/:id', authenticateToken, updateCatPlan);
router.delete('/:id', authenticateToken, deleteCatPlan);

// Student routes
router.get('/student', authenticateToken, getStudentCatPlans);

// HOD routes
router.get('/pending', authenticateToken, requireHodDepartment, getPendingCatPlans);
router.get('/all', authenticateToken, requireHodDepartment, getAllCatPlans);
router.post('/:id/approve', authenticateToken, requireHodDepartment, approveCatPlan);
router.post('/:id/reject', authenticateToken, requireHodDepartment, rejectCatPlan);

export default router;
