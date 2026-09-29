
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.ai_service import (
    analyze_project,
    evaluate_project_progress,
    analyze_weekly_mentor_update,
    generate_project_document
)

from app.services.project_service import (
    get_project_by_id,
    save_weekly_checkin,
    update_mentor_risk_analysis
)


router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)


# ============================================================
# REQUEST MODELS
# ============================================================

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

class DocumentGenerationRequest(BaseModel):
    project_id: str
    document_type: str


# ============================================================
# PROJECT ANALYSIS
# ============================================================

@router.post("/analyze-project")
def analyze_project_endpoint(
    project: ProjectAnalysisRequest
):
    """
    Analyze a newly submitted academic project using AI.
    """

    try:
        result = analyze_project(
            project.model_dump()
        )

        return {
            "project_id": project.project_id,
            "analysis": result
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI project analysis failed: {str(e)}"
        )


# ============================================================
# PROGRESS EVALUATION
# ============================================================

@router.post("/evaluate-progress")
def evaluate_progress_endpoint(
    request: ProgressEvaluationRequest
):
    """
    Evaluate the student's current project progress using AI.

    Flow:
    1. Get project from MongoDB.
    2. Get saved progress from the project document.
    3. Attach progress to project data.
    4. Send project + progress to AI evaluator.
    5. Save and return the AI evaluation.
    """

    # --------------------------------------------------------
    # Step 1: Get project
    # --------------------------------------------------------

    project = get_project_by_id(
        request.project_id
    )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    try:

        # ----------------------------------------------------
        # Step 2: Get saved progress
        # ----------------------------------------------------

        progress = project.get(
            "progress",
            []
        )

        # Make sure progress is always a list
        if not isinstance(progress, list):
            progress = []

        # ----------------------------------------------------
        # Step 3: Attach progress explicitly
        # ----------------------------------------------------

        project["progress"] = progress

        # ----------------------------------------------------
        # Debug information
        # ----------------------------------------------------

        print(
            "Progress loaded for AI evaluation:",
            len(progress)
        )

        print(
            "Progress data:",
            progress
        )

        # ----------------------------------------------------
        # Step 4: Run AI progress evaluation
        # ----------------------------------------------------

        result = evaluate_project_progress(
            project
        )

        # ----------------------------------------------------
        # Step 5: Return result
        # ----------------------------------------------------

        return {
            "project_id": request.project_id,
            "progress_records": len(progress),
            "evaluation": result
        }

    except HTTPException:
        raise

    except Exception as e:

        print(
            f"AI progress evaluation failed: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail=f"AI progress evaluation failed: {str(e)}"
        )


# ============================================================
# WEEKLY AI MENTOR
# ============================================================

@router.post("/weekly-mentor")
def weekly_mentor_endpoint(
    request: WeeklyMentorRequest
):
    """
    Analyze a student's weekly project update using the AI mentor.

    Flow:
    1. Get project.
    2. Build weekly check-in data.
    3. Save student check-in.
    4. Run AI mentor analysis.
    5. Save mentor/risk analysis.
    6. Return the result.
    """

    # --------------------------------------------------------
    # Step 1: Get project
    # --------------------------------------------------------

    project = get_project_by_id(
        request.project_id
    )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    # --------------------------------------------------------
    # Step 2: Prepare weekly check-in
    # --------------------------------------------------------

    checkin_data = {
        "week": request.week,
        "completed_work": request.completed_work,
        "current_progress": request.current_progress,
        "blockers": request.blockers,
        "next_goals": request.next_goals,
        "remarks": request.remarks
    }

    try:

        # ----------------------------------------------------
        # Step 3: Save weekly student update
        # ----------------------------------------------------

        saved = save_weekly_checkin(
            request.project_id,
            checkin_data
        )

        if not saved:
            raise HTTPException(
                status_code=500,
                detail="Failed to save weekly check-in"
            )

        # ----------------------------------------------------
        # Step 4: Run AI mentor analysis
        # ----------------------------------------------------

        analysis = analyze_weekly_mentor_update(
            project,
            checkin_data
        )

        # ----------------------------------------------------
        # Step 5: Save AI mentor analysis
        # ----------------------------------------------------

        saved_analysis = update_mentor_risk_analysis(
            request.project_id,
            analysis
        )

        if not saved_analysis:
            raise HTTPException(
                status_code=500,
                detail="Failed to save mentor analysis"
            )

        # ----------------------------------------------------
        # Step 6: Return result
        # ----------------------------------------------------

        return {
            "project_id": request.project_id,
            "week": request.week,
            "checkin": checkin_data,
            "mentor_analysis": analysis
        }

    except HTTPException:
        raise

    except Exception as e:

        print(
            f"Weekly mentor analysis failed: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail=f"Weekly mentor analysis failed: {str(e)}"
        )
# ============================================================
# DOCUMENT GENERATION
# ============================================================

@router.post("/generate-document")
def generate_document_endpoint(
    request: DocumentGenerationRequest
):
    """
    Generate an academic project document using CrewAI.
    """

    allowed_types = {
        "synopsis",
        "methodology",
        "progress_report"
    }

    if request.document_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid document_type. "
                "Allowed values: synopsis, methodology, progress_report"
            )
        )

    project = get_project_by_id(request.project_id)

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found."
        )

    try:
        result = generate_project_document(
            project_data=project,
            document_type=request.document_type
        )

        return {
            "project_id": request.project_id,
            "document_type": request.document_type,
            "content": result["content"]
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )

    except Exception as exc:
        print(f"Document generation failed: {exc}")

        raise HTTPException(
            status_code=500,
            detail="Document generation failed."
        )
