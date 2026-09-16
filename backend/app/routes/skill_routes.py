from fastapi import APIRouter, HTTPException

from app.schemas.skill_schema import SkillAssessmentCreate,SkillAssessmentUpdate
from app.services.skill_service import (
    create_skill_assessment,
    get_skill_assessments,
    get_skill_assessment_by_student_id,
    update_skill_assessment
)


router = APIRouter(
    prefix="/skills",
    tags=["Skills"]
)


@router.post("/")
def create_new_skill_assessment(
    skill: SkillAssessmentCreate
):
    """
    Create a new skill assessment.
    """
    try:
        result = create_skill_assessment(skill)

        if "_id" in result:
            result["_id"] = str(result["_id"])

        return result

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.get("/")
def get_all_skill_assessments():
    """
    Get all skill assessments.
    """
    assessments = get_skill_assessments()

    for assessment in assessments:
        if "_id" in assessment:
            assessment["_id"] = str(assessment["_id"])

    return assessments

@router.put("/{student_id}")
def update_single_skill_assessment(
    student_id: str,
    skill: SkillAssessmentUpdate
):
    """
    Update skill assessment for one student.
    """

    result = update_skill_assessment(
        student_id,
        skill
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Skill assessment not found"
        )

    return result

@router.get("/{student_id}")
def get_single_skill_assessment(
    student_id: str
):
    """
    Get skill assessment for one student.
    """
    assessment = get_skill_assessment_by_student_id(student_id)

    if assessment is None:
        raise HTTPException(
            status_code=404,
            detail="Skill assessment not found"
        )

    if "_id" in assessment:
        assessment["_id"] = str(assessment["_id"])

    return assessment