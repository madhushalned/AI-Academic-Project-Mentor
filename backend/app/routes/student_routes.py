from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.student_service import login_student

from app.schemas.student_schema import StudentCreate, StudentUpdate
from app.services.student_service import (
    create_student,
    get_students,
    get_student_by_id,
    update_student
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

@router.put("/{student_id}")
def update_existing_student(
    student_id: str,
    student: StudentUpdate
):
    """
    Update an existing student's profile.
    """

    result = update_student(
        student_id,
        student
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    if "_id" in result:
        result["_id"] = str(result["_id"])

    return result

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

class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
def student_login(data: LoginRequest):
    student = login_student(data.email, data.password)

    if student is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "message": "Login successful",
        "student": student
    }
