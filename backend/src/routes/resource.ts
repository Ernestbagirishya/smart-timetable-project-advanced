// backend/src/routes/resource.ts
import { Router, Request, Response, NextFunction } from 'express';
import { 
  createResource, 
  getLecturerResources, 
  getCourseResources, 
  getStudentResources, 
  deleteResource,
  uploadFile 
} from '../controllers/resource.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { upload } from '../utils/upload';

const router = Router();

router.use(authenticateToken);

// File upload route - handles actual file uploads
router.post('/upload', (req: Request, res: Response, next: NextFunction) => {
  // Use the standard Request type instead of AuthenticatedRequest for multer
  upload.single('file')(req, res, (err: any) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 50MB.' });
      }
      if (err.message && err.message.includes('File type not allowed')) {
        return res.status(400).json({ message: err.message });
      }
      if (err.code === 'MISSING_FIELD_NAME') {
        return res.status(400).json({ 
          message: 'File upload error: Please make sure you are sending the file with field name "file"',
          details: 'In Postman/Thunder Client, use form-data with key="file" and type=File'
        });
      }
      return res.status(400).json({ message: 'File upload failed: ' + err.message });
    }
    next();
  });
}, uploadFile);

// Lecturer routes
router.post('/', createResource);
router.get('/my-resources', getLecturerResources);
router.delete('/:id', deleteResource);

// Student routes
router.get('/student/my-resources', getStudentResources);

// Public routes (accessible by students)
router.get('/course/:courseId/class/:classId', getCourseResources);

export default router;