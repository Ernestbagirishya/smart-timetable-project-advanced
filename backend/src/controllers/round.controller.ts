// backend/src/controllers/round.controller.ts
import { Request, Response } from 'express';
import prisma from '../utils/database';
import { roundCreateSchema } from '../schemas/round';

export const getAllRounds = async (req: Request, res: Response) => {
  try {
    const rounds = await prisma.round.findMany({
      orderBy: { startDate: 'desc' },
      include: {
        _count: {
          select: { sessions: true }
        }
      }
    });
    res.json(rounds);
  } catch (error) {
    console.error('Get rounds error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createRound = async (req: Request, res: Response) => {
  try {
    const parsedData = roundCreateSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Invalid input data', errors: parsedData.error.issues });
    }

    const { name, startDate, endDate } = parsedData.data;

    // Check if round name already exists
    const existingRound = await prisma.round.findUnique({
      where: { name },
    });

    if (existingRound) {
      return res.status(409).json({ message: 'Round with this name already exists' });
    }

    const round = await prisma.round.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    res.status(201).json({
      message: 'Round created successfully',
      round,
    });
  } catch (error) {
    console.error('Create round error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const setActiveRound = async (req: Request, res: Response) => {
  try {
    const roundId = parseInt(req.params.id);
    if (isNaN(roundId)) {
      return res.status(400).json({ message: 'Invalid round ID' });
    }

    // Check if round exists
    const round = await prisma.round.findUnique({
      where: { id: roundId },
    });

    if (!round) {
      return res.status(404).json({ message: 'Round not found' });
    }

    // Set all rounds to inactive
    await prisma.round.updateMany({
      data: { isActive: false },
    });

    // Set the selected round to active
    const activeRound = await prisma.round.update({
      where: { id: roundId },
      data: { isActive: true },
    });

    res.json({
      message: 'Round activated successfully',
      round: activeRound,
    });
  } catch (error) {
    console.error('Set active round error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deactivateRound = async (req: Request, res: Response) => {
  try {
    const roundId = parseInt(req.params.id);
    if (isNaN(roundId)) {
      return res.status(400).json({ message: 'Invalid round ID' });
    }

    // Check if round exists
    const round = await prisma.round.findUnique({
      where: { id: roundId },
    });

    if (!round) {
      return res.status(404).json({ message: 'Round not found' });
    }

    // Set the selected round to inactive
    const inactiveRound = await prisma.round.update({
      where: { id: roundId },
      data: { isActive: false },
    });

    res.json({
      message: 'Round deactivated successfully',
      round: inactiveRound,
    });
  } catch (error) {
    console.error('Deactivate round error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
