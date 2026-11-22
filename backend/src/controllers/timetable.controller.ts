// backend/src/controllers/timetable.controller.ts
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import prisma from '../utils/database';
import { pythonApiService } from '../services/pythonApi.service';

export const generateTimetable = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const roundId = parseInt(req.params.roundId);
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

        // Check if timetable already exists for this round
        const existingSessions = await prisma.session.findMany({
            where: { roundId },
        });

        if (existingSessions.length > 0) {
            return res.status(409).json({ 
                message: 'Timetable already exists for this round. Delete existing sessions first.' 
            });
        }

        // Check Python service health
        const isHealthy = await pythonApiService.healthCheck();
        if (!isHealthy) {
            return res.status(503).json({ message: 'Timetable generation service is unavailable' });
        }

        console.log('🚀 Starting timetable generation for round:', roundId);

        // Get all necessary data from database
        const timeSlots = await prisma.timeSlot.findMany({
            orderBy: { startTime: 'asc' }
        });

        const rooms = await prisma.room.findMany({
            orderBy: { roomId: 'asc' }
        });

        const courseAssignments = await prisma.courseAssignment.findMany({
            include: {
                course: true,
                lecturer: true,
                class: true
            }
        });

// Format the data for Python service
// Format the data for Python service
const formattedTimeSlots = timeSlots.map(slot => {
    // Convert Date objects to HH:MM:SS strings
    const formatTime = (date: Date) => {
        return date.toTimeString().split(' ')[0]; // Gets "HH:MM:SS"
    };
    
    return {
        id: slot.id,
        name: slot.name,
        startTime: formatTime(slot.startTime),
        endTime: formatTime(slot.endTime)
    };
});

        const formattedRooms = rooms.map(room => ({
            id: room.id,
            roomId: room.roomId,
            roomName: room.roomName
        }));

        const formattedCourseAssignments = courseAssignments.map(ca => ({
            course: {
                id: ca.course.id,
                courseCode: ca.course.courseCode,
                courseName: ca.course.courseName,
                type: ca.course.type
            },
            lecturer: {
                id: ca.lecturer.id,
                fullName: ca.lecturer.fullName
            },
            class: {
                id: ca.class.id,
                name: ca.class.name,
                year: ca.class.year
            }
        }));

        console.log('📊 Data prepared:', {
            timeSlots: formattedTimeSlots.length,
            rooms: formattedRooms.length,
            courseAssignments: formattedCourseAssignments.length
        });

        // Call Python service to generate timetable
        const result = await pythonApiService.generateTimetable(
            roundId, 
            formattedTimeSlots, 
            formattedRooms, 
            formattedCourseAssignments
        );

        if (!result.success) {
            return res.status(400).json({ 
                message: result.message || 'Timetable generation failed',
                conflicts: result.conflicts 
            });
        }

        // Save generated sessions to database
        const sessions = await prisma.session.createMany({
            data: result.sessions.map((session: any) => ({
                dayOfWeek: session.dayOfWeek,
                timeSlotId: session.timeSlotId,
                courseId: session.courseId,
                lecturerId: session.lecturerId,
                classId: session.classId,
                roomId: session.roomId,
                roundId: roundId,
            })),
            skipDuplicates: true,
        });

        console.log('✅ Timetable generated successfully. Sessions created:', sessions.count);

        res.json({
            message: `Timetable generated successfully with ${sessions.count} sessions`,
            sessionsCount: sessions.count,
            generatedData: result,
        });
    } catch (error: any) {
        console.error('Generate timetable error:', error);
        res.status(500).json({ 
            message: error.message || 'Internal server error during timetable generation' 
        });
    }
};

export const getTimetableSessions = async (req: Request, res: Response) => {
  try {
    const roundId = parseInt(req.params.roundId);
    if (isNaN(roundId)) {
      return res.status(400).json({ message: 'Invalid round ID' });
    }

    const sessions = await prisma.session.findMany({
      where: { roundId },
      include: {
        timeSlot: true,
        course: { select: { courseCode: true, courseName: true } },
        lecturer: { select: { fullName: true } },
        class: { select: { name: true } },
        room: { select: { roomId: true, roomName: true } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { timeSlot: { startTime: 'asc' } }],
    });

    res.json(sessions);
  } catch (error) {
    console.error('Get timetable sessions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteTimetableSessions = async (req: Request, res: Response) => {
  try {
    const roundId = parseInt(req.params.roundId);
    if (isNaN(roundId)) {
      return res.status(400).json({ message: 'Invalid round ID' });
    }

    const deletedCount = await prisma.session.deleteMany({
      where: { roundId },
    });

    res.json({
      message: `Deleted ${deletedCount.count} sessions for round ${roundId}`,
      deletedCount: deletedCount.count,
    });
  } catch (error) {
    console.error('Delete timetable sessions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};






export const getLecturerTimetable = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const lecturerId = req.user.userId;
        const roundId = parseInt(req.params.roundId);
        
        if (isNaN(roundId)) {
            return res.status(400).json({ message: 'Invalid round ID' });
        }

        const sessions = await prisma.session.findMany({
            where: { 
                roundId,
                lecturerId 
            },
            include: {
                timeSlot: true,
                course: { select: { courseCode: true, courseName: true } },
                class: { select: { name: true } },
                room: { select: { roomId: true, roomName: true } },
            },
            orderBy: [{ dayOfWeek: 'asc' }, { timeSlot: { startTime: 'asc' } }],
        });

        res.json(sessions);
    } catch (error) {
        console.error('Get lecturer timetable error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



export const getClassTimetable = async (req: Request, res: Response) => {
    try {
        const classId = parseInt(req.params.classId);
        const roundId = parseInt(req.params.roundId);
        
        if (isNaN(roundId) || isNaN(classId)) {
            return res.status(400).json({ message: 'Invalid round ID or class ID' });
        }

        const sessions = await prisma.session.findMany({
            where: { 
                roundId,
                classId 
            },
            include: {
                timeSlot: true,
                course: { select: { courseCode: true, courseName: true } },
                lecturer: { select: { fullName: true } },
                room: { select: { roomId: true, roomName: true } },
            },
            orderBy: [{ dayOfWeek: 'asc' }, { timeSlot: { startTime: 'asc' } }],
        });

        res.json(sessions);
    } catch (error) {
        console.error('Get class timetable error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};