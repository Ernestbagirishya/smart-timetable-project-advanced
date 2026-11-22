// backend/src/server.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Import routes
import authRoutes from './routes/auth';
import publicRoutes from './routes/public';
import departmentRoutes from './routes/department'; // <- Add this import
import roomRoutes from './routes/room';             // <- Add this import
import courseRoutes from './routes/course';
import lecturerRoutes from './routes/lecturer';
import classRoutes from './routes/class';
import assignmentRoutes from './routes/assignment';
import roundRoutes from './routes/round';
import timeslotRoutes from './routes/timeslot';
import timetableRoutes from './routes/timetable';
import studentRoutes from './routes/student';
import catRoutes from './routes/cat';
import specialCaseRoutes from './routes/specialCase';
import resourceRoutes from './routes/resource';
import path from 'path';
// New import for HOD routes
import dashboardRoutes from './routes/dashboard';
import hodRoutes from './routes/hod';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5175', 'http://127.0.0.1:5173'],
  credentials: true,
  allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'Origin', 'X-Requested-With'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));
app.use(express.json());

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ message: 'Smart Timetable Server is running!' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/departments', departmentRoutes); // <- Add this line
app.use('/api/rooms', roomRoutes);             // <- Add this line
app.use('/api/courses', courseRoutes);
app.use('/api/lecturers', lecturerRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/rounds', roundRoutes);
app.use('/api/timeslots', timeslotRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/cat-plans', catRoutes);
app.use('/api/special-cases', specialCaseRoutes);
// Routes for resources API
app.use('/api/resources', resourceRoutes);

// Serve uploaded files - this should come after the API routes
// Serve all uploaded files through a common endpoint
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Add HOD routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/hods', hodRoutes);




// Catch-all 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});