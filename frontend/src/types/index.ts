// Types based on backend Prisma schema

export interface User {
  id: number;
  username: string;
  password?: string; // Not returned in responses
  fullName: string;
  email: string;
  registrationNumber?: string;
  role: 'TIMETABLE_MANAGER' | 'HOD' | 'LECTURER' | 'STUDENT';
  departmentId?: number;
  classId?: number;
  createdAt: string;
  updatedAt: string;
  department?: Department;
  class?: Class;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  departmentType: 'PUBLIC' | 'PRIVATE';
  hodId?: number;
  hod?: {
    id: number;
    fullName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  _count?: {
    students: number;
    lecturers: number;
    classes: number;
    courses: number;
  };
  classes?: Class[];
  courses?: Course[];
  lecturers?: User[];
  students?: User[];
}

export interface Class {
  id: number;
  name: string;
  year: number;
  departmentId: number;
  department: Department;
  createdAt: string;
  updatedAt: string;
  students: User[];
  courses: Course[];
  courseAssignments: CourseAssignment[];
  sessions: Session[];
  catPlans: CATPlan[];
  resources: Resource[];
}

export interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  credits: number;
  type: 'CORE' | 'GENERAL';
  departmentId: number;
  department: Department;
  createdAt: string;
  updatedAt: string;
  classes: Class[];
  assignments: CourseAssignment[];
  sessions: Session[];
  catPlans: CATPlan[];
  specialCases: SpecialCase[];
  resources: Resource[];
}

export interface CourseAssignment {
  id: number;
  courseId: number;
  lecturerId: number;
  classId: number;
  course: Course;
  lecturer: User;
  class: Class;
}

export interface Room {
  id: number;
  roomId: string;
  roomName: string;
  sessions: Session[];
}

export interface TimeSlot {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  sessions: Session[];
}

export interface Round {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  sessions: Session[];
  _count?: {
    sessions: number;
  };
}

export interface CATPlan {
  id: number;
  courseId: number;
  classId: number;
  lecturerId: number;
  title: string;
  description?: string;
  maxMarks: number;
  dueDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  course: Course;
  class: Class;
  lecturer: User;
}

export interface SpecialCase {
  id: number;
  studentId: number;
  courseId: number;
  type: 'RETAKE' | 'SPECIAL' | 'REASSESSMENT';
  description: string;
  evidence?: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  student: User;
  course: Course;
}

export interface Session {
  id: number;
  dayOfWeek: number;
  roundId: number;
  timeSlotId: number;
  courseId: number;
  lecturerId: number;
  classId: number;
  roomId: number;
  round: Round;
  timeSlot: TimeSlot;
  course: Course;
  lecturer: User;
  class: Class;
  room: Room;
}

export interface Resource {
  id: number;
  courseId: number;
  classId: number;
  lecturerId: number;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: 'PDF' | 'DOCUMENT' | 'SLIDES' | 'VIDEO' | 'OTHER';
  createdAt: string;
  updatedAt: string;
  course: Course;
  class: Class;
  lecturer: User;
}

// API Response types
export interface ApiResponse<T> {
  message: string;
  data?: T;
  user?: User;
  token?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: 'TIMETABLE_MANAGER' | 'HOD' | 'LECTURER' | 'STUDENT';
  departmentId?: number;
  classId?: number;
}

export interface DashboardData {
  totalDepartments: number;
  totalLecturers: number;
  totalHods: number;
  totalStudents: number;
  totalCourses: number;
  totalRooms: number;
  totalClasses: number;
  activeRounds: number;
  generatedTimetables: number;
  recentActivity: {
    id: number;
    description: string;
    time: string;
  }[];
  systemStats: {
    activeTimetables: number;
    pendingAssignments: number;
    completedRounds: number;
  };
}

export interface DepartmentCreateInput {
  name: string;
  code: string;
  departmentType: 'PUBLIC' | 'PRIVATE';
}

export interface DepartmentUpdateInput {
  name?: string;
  code?: string;
  departmentType?: 'PUBLIC' | 'PRIVATE';
}
