// backend/src/services/pythonApi.service.ts
import axios from 'axios';

const PYTHON_API_URL = 'http://localhost:8000';

export class PythonApiService {
  private client;

  constructor() {
    this.client = axios.create({
      baseURL: PYTHON_API_URL,
      timeout: 30000, // 30 seconds timeout for generation
    });
  }

  async generateTimetable(roundId: number, timeSlots: any[], rooms: any[], courseAssignments: any[]): Promise<any> {
    try {
        const requestData = {
            round_id: roundId,
            time_slots: timeSlots,
            rooms: rooms,
            course_assignments: courseAssignments,
            days_of_week: [1, 2, 3, 4, 5] // Monday to Friday
        };
        
        console.log('📤 Sending data to Python service:');
        console.log('Time slots sample:', timeSlots.slice(0, 2)); // First 2 time slots
        console.log('Rooms sample:', rooms.slice(0, 2)); // First 2 rooms
        console.log('Course assignments sample:', courseAssignments.slice(0, 2)); // First 2 assignments
        
        const response = await this.client.post('/generate-timetable', requestData);
        
        console.log('✅ Python service response:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Python API error details:', error.response?.data);
        throw new Error(`Timetable generation failed: ${error.response?.data?.detail || error.message}`);
    }
}

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('Python service health check failed:', error);
      return false;
    }
  }
}

export const pythonApiService = new PythonApiService();