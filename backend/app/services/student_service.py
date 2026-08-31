from datetime import datetime

from app.database import students_collection


def create_student(student):
    """
    Create a new student in MongoDB.
    """

    student_data = student.model_dump()

    # Check if student already exists
    existing_student = students_collection.find_one(
        {"student_id": student_data["student_id"]}
    )

    if existing_student:
        raise ValueError("Student already exists")

    # Automatically add creation time
    student_data["created_at"] = datetime.utcnow()

    # Insert student into MongoDB
    result = students_collection.insert_one(student_data)

    # Return the inserted student ID as a string
    student_data["_id"] = str(result.inserted_id)

    return student_data


def get_students():
    """
    Get all students from MongoDB.
    """

    students = list(students_collection.find())

    return students


def get_student_by_id(student_id):
    """
    Get one student using student_id.
    """

    student = students_collection.find_one(
        {"student_id": student_id}
    )

    return student
