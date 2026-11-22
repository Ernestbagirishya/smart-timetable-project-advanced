// backend/src/controllers/timeslot.controller.ts
import { Request, Response } from 'express';
import prisma from '../utils/database';
import { timeSlotCreateSchema } from '../schemas/timeslot';

export const getAllTimeSlots = async (req: Request, res: Response) => {
  try {
    const timeSlots = await prisma.timeSlot.findMany({
      orderBy: { startTime: 'asc' }
    });
    res.json(timeSlots);
  } catch (error) {
    console.error('Get time slots error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createTimeSlot = async (req: Request, res: Response) => {
  try {
    const parsedData = timeSlotCreateSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Invalid input data', errors: parsedData.error.issues });
    }

    const { name, startTime, endTime } = parsedData.data;

    // Check if time slot name already exists
    const existingSlot = await prisma.timeSlot.findUnique({
      where: { name },
    });

    if (existingSlot) {
      return res.status(409).json({ message: 'Time slot with this name already exists' });
    }

    const timeSlot = await prisma.timeSlot.create({
      data: {
        name,
        startTime: new Date(`1970-01-01T${startTime}`), // Use arbitrary date, we only care about time
        endTime: new Date(`1970-01-01T${endTime}`),
      },
    });

    res.status(201).json({
      message: 'Time slot created successfully',
      timeSlot,
    });
  } catch (error) {
    console.error('Create time slot error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};