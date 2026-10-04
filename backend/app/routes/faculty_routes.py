from fastapi import APIRouter, HTTPException

from app.services.project_service import (
    get_projects,
    get_project_by_id
)

from app.services.ai_service import (
    generate_faculty_summary
)

router = APIRouter(
    prefix="/faculty",
    tags=["Faculty Monitoring"]
)


# ============================================================
# FACULTY PROJECT MONITORING
# ============================================================

@router.get("/projects")
def get_faculty_projects():

    projects = get_projects()

    faculty_projects = []

    for project in projects:

        ai_analysis = project.get(
            "ai_analysis",
            {}
        )

        progress = project.get(
            "progress",
            []
        )

        progress_evaluation = project.get(
            "progress_evaluation",
            {}
        )

        mentor_risk_analysis = project.get(
            "mentor_risk_analysis",
            {}
        )

        # ----------------------------------------------------
        # Calculate deterministic health indicators
        # ----------------------------------------------------

        progress_score = progress_evaluation.get(
            "progress_score",
            0
        )

        risks = ai_analysis.get(
            "risks",
            []
        )

        mentor_risks = mentor_risk_analysis.get(
            "identified_risks",
            []
        )

        blockers = mentor_risk_analysis.get(
            "blockers",
            []
        )

        plan_adjustment_required = mentor_risk_analysis.get(
            "plan_adjustment_required",
            False
        )

        # Combine initial and newly identified risks
        total_risks = len(risks) + len(mentor_risks)

        # ----------------------------------------------------
        # Determine health indicator
        # ----------------------------------------------------

        if plan_adjustment_required or len(blockers) > 0:
            health = "Needs Attention"

        elif progress_score >= 70 and total_risks == 0:
            health = "Healthy"

        elif progress_score >= 40:
            health = "Moderate"

        else:
            health = "Needs Attention"

        # ----------------------------------------------------
        # Basic faculty project information
        # ----------------------------------------------------

        faculty_projects.append({
            "project_id": project.get(
                "project_id"
            ),

            "student_id": project.get(
                "student_id"
            ),

            "title": project.get(
                "title"
            ),

            "domain": project.get(
                "domain"
            ),

            "status": project.get(
                "status"
            ),

            "progress_score": progress_score,

            "health": health,

            "risk_count": total_risks,

            "blocker_count": len(
                blockers
            ),

            "plan_adjustment_required":
                plan_adjustment_required,

            "progress": progress,

            "progress_evaluation":
                progress_evaluation,

            "mentor_risk_analysis":
                mentor_risk_analysis
        })

    return {
        "total_projects": len(
            faculty_projects
        ),
        "projects": faculty_projects
    }


# ============================================================
# FACULTY PROJECT SUMMARY
# ============================================================

@router.get("/projects/{project_id}/summary")
def get_faculty_project_summary(
    project_id: str
):

    project = get_project_by_id(
        project_id
    )

    if project is None:

        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    try:

        summary = generate_faculty_summary(
            project
        )

        return {
            "project_id": project_id,
            "title": project.get(
                "title"
            ),
            "summary": summary
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Faculty summary generation failed: {str(e)}"
            )
        )