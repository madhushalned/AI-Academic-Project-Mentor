from datetime import datetime, timezone

from app.database import students_collection


def create_student(student):
    """
    Create a new student in MongoDB.
    """

    # Check whether student_id already exists
    existing_student = students_collection.find_one(
        {"student_id": student.student_id}
    )

    if existing_student:
        raise ValueError(
            f"Student with student_id '{student.student_id}' already exists"
        )

    student_data = student.model_dump()

    # Automatically generate creation timestamp
    student_data["created_at"] = datetime.now(timezone.utc)

    result = students_collection.insert_one(student_data)

    # Return the inserted document
    created_student = students_collection.find_one(
        {"_id": result.inserted_id}
    )

    return created_student


def get_students():
    """
    Get all students from MongoDB.
    """

    return list(students_collection.find())


def get_student_by_id(student_id: str):
    """
    Get one student using student_id.
    """

    return students_collection.find_one(
        {"student_id": student_id}
    )