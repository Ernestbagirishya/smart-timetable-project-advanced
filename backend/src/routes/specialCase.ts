import express, { Router } from 'express';
import path from 'path';
import { createSpecialCase, getStudentSpecialCases, getCourseSpecialCases, getDepartmentSpecialCases, approveSpecialCase, rejectSpecialCase, deleteSpecialCase, updateSpecialCase } from '../controllers/specialCase.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireHodDepartment } from '../middleware/department.middleware';
import { upload } from '../utils/upload';

const router = Router();

router.use(authenticateToken);

// Serve uploaded files - this needs to be before other routes
router.use('/evidence', express.static(path.join(__dirname, '../../../uploads')));

// Student routes
router.post('/', upload.single('evidence'), createSpecialCase);
router.get('/my-cases', getStudentSpecialCases);
router.delete('/:id', deleteSpecialCase);
router.put('/:id', upload.single('evidence'), updateSpecialCase);

// Lecturer routes
router.get('/course/:courseId', getCourseSpecialCases);

// HOD routes
router.get('/department', requireHodDepartment, getDepartmentSpecialCases);
router.post('/:id/approve', requireHodDepartment, approveSpecialCase);
router.post('/:id/reject', requireHodDepartment, rejectSpecialCase);

export default router;
