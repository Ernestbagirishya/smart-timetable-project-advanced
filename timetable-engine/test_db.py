# timetable-engine/test_db.py
import psycopg2

try:
    connection = psycopg2.connect(
        host="localhost",
        database="smart_timetable", 
        user="postgres",
        password="ernest2002?",  # Your real password
        port=5432
    )
    print("✅ Database connection successful!")
    connection.close()
except Exception as e:
    print(f"❌ Database connection failed: {e}")