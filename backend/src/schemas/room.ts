// backend/src/schemas/room.ts
import { z } from 'zod';

// Schema for creating a room
export const roomCreateSchema = z.object({
  roomId: z.string().min(1, 'Room ID is required'),
  roomName: z.string().min(1, 'Room name is required'),
});

// TypeScript type inferred from the schema
export type RoomCreateInput = z.infer<typeof roomCreateSchema>;