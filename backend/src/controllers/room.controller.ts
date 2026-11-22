// backend/src/controllers/room.controller.ts
import { Request, Response } from 'express';
import prisma from '../utils/database';
import { roomCreateSchema } from '../schemas/room';

export const getAllRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { roomId: 'asc' }
    });
    res.json(rooms);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createRoom = async (req: Request, res: Response) => {
  try {
    // 1. Validate input data
    const parsedData = roomCreateSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Invalid input data', errors: parsedData.error });
    }

    const { roomId, roomName } = parsedData.data;

    // 2. Check if room already exists
    const existingRoom = await prisma.room.findUnique({
      where: { roomId },
    });

    if (existingRoom) {
      return res.status(409).json({ message: 'Room with this ID already exists' });
    }

    // 3. Create the room
    const room = await prisma.room.create({
      data: { roomId, roomName },
    });

    res.status(201).json({
      message: 'Room created successfully',
      room,
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateRoom = async (req: Request, res: Response) => {
  try {
    const roomId = req.params.id;

    // 1. Validate input data
    const parsedData = roomCreateSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Invalid input data', errors: parsedData.error });
    }

    const { roomId: newRoomId, roomName } = parsedData.data;

    // 2. Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id: parseInt(roomId) },
    });

    if (!existingRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // 3. Check if new roomId conflicts with another room (if changed)
    if (newRoomId !== existingRoom.roomId) {
      const conflictRoom = await prisma.room.findUnique({
        where: { roomId: newRoomId },
      });

      if (conflictRoom) {
        return res.status(409).json({ message: 'Room with this ID already exists' });
      }
    }

    // 4. Update the room
    const updatedRoom = await prisma.room.update({
      where: { id: parseInt(roomId) },
      data: { roomId: newRoomId, roomName },
    });

    res.json({
      message: 'Room updated successfully',
      room: updatedRoom,
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const roomId = req.params.id;

    // 1. Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id: parseInt(roomId) },
    });

    if (!existingRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // 2. Delete the room
    await prisma.room.delete({
      where: { id: parseInt(roomId) },
    });

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
