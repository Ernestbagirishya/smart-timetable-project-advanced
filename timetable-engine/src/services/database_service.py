# timetable-engine/src/services/database_service.py
import psycopg2
import os
from typing import List, Dict, Any  # Add this import

class DatabaseService:
    def __init__(self):
        self.connection = None
        
    def connect(self):
        """Connect to PostgreSQL database"""
        try:
            # Try to get password from environment variable, fallback to hardcoded
            db_password = os.getenv("DB_PASSWORD", "ernest2002?")
            
            print(f"🔑 Attempting to connect with password: {db_password[:5]}...")  # Show first 5 chars
            
            self.connection = psycopg2.connect(
                host="localhost",
                database="smart_timetable",
                user="postgres",
                password=db_password,
                port=5432
            )
            print("✅ Connected to database successfully")
            return True
        except Exception as e:
            print(f"❌ Database connection error: {e}")
            return False

    def get_time_slots(self, round_id: int) -> List[Dict[str, Any]]:
        """Get all time slots for timetable generation"""
        query = """
        SELECT id, name, "startTime", "endTime" 
        FROM time_slots 
        ORDER BY "startTime"
        """
        return self._execute_query(query)

    def get_rooms(self) -> List[Dict[str, Any]]:
        """Get all available rooms"""
        query = 'SELECT id, "roomId", "roomName" FROM rooms ORDER BY "roomId"'
        return self._execute_query(query)

    def get_course_assignments(self, round_id: int) -> List[Dict[str, Any]]:
        """Get all course assignments for timetable generation"""
        query = """
        SELECT 
            ca.id,
            c.id as course_id, c."courseCode", c."courseName", c.type,
            u.id as lecturer_id, u."fullName" as lecturer_name,
            cls.id as class_info_id, cls.name as class_info_name, cls.year as class_info_year
        FROM course_assignments ca
        JOIN courses c ON ca."courseId" = c.id
        JOIN users u ON ca."lecturerId" = u.id
        JOIN classes cls ON ca."classId" = cls.id
        """
        return self._execute_query(query)

    def get_existing_sessions(self, round_id: int) -> List[Dict[str, Any]]:
        """Get existing sessions for the round to avoid conflicts"""
        query = """
        SELECT "dayOfWeek", "timeSlotId", "courseId", "lecturerId", "classId", "roomId"
        FROM sessions WHERE "roundId" = %s
        """
        return self._execute_query(query, (round_id,))

    def _execute_query(self, query: str, params: tuple = None) -> List[Dict[str, Any]]:
        """Execute a query and return results as list of dictionaries"""
        try:
            if not self.connection:
                print("❌ Database not connected")
                return []
                
            with self.connection.cursor() as cursor:
                cursor.execute(query, params or ())
                columns = [desc[0] for desc in cursor.description]
                results = []
                for row in cursor.fetchall():
                    results.append(dict(zip(columns, row)))
                return results
        except Exception as e:
            print(f"❌ Query execution error: {e}")
            print(f"Query: {query}")
            print(f"Params: {params}")
            return []