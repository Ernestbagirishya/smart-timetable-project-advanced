// backend/src/routes/timeslot.ts
import { Router } from 'express';
import { getAllTimeSlots, createTimeSlot } from '../controllers/timeslot.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllTimeSlots);
router.post('/', createTimeSlot);

export default router;