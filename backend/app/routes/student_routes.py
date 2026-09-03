from fastapi import APIRouter, HTTPException

from app.schemas.student_schema import StudentCreate
from app.services.student_service import (
    create_student,
    get_students,
    get_student_by_id
)

router = APIRouter(
    prefix="/students",
    tags=["Students"]
)


@router.post("/")
def create_new_student(student: StudentCreate):
    """
    Create a new student in MongoDB.
    """
    try:
        result = create_student(student)

        # Convert MongoDB ObjectId to string
        if "_id" in result:
            result["_id"] = str(result["_id"])

        return result

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.get("/")
def get_all_students():
    """
    Get all students from MongoDB.
    """
    students = get_students()

    # Convert MongoDB ObjectId to string
    for student in students:
        if "_id" in student:
            student["_id"] = str(student["_id"])

    return students


@router.get("/{student_id}")
def get_single_student(student_id: str):
    """
    Get one student using student_id.
    """
    student = get_student_by_id(student_id)

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    # Convert MongoDB ObjectId to string
    if "_id" in student:
        student["_id"] = str(student["_id"])

    return student
