from datetime import datetime

import bcrypt

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

    # Hash password before storing it
    password = student_data.pop("password")
    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    student_data["password"] = hashed_password

    # Automatically add creation time
    student_data["created_at"] = datetime.utcnow()

    # Insert student into MongoDB
    result = students_collection.insert_one(student_data)

    # Return inserted student without exposing password
    student_data["_id"] = str(result.inserted_id)
    student_data.pop("password", None)

    return student_data


def get_students():
    """
    Get all students from MongoDB.
    """

    students = list(
        students_collection.find(
            {},
            {"password": 0}
        )
    )

    return students


def get_student_by_id(student_id):
    """
    Get one student using student_id.
    """

    student = students_collection.find_one(
        {"student_id": student_id},
        {"password": 0}
    )

    return student


def login_student(email, password):
    """
    Authenticate a student using email and password.
    """

    student = students_collection.find_one(
        {"email": email}
    )

    if student is None:
        return None

    stored_password = student.get("password")

    if not stored_password:
        return None

    password_valid = bcrypt.checkpw(
        password.encode("utf-8"),
        stored_password.encode("utf-8")
    )

    if not password_valid:
        return None

    student.pop("password", None)

    if "_id" in student:
        student["_id"] = str(student["_id"])

    return student