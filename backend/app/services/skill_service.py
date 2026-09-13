from datetime import datetime

from app.database import skill_assessments_collection


def create_skill_assessment(skill):
    """
    Create a new skill assessment in MongoDB.
    """

    skill_data = skill.model_dump()

    # Check if assessment already exists
    existing_assessment = skill_assessments_collection.find_one(
        {"student_id": skill_data["student_id"]}
    )

    if existing_assessment:
        raise ValueError(
            "Skill assessment already exists for this student"
        )

    # Automatically add assessment date
    skill_data["assessment_date"] = datetime.utcnow()

    # Insert into MongoDB
    result = skill_assessments_collection.insert_one(skill_data)

    # Convert ObjectId to string
    skill_data["_id"] = str(result.inserted_id)

    return skill_data


def get_skill_assessments():
    """
    Get all skill assessments from MongoDB.
    """

    assessments = list(
        skill_assessments_collection.find()
    )

    for assessment in assessments:
        assessment["_id"] = str(assessment["_id"])

    return assessments


def get_skill_assessment_by_student_id(student_id):
    """
    Get skill assessment for one student.
    """

    assessment = skill_assessments_collection.find_one(
        {"student_id": student_id}
    )

    if assessment:
        assessment["_id"] = str(assessment["_id"])

    return assessment