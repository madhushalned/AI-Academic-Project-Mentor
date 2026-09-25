from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.ai_service import (
    analyze_project,
    evaluate_project_progress
)

from app.services.project_service import get_project_by_id


router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)


class ProjectAnalysisRequest(BaseModel):
    project_id: str
    title: str
    description: str
    domain: str


class ProgressEvaluationRequest(BaseModel):
    project_id: str


@router.post("/analyze-project")
def analyze_project_endpoint(project: ProjectAnalysisRequest):
    result = analyze_project(project.model_dump())

    return {
        "analysis": result
    }


@router.post("/evaluate-progress")
def evaluate_progress_endpoint(
    request: ProgressEvaluationRequest
):
    """
    Evaluate current project progress using AI mentorship.
    """

    project = get_project_by_id(request.project_id)

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    try:
        result = evaluate_project_progress(project)

        return {
            "project_id": request.project_id,
            "evaluation": result
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI progress evaluation failed: {str(e)}"
        )