from async_connection import get_async_db
from models import Student, SkillAssessment

db = get_async_db()

async def insert_student(student: Student):
    result = await db.students.insert_one(student.model_dump())
    return result.inserted_id

async def get_student(student_id: str):
    return await db.students.find_one({"student_id": student_id})

async def insert_skill_assessment(assessment: SkillAssessment):
    result = await db.skill_assessments.insert_one(assessment.model_dump())
    return result.inserted_id

async def get_latest_assessment(student_id: str):
    return await db.skill_assessments.find_one(
        {"student_id": student_id}, sort=[("assessment_date", -1)]
    )