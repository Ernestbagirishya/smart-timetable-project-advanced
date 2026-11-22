# timetable-engine/src/models/timetable_models.py
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class TimeSlotModel(BaseModel):
    id: int
    name: str
    startTime: str  # Will be in "HH:MM:SS" format
    endTime: str

class RoomModel(BaseModel):
    id: int
    roomId: str
    roomName: str

class CourseModel(BaseModel):
    id: int
    courseCode: str
    courseName: str
    type: str  # "CORE" or "GENERAL"

class LecturerModel(BaseModel):
    id: int
    fullName: str

class ClassModel(BaseModel):
    id: int
    name: str
    year: int

class CourseAssignmentModel(BaseModel):
    course: CourseModel
    lecturer: LecturerModel
    class_info: ClassModel = Field(alias="class")  # Map JSON "class" to "class_info"

class TimetableRequest(BaseModel):
    round_id: int
    time_slots: List[TimeSlotModel]
    rooms: List[RoomModel]
    course_assignments: List[CourseAssignmentModel]
    days_of_week: List[int] = [1, 2, 3, 4, 5]  # Monday to Friday (0-4)

class SessionModel(BaseModel):
    dayOfWeek: int
    timeSlotId: int
    courseId: int
    lecturerId: int
    classId: int
    roomId: int

class TimetableResponse(BaseModel):
    success: bool
    sessions: List[SessionModel]
    message: Optional[str] = None
    conflicts: Optional[List[Dict]] = None

# Enable both alias and field name access
CourseAssignmentModel.update_forward_refs()