# timetable-engine/src/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models.timetable_models import TimetableRequest, TimetableResponse, SessionModel
from services.database_service import DatabaseService
from services.timetable_generator import TimetableGenerator
import uvicorn

app = FastAPI(title="Timetable Generation Engine")

# CORS middleware to allow requests from Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],  # Node.js backend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db_service = DatabaseService()
timetable_generator = TimetableGenerator()

@app.on_event("startup")
async def startup_event():
    """Connect to database on startup"""
    if not db_service.connect():
        print("⚠️  Database connection failed, but continuing...")
        # Don't raise exception, allow the service to start
        # We'll handle database errors in the endpoints

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    db_status = "connected" if db_service.connection else "disconnected"
    return {
        "status": "healthy", 
        "service": "Timetable Generation Engine",
        "database": db_status
    }

# Remove this line (around line 18):
# timetable_generator = TimetableGenerator()

# And modify the generate_timetable function:
@app.post("/generate-timetable", response_model=TimetableResponse)
async def generate_timetable(request: TimetableRequest):
    """Generate timetable for a given round"""
    try:
        print("📥 Received timetable generation request")
        print(f"Round ID: {request.round_id}")
        print(f"Time slots: {len(request.time_slots)}")
        print(f"Rooms: {len(request.rooms)}")
        print(f"Course assignments: {len(request.course_assignments)}")
        
        # Get data from database (you can remove this if data is coming from Node.js)
        time_slots = request.time_slots
        rooms = request.rooms
        course_assignments = request.course_assignments
        
        if not time_slots or not rooms or not course_assignments:
            return TimetableResponse(
                success=False,
                sessions=[],
                message="No data available for timetable generation"
            )
        
        # Prepare data for generator
        data = {
            'round_id': request.round_id,
            'time_slots': [ts.model_dump() for ts in time_slots],
            'rooms': [r.model_dump() for r in rooms],
            'course_assignments': [ca.model_dump() for ca in course_assignments],
            'days_of_week': request.days_of_week
        }
        
        # Create a new generator instance for each request
        timetable_generator = TimetableGenerator()
        
        # Generate timetable
        sessions = timetable_generator.generate_timetable(data)
        
        return TimetableResponse(
            success=True,
            sessions=sessions,
            message=f"Timetable generated successfully with {len(sessions)} sessions"
        )
        
    except Exception as e:
        print(f"❌ Error in generate_timetable: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return TimetableResponse(
            success=False,
            sessions=[],
            message=f"Error generating timetable: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)