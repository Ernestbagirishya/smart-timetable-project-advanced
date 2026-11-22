import { Router } from 'express';
import { getAllHods, createHod, updateHod, deleteHod, getHodDashboard } from '../controllers/hod.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', getAllHods);
router.get('/dashboard', getHodDashboard);
router.post('/', createHod);
router.put('/:id', updateHod);
router.delete('/:id', deleteHod);

export default router;
