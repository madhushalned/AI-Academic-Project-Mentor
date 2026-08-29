from connection import get_db

db = get_db()
db.students.insert_one({"student_id": "TEST001", "name": "Test Student"})
print("Connection successful:", db.students.find_one({"student_id": "TEST001"}))