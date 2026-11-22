import psycopg2
import os

def check_table_columns(table_name):
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="smart_timetable",
            user="postgres",
            password="ernest2002?",  # Your password
            port=5432
        )
        
        cursor = conn.cursor()
        cursor.execute(f"""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = '{table_name}'
            ORDER BY ordinal_position;
        """)
        
        print(f"\n{table_name} columns:")
        for row in cursor.fetchall():
            print(f"  {row[0]} ({row[1]})")
            
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

# Check important tables
check_table_columns('time_slots')
check_table_columns('rooms')
check_table_columns('course_assignments')
check_table_columns('sessions')