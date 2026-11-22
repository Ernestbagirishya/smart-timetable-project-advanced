import axios from 'axios';
import type { DepartmentCreateInput, DepartmentUpdateInput, Department } from '../types';

export const BACKEND_BASE_URL = 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Backend URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Adding auth token to request');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No auth token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      error: error.message
    });

    if (error.response?.status === 401) {
      // Token expired or invalid
      console.warn('Unauthorized response, clearing token and redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
};

// Department API
export const departmentAPI = {
  getAllDepartments: () => api.get<Department[]>('/departments'),
  getPublicDepartments: () => api.get<Department[]>('/public/departments'),
  getDepartmentById: (id: number) => api.get<Department>(`/departments/${id}`),
  createDepartment: (data: DepartmentCreateInput) => api.post('/departments', data),
  updateDepartment: (id: number, data: DepartmentUpdateInput) => api.put(`/departments/${id}`, data),
  deleteDepartment: (id: number) => api.delete(`/departments/${id}`),
};

// HOD API
export const hodAPI = {
  getAllHods: () => api.get('/hods'),
  createHod: (data: any) => api.post('/hods', data),
  updateHod: (id: number, data: any) => api.put(`/hods/${id}`, data),
  deleteHod: (id: number) => api.delete(`/hods/${id}`),
};

// Course API
export const courseAPI = {
  getDepartmentCourses: () => api.get('/courses'),
  create: (data: any) => api.post('/courses', data),
  update: (id: number, data: any) => api.put(`/courses/${id}`, data),
  delete: (id: number) => api.delete(`/courses/${id}`),
};

// Lecturer API
export const lecturerAPI = {
  getDepartmentLecturers: () => api.get('/lecturers'),
  create: (data: any) => api.post('/lecturers', data),
  update: (lecturerId: number, data: any) =>
    api.put(`/lecturers/${lecturerId}`, data),
  delete: (lecturerId: number) => api.delete(`/lecturers/${lecturerId}`),
  getAvailable: () => api.get('/lecturers/available'),
};

// Class API
export const classAPI = {
  getDepartmentClasses: () => api.get('/classes'),
  getAllClasses: () => api.get('/classes/all'),
  create: (data: any) => api.post('/classes', data),
  update: (id: number, data: any) => api.put(`/classes/${id}`, data),
  delete: (id: number) => api.delete(`/classes/${id}`),
  getClassesByDepartment: (departmentId: number) => api.get(`/classes/department/${departmentId}`),
  getPublicClassesByDepartment: (departmentId: number) => api.get(`/public/classes/department/${departmentId}`),
};

// Assignment API
export const assignmentAPI = {
  getDepartmentAssignments: () => api.get('/assignments'),
  create: (data: any) => api.post('/assignments', data),
  delete: (id: number) => api.delete(`/assignments/${id}`),
  getMyAssignments: () => api.get('/assignments/my-assignments'),
};

// Timetable API
export const timetableAPI = {
  generate: (roundId: number) => api.post(`/timetable/generate/${roundId}`),
  getSessions: (roundId: number) => api.get(`/timetable/sessions/${roundId}`),
  deleteSessions: (roundId: number) =>
    api.delete(`/timetable/sessions/${roundId}`),
  getLecturerTimetable: (roundId: number) =>
    api.get(`/timetable/lecturer/${roundId}`),
  getClassTimetable: (roundId: number, classId: number) =>
    api.get(`/timetable/class/${roundId}/${classId}`),
};

// Dashboard API
export const dashboardAPI = {
  getManagerDashboard: () => api.get('/dashboard/manager'),
  getAllCourses: () => api.get('/dashboard/manager/courses'),
  getHodDashboard: () => api.get('/dashboard/hod'),
  getLecturerDashboard: () => api.get('/dashboard/lecturer'),
  getLecturerCourses: () => api.get('/dashboard/lecturer/courses'),
};

// Student API
export const studentAPI = {
  register: (data: any) => api.post('/students/register', data),
  getStudents: () => api.get('/students'),
  update: (studentId: number, data: any) =>
    api.put(`/students/${studentId}`, data),
  getTimetable: (studentId: number, roundId: number) =>
    api.get(`/students/${studentId}/timetable/${roundId}`),
  getMyCourses: () => api.get('/students/my-courses'),
};

// CAT API
export const catAPI = {
  create: (data: any) => api.post('/cat-plans', data),
  getAll: () => api.get('/cat-plans/all'),
  getMyPlans: () => api.get('/cat-plans/my-plans'),
  getStudentCatPlans: () => api.get('/cat-plans/student'),
  getPending: () => api.get('/cat-plans/pending'),
  approve: (id: number) => api.post(`/cat-plans/${id}/approve`),
  reject: (id: number) => api.post(`/cat-plans/${id}/reject`),
  update: (id: number, data: any) => api.put(`/cat-plans/${id}`, data),
  delete: (id: number) => api.delete(`/cat-plans/${id}`),
};

export const specialCaseAPI = {
  create: (data: any) => api.post('/special-cases', data),
  getMyCases: () => api.get('/special-cases/my-cases'),
  getCourseCases: (courseId: number) =>
    api.get(`/special-cases/course/${courseId}`),
  getDepartmentCases: () => api.get('/special-cases/department'),
  approve: (id: number) => api.post(`/special-cases/${id}/approve`),
  reject: (id: number) => api.post(`/special-cases/${id}/reject`),
  update: (id: number, data: any) => api.put(`/special-cases/${id}`, data),
  delete: (id: number) => api.delete(`/special-cases/${id}`),
};

// Resource API
export const resourceAPI = {
  upload: (formData: FormData) => api.post('/resources/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  create: (data: any) => api.post('/resources', data),
  getMyResources: () => api.get('/resources/my-resources'),
  getCourseResources: (courseId: number, classId: number) =>
    api.get(`/resources/course/${courseId}/class/${classId}`),
  getStudentResources: () => api.get('/resources/student/my-resources'),
  delete: (id: number) => api.delete(`/resources/${id}`),
};

// Round API
export const roundAPI = {
  getAll: () => api.get('/rounds'),
  create: (data: any) => api.post('/rounds', data),
  setActive: (id: number) => api.post(`/rounds/${id}/activate`),
  deactivate: (id: number) => api.post(`/rounds/${id}/deactivate`),
};

// Room API
export const roomAPI = {
  getAll: () => api.get('/rooms'),
  create: (data: any) => api.post('/rooms', data),
  update: (id: number, data: any) => api.put(`/rooms/${id}`, data),
  delete: (id: number) => api.delete(`/rooms/${id}`),
};

// Timeslot API
export const timeslotAPI = {
  getAll: () => api.get('/timeslots'),
  create: (data: any) => api.post('/timeslots', data),
  update: (id: number, data: any) => api.put(`/timeslots/${id}`, data),
  delete: (id: number) => api.delete(`/timeslots/${id}`),
};

export default api;
