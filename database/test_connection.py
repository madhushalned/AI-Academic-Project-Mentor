from connection import get_db

db = get_db()
# Clean up any leftover test document
db.students.delete_many({"student_id": "TEST001"})

# Insert with required schema fields (student_id, name, email)
db.students.insert_one({
    "student_id": "TEST001",
    "name": "Test Student",
    "email": "test.student001@example.com"
})

doc = db.students.find_one({"student_id": "TEST001"})
print("Connection successful:", doc.get("name") if doc else None)

# Clean up
db.students.delete_many({"student_id": "TEST001"})