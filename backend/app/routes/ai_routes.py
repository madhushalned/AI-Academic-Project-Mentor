from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.ai_service import (
    analyze_project,
    evaluate_project_progress,
    analyze_weekly_mentor_update
)

from app.services.project_service import (
    get_project_by_id,
    save_weekly_checkin,
    update_project_progress,
    update_mentor_risk_analysis
)


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


class WeeklyMentorRequest(BaseModel):
    project_id: str
    week: int
    completed_work: list[str] = []
    current_progress: int
    blockers: list[str] = []
    next_goals: list[str] = []
    remarks: str | None = None


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


@router.post("/weekly-mentor")
def weekly_mentor_endpoint(
    request: WeeklyMentorRequest
):
    """
    Analyze a student's weekly project update using the AI mentor.
    """

    project = get_project_by_id(request.project_id)

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    checkin_data = {
        "week": request.week,
        "completed_work": request.completed_work,
        "current_progress": request.current_progress,
        "blockers": request.blockers,
        "next_goals": request.next_goals,
        "remarks": request.remarks
    }

    try:
        # Save weekly student update
        saved = save_weekly_checkin(
            request.project_id,
            checkin_data
        )

        if not saved:
            raise HTTPException(
                status_code=500,
                detail="Failed to save weekly check-in"
            )

        # Update main project progress
        progress_data = {
            "week": request.week,
            "status": (
                "Completed"
                if request.current_progress >= 100
                else "In Progress"
            ),
            "progress": request.current_progress,
            "remarks": request.remarks
        }

        progress_updated = update_project_progress(
            request.project_id,
            progress_data
        )

        if not progress_updated:
            raise HTTPException(
                status_code=500,
                detail="Failed to update project progress"
            )

        # Run AI mentor analysis
        analysis = analyze_weekly_mentor_update(
            project,
            checkin_data
        )

        # Save AI mentor analysis
        saved_analysis = update_mentor_risk_analysis(
            request.project_id,
            analysis
        )

        if not saved_analysis:
            raise HTTPException(
                status_code=500,
                detail="Failed to save mentor analysis"
            )

        return {
            "project_id": request.project_id,
            "week": request.week,
            "checkin": checkin_data,
            "progress_updated": progress_data,
            "mentor_analysis": analysis
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Weekly mentor analysis failed: {str(e)}"
        )