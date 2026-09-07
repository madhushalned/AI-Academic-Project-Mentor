from connection import get_db
from models import Student, SkillAssessment

db = get_db()

def insert_student(student: Student):
    return db.students.insert_one(student.model_dump()).inserted_id

def get_student(student_id: str):
    return db.students.find_one({"student_id": student_id})

def insert_skill_assessment(assessment: SkillAssessment):
    return db.skill_assessments.insert_one(assessment.model_dump()).inserted_id

def get_latest_assessment(student_id: str):
    return db.skill_assessments.find_one(
        {"student_id": student_id}, sort=[("assessment_date", -1)]
    )