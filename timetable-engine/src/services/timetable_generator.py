# timetable-engine/src/services/timetable_generator.py
from constraint import Problem, AllDifferentConstraint
import random
from typing import List, Dict, Any, Tuple
from models.timetable_models import SessionModel
from collections import defaultdict

class TimetableGenerator:
    def __init__(self):
        self.problem = Problem()
        self.sessions = []
        
    def generate_timetable(self, request_data: Dict[str, Any]) -> List[SessionModel]:
        """
        Generate comprehensive timetable with guaranteed minimum sessions per class
        - Minimum 6 sessions per day per class
        - Minimum 30 sessions per week per class  
        - Full utilization of weekly capacity
        """
        
        # Reset the problem for each generation
        self.problem = Problem()
        self.sessions = []
        
        # Extract data from request
        time_slots = request_data['time_slots']
        rooms = request_data['rooms']
        course_assignments = request_data['course_assignments']
        days_of_week = request_data['days_of_week']
        round_id = request_data['round_id']
        
        print(f"🔧 Starting CAMPUS timetable generation with MINIMUM SESSION REQUIREMENTS:")
        print(f"   - {len(time_slots)} time slots per day")
        print(f"   - {len(rooms)} rooms") 
        print(f"   - {len(course_assignments)} course assignments")
        print(f"   - {len(days_of_week)} days")
        print(f"   - TARGET: 6+ sessions/day & 30+ sessions/week per class")
        
        # Validate input data
        self._validate_input_data(course_assignments, time_slots, rooms, days_of_week)
        
        # Calculate campus capacity and requirements
        daily_slots_per_class = len(time_slots)
        weekly_slots_per_class = len(days_of_week) * daily_slots_per_class
        campus_daily_capacity = len(time_slots) * len(rooms)
        campus_weekly_capacity = len(days_of_week) * campus_daily_capacity
        
        print(f"📊 CAMPUS CAPACITY ANALYSIS:")
        print(f"   - Daily slots per class: {daily_slots_per_class}")
        print(f"   - Weekly slots per class: {weekly_slots_per_class}")
        print(f"   - Campus daily capacity: {campus_daily_capacity} sessions")
        print(f"   - Campus weekly capacity: {campus_weekly_capacity} sessions")
        
        # Use guaranteed scheduling with minimum session requirements
        print("   - Using guaranteed scheduling with minimum session requirements...")
        sessions = self._guaranteed_minimum_scheduling(
            course_assignments, time_slots, rooms, days_of_week, round_id
        )
        
        # Final verification and reporting
        self._report_minimum_requirements_status(sessions, course_assignments, days_of_week, time_slots, rooms)
        
        return sessions
    
    def _validate_input_data(self, assignments: List[Dict[str, Any]], 
                           time_slots: List[Dict[str, Any]], 
                           rooms: List[Dict[str, Any]], 
                           days_of_week: List[int]):
        """Validate input data to ensure all necessary information is present"""
        if not assignments:
            raise ValueError("No course assignments provided")
        if not time_slots:
            raise ValueError("No time slots provided")
        if not rooms:
            raise ValueError("No rooms provided")
        if not days_of_week:
            raise ValueError("No days of week provided")
        
        print(f"   - Validated {len(assignments)} course assignments")
        
        # Debug: Print assignment structure to understand the data format
        if assignments:
            print(f"   - Assignment structure sample: {list(assignments[0].keys())}")
            if 'course' in assignments[0]:
                print(f"   - Course structure sample: {list(assignments[0]['course'].keys())}")
    
    def _guaranteed_minimum_scheduling(self, assignments: List[Dict[str, Any]],
                                     time_slots: List[Dict[str, Any]],
                                     rooms: List[Dict[str, Any]],
                                     days_of_week: List[int],
                                     round_id: int) -> List[SessionModel]:
        """
        Guaranteed scheduling that ensures minimum session requirements:
        - At least 6 sessions per day per class
        - At least 30 sessions per week per class
        - Distributes sessions across all days of the week
        """
        print("   - Starting guaranteed minimum scheduling...")
        
        sessions = []
        
        # Track resources to avoid conflicts - GLOBAL tracking (for the whole week)
        global_used_slots = set()  # (day, time_slot_id, room_id)
        global_lecturer_slots = defaultdict(set)  # lecturer_id -> {(day, time_slot_id)}
        class_daily_count = defaultdict(lambda: defaultdict(int))  # class_id -> day -> count
        class_weekly_count = defaultdict(int)  # class_id -> weekly total
        
        # Group assignments by class for organized scheduling
        class_assignments = defaultdict(list)
        for assignment in assignments:
            class_id = assignment['class_info']['id']
            class_assignments[class_id].append(assignment)
        
        print(f"   - Scheduling {len(class_assignments)} classes with minimum requirements")
        
        # PHASE 1: Schedule ALL DAYS with minimum 6 sessions per day per class
        print("   - PHASE 1: Ensuring minimum 6 sessions per day per class for ALL DAYS...")
        
        # Process each day SEPARATELY with daily resource tracking
        for day in days_of_week:
            print(f"     --- SCHEDULING DAY {day} ---")
            
            # DAILY resource tracking (resets for each day)
            daily_used_slots = set()  # (time_slot_id, room_id) for current day only
            daily_lecturer_slots = defaultdict(set)  # lecturer_id -> {time_slot_id} for current day only
            
            for class_id in class_assignments.keys():
                class_courses = class_assignments[class_id]
                daily_sessions_scheduled = 0
                
                print(f"       - Class {class_id} on Day {day}")
                
                # Schedule 6 sessions for this class on this day
                while daily_sessions_scheduled < 6:
                    if not class_courses:
                        break
                    
                    # Rotate through available courses for this class
                    course_index = daily_sessions_scheduled % len(class_courses)
                    assignment = class_courses[course_index]
                    lecturer_id = assignment['lecturer']['id']
                    
                    slot = self._find_available_slot_for_day(
                        assignment, day, time_slots, rooms,
                        daily_used_slots, daily_lecturer_slots,
                        global_used_slots, global_lecturer_slots
                    )
                    
                    if slot:
                        time_slot_id, room_id = slot
                        session = self._create_session(assignment, day, time_slot_id, room_id, round_id)
                        sessions.append(session)
                        
                        # Update DAILY tracking (for current day conflicts)
                        daily_used_slots.add((time_slot_id, room_id))
                        daily_lecturer_slots[lecturer_id].add(time_slot_id)
                        
                        # Update GLOBAL tracking (for weekly totals and reporting)
                        global_used_slots.add((day, time_slot_id, room_id))
                        global_lecturer_slots[lecturer_id].add((day, time_slot_id))
                        class_daily_count[class_id][day] += 1
                        class_weekly_count[class_id] += 1
                        
                        daily_sessions_scheduled += 1
                        
                        # FIXED: Use safe course name/code access
                        course_name = self._get_course_display_name(assignment)
                        print(f"         - Scheduled session {daily_sessions_scheduled}/6: {course_name} at time slot {time_slot_id}")
                    else:
                        # Try alternative courses for this class
                        found_alternative = False
                        for alt_assignment in class_courses:
                            if alt_assignment == assignment:
                                continue
                            
                            alt_lecturer_id = alt_assignment['lecturer']['id']
                            slot = self._find_available_slot_for_day(
                                alt_assignment, day, time_slots, rooms,
                                daily_used_slots, daily_lecturer_slots,
                                global_used_slots, global_lecturer_slots
                            )
                            
                            if slot:
                                time_slot_id, room_id = slot
                                session = self._create_session(alt_assignment, day, time_slot_id, room_id, round_id)
                                sessions.append(session)
                                
                                # Update DAILY tracking
                                daily_used_slots.add((time_slot_id, room_id))
                                daily_lecturer_slots[alt_lecturer_id].add(time_slot_id)
                                
                                # Update GLOBAL tracking
                                global_used_slots.add((day, time_slot_id, room_id))
                                global_lecturer_slots[alt_lecturer_id].add((day, time_slot_id))
                                class_daily_count[class_id][day] += 1
                                class_weekly_count[class_id] += 1
                                
                                daily_sessions_scheduled += 1
                                
                                # FIXED: Use safe course name/code access
                                alt_course_name = self._get_course_display_name(alt_assignment)
                                print(f"         - Scheduled alternative session {daily_sessions_scheduled}/6: {alt_course_name} at time slot {time_slot_id}")
                                found_alternative = True
                                break
                        
                        if not found_alternative:
                            # If no slots available, move to next class
                            print(f"         - WARNING: No available slots for class {class_id} on day {day}")
                            break
            
            day_session_count = len([s for s in sessions if s.dayOfWeek == day])
            print(f"     --- COMPLETED DAY {day}: {day_session_count} sessions ---")
        
        # PHASE 2: Ensure minimum 30 sessions per week per class
        print("   - PHASE 2: Ensuring minimum 30 sessions per week per class...")
        
        for class_id in class_assignments.keys():
            current_weekly_sessions = class_weekly_count[class_id]
            
            if current_weekly_sessions < 30:
                needed = 30 - current_weekly_sessions
                print(f"     - Class {class_id} needs {needed} more weekly sessions (current: {current_weekly_sessions})")
                
                class_courses = class_assignments[class_id]
                sessions_added = 0
                
                # Distribute additional sessions across all days
                for day in days_of_week:
                    if sessions_added >= needed:
                        break
                    
                    # Create daily tracking for this phase
                    phase_daily_used_slots = set()
                    phase_daily_lecturer_slots = defaultdict(set)
                    
                    for assignment in class_courses:
                        if sessions_added >= needed:
                            break
                        
                        lecturer_id = assignment['lecturer']['id']
                        slot = self._find_available_slot_for_day(
                            assignment, day, time_slots, rooms,
                            phase_daily_used_slots, phase_daily_lecturer_slots,
                            global_used_slots, global_lecturer_slots
                        )
                        
                        if slot:
                            time_slot_id, room_id = slot
                            session = self._create_session(assignment, day, time_slot_id, room_id, round_id)
                            sessions.append(session)
                            
                            # Update tracking
                            phase_daily_used_slots.add((time_slot_id, room_id))
                            phase_daily_lecturer_slots[lecturer_id].add(time_slot_id)
                            global_used_slots.add((day, time_slot_id, room_id))
                            global_lecturer_slots[lecturer_id].add((day, time_slot_id))
                            class_daily_count[class_id][day] += 1
                            class_weekly_count[class_id] += 1
                            
                            sessions_added += 1
                            
                            # FIXED: Use safe course name/code access
                            course_name = self._get_course_display_name(assignment)
                            print(f"       - Added weekly session {sessions_added}/{needed}: {course_name} for day {day}")
        
        # PHASE 3: Fill any remaining capacity
        print("   - PHASE 3: Filling remaining campus capacity...")
        sessions = self._fill_all_remaining_capacity(
            sessions, assignments, time_slots, rooms, days_of_week, round_id,
            global_used_slots, global_lecturer_slots, class_daily_count, class_weekly_count
        )
        
        return sessions
    
    def _get_course_display_name(self, assignment: Dict[str, Any]) -> str:
        """Safely extract course display name from assignment data"""
        try:
            course_data = assignment.get('course', {})
            
            # Try different possible keys for course code/name
            if 'code' in course_data:
                return course_data['code']
            elif 'courseCode' in course_data:
                return course_data['courseCode']
            elif 'name' in course_data:
                return course_data['name']
            elif 'courseName' in course_data:
                return course_data['courseName']
            elif 'id' in course_data:
                return f"Course_{course_data['id']}"
            else:
                return "Unknown_Course"
                
        except Exception as e:
            print(f"Warning: Could not extract course name: {e}")
            return "Unknown_Course"
    
    def _find_available_slot_for_day(self, assignment: Dict[str, Any],
                                   target_day: int,
                                   time_slots: List[Dict[str, Any]],
                                   rooms: List[Dict[str, Any]],
                                   daily_used_slots: set,
                                   daily_lecturer_slots: Dict,
                                   global_used_slots: set,
                                   global_lecturer_slots: Dict) -> Tuple[int, int]:
        """
        Find available slot for an assignment on a SPECIFIC day
        Uses both daily tracking (for same-day conflicts) and global tracking (for lecturer weekly availability)
        """
        lecturer_id = assignment['lecturer']['id']
        
        # Try all time slots and rooms for the target day only
        for time_slot in time_slots:
            for room in rooms:
                # Check DAILY conflicts (room and lecturer on same day)
                daily_slot_key = (time_slot['id'], room['id'])
                lecturer_busy_today = time_slot['id'] in daily_lecturer_slots[lecturer_id]
                
                # Check GLOBAL conflicts (lecturer teaching at same time on different days is OK)
                global_slot_key = (target_day, time_slot['id'], room['id'])
                lecturer_busy_globally = (target_day, time_slot['id']) in global_lecturer_slots[lecturer_id]
                
                # Slot is available if:
                # 1. Room and time slot not used today (daily_used_slots)
                # 2. Lecturer not teaching at this time slot today (daily_lecturer_slots)
                # 3. Room not used globally at this day+time+room (global_used_slots)
                # 4. Lecturer not teaching at this day+time globally (global_lecturer_slots)
                if (daily_slot_key not in daily_used_slots and
                    not lecturer_busy_today and
                    global_slot_key not in global_used_slots and
                    not lecturer_busy_globally):
                    return (time_slot['id'], room['id'])
        
        return None
    
    def _create_session(self, assignment: Dict[str, Any], day: int, 
                      time_slot_id: int, room_id: int, round_id: int) -> SessionModel:
        """Create a session model from assignment data"""
        return SessionModel(
            dayOfWeek=day,
            timeSlotId=time_slot_id,
            courseId=assignment['course']['id'],
            lecturerId=assignment['lecturer']['id'],
            classId=assignment['class_info']['id'],
            roomId=room_id
        )
    
    def _fill_all_remaining_capacity(self, current_sessions: List[SessionModel],
                                   assignments: List[Dict[str, Any]],
                                   time_slots: List[Dict[str, Any]],
                                   rooms: List[Dict[str, Any]],
                                   days_of_week: List[int],
                                   round_id: int,
                                   global_used_slots: set,
                                   global_lecturer_slots: Dict,
                                   class_daily_count: Dict,
                                   class_weekly_count: Dict) -> List[SessionModel]:
        """Fill all remaining campus capacity with additional sessions"""
        sessions = current_sessions.copy()
        campus_weekly_capacity = len(days_of_week) * len(time_slots) * len(rooms)
        
        if len(sessions) >= campus_weekly_capacity:
            print("     - Campus capacity already fully utilized")
            return sessions
        
        remaining_capacity = campus_weekly_capacity - len(sessions)
        print(f"     - Filling {remaining_capacity} remaining campus slots...")
        
        # Group assignments by class
        class_assignments = defaultdict(list)
        for assignment in assignments:
            class_id = assignment['class_info']['id']
            class_assignments[class_id].append(assignment)
        
        # Fill remaining slots with additional sessions for ALL DAYS
        sessions_added = 0
        
        for day in days_of_week:
            print(f"       - Filling capacity for Day {day}...")
            day_sessions_added = 0
            
            # Daily tracking for capacity filling phase
            daily_used_slots = set()
            daily_lecturer_slots = defaultdict(set)
            
            for time_slot in time_slots:
                for room in rooms:
                    if sessions_added >= remaining_capacity:
                        break
                    
                    # Check if this slot is available globally
                    global_slot_key = (day, time_slot['id'], room['id'])
                    if global_slot_key not in global_used_slots:
                        # Find a class and assignment that can use this slot
                        for class_id, class_assigns in class_assignments.items():
                            if not class_assigns:
                                continue
                            
                            # Try all assignments for this class
                            for assignment in class_assigns:
                                lecturer_id = assignment['lecturer']['id']
                                
                                # Check daily and global lecturer availability
                                lecturer_busy_daily = time_slot['id'] in daily_lecturer_slots[lecturer_id]
                                lecturer_busy_global = (day, time_slot['id']) in global_lecturer_slots[lecturer_id]
                                
                                if not lecturer_busy_daily and not lecturer_busy_global:
                                    # Create additional session
                                    session = self._create_session(assignment, day, time_slot['id'], room['id'], round_id)
                                    sessions.append(session)
                                    
                                    # Update tracking
                                    daily_used_slots.add((time_slot['id'], room['id']))
                                    daily_lecturer_slots[lecturer_id].add(time_slot['id'])
                                    global_used_slots.add(global_slot_key)
                                    global_lecturer_slots[lecturer_id].add((day, time_slot['id']))
                                    class_daily_count[class_id][day] += 1
                                    class_weekly_count[class_id] += 1
                                    
                                    sessions_added += 1
                                    day_sessions_added += 1
                                    
                                    # FIXED: Use safe course name access
                                    course_name = self._get_course_display_name(assignment)
                                    print(f"         - Added capacity session: {course_name} on day {day}")
                                    break
                            
                            if sessions_added >= remaining_capacity:
                                break
                    
                    if sessions_added >= remaining_capacity:
                        break
                
                if sessions_added >= remaining_capacity:
                    break
            
            print(f"         -> Added {day_sessions_added} sessions for Day {day}")
            
            if sessions_added >= remaining_capacity:
                break
        
        print(f"     - Added {sessions_added} additional sessions to fill capacity")
        return sessions
    
    def _report_minimum_requirements_status(self, sessions: List[SessionModel],
                                          assignments: List[Dict[str, Any]],
                                          days_of_week: List[int],
                                          time_slots: List[Dict[str, Any]],
                                          rooms: List[Dict[str, Any]]):
        """Report on minimum session requirements achievement"""
        total_sessions = len(sessions)
        total_assignments = len(assignments)
        campus_weekly_capacity = len(days_of_week) * len(time_slots) * len(rooms)
        
        print(f"\n🎉 MINIMUM REQUIREMENTS SCHEDULING REPORT:")
        print(f"   - Campus weekly capacity: {campus_weekly_capacity} sessions")
        print(f"   - Sessions generated: {total_sessions}")
        print(f"   - Courses required: {total_assignments}")
        print(f"   - Campus utilization: {(total_sessions / campus_weekly_capacity * 100):.1f}%")
        
        # Class-by-class analysis with minimum requirements check
        class_sessions = defaultdict(lambda: defaultdict(list))  # class_id -> day -> sessions
        class_weekly_totals = defaultdict(int)
        
        for session in sessions:
            class_sessions[session.classId][session.dayOfWeek].append(session)
            class_weekly_totals[session.classId] += 1
        
        print(f"\n📊 CLASS MINIMUM REQUIREMENTS CHECK:")
        
        all_requirements_met = True
        for class_id, daily_sessions in class_sessions.items():
            weekly_total = class_weekly_totals[class_id]
            
            print(f"   - Class {class_id}:")
            print(f"     * Weekly total: {weekly_total}/30+ sessions", 
                  "✅ MET" if weekly_total >= 30 else "❌ NOT MET")
            
            # Check daily minimums
            daily_requirements_met = True
            for day in days_of_week:
                daily_count = len(daily_sessions.get(day, []))
                status = "✅" if daily_count >= 6 else "❌"
                print(f"     * Day {day}: {daily_count}/6+ sessions {status}")
                if daily_count < 6:
                    daily_requirements_met = False
            
            if weekly_total < 30 or not daily_requirements_met:
                all_requirements_met = False
        
        # Overall status
        if all_requirements_met:
            print(f"\n   🎉 SUCCESS: All minimum requirements met for all classes!")
        else:
            print(f"\n   ⚠️  WARNING: Some minimum requirements not met")
        
        # Daily campus distribution
        print(f"\n📅 CAMPUS DAILY DISTRIBUTION:")
        daily_capacity = len(time_slots) * len(rooms)
        daily_totals = defaultdict(int)
        
        for session in sessions:
            daily_totals[session.dayOfWeek] += 1
        
        for day in days_of_week:
            count = daily_totals.get(day, 0)
            utilization = (count / daily_capacity) * 100
            print(f"   - Day {day}: {count}/{daily_capacity} slots ({utilization:.1f}%)")