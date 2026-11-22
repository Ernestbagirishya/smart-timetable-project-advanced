// backend/src/routes/round.ts
import { Router } from 'express';
import { getAllRounds, createRound, setActiveRound, deactivateRound } from '../controllers/round.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllRounds);
router.post('/', createRound);
router.post('/:id/activate', setActiveRound);
router.post('/:id/deactivate', deactivateRound);

export default router;
