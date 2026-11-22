// backend/src/routes/timetable.ts
import { Router } from 'express';
import { generateTimetable, getTimetableSessions, deleteTimetableSessions, getLecturerTimetable, getClassTimetable } from '../controllers/timetable.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/generate/:roundId', generateTimetable);
router.get('/sessions/:roundId', getTimetableSessions);
router.delete('/sessions/:roundId', deleteTimetableSessions);
router.get('/lecturer/:roundId', getLecturerTimetable);
router.get('/class/:roundId/:classId', getClassTimetable);

export default router;