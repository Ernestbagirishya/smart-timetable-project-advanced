// backend/src/routes/room.ts
import { Router } from 'express';
import { getAllRooms, createRoom, updateRoom, deleteRoom } from '../controllers/room.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Room routes
router.get('/', getAllRooms);
router.post('/', createRoom);
router.put('/:id', updateRoom);
router.delete('/:id', deleteRoom);

export default router;
