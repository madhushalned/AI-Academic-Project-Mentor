
from fastapi import APIRouter, HTTPException

from app.services.project_service import (
    get_projects,
    get_project_by_id,
)

from app.services.ai_service import (
    generate_faculty_summary,
)


router = APIRouter(
    prefix="/faculty",
    tags=["Faculty Monitoring"],
)


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def safe_dict(value):
    """Return a dictionary or an empty dictionary."""
    return value if isinstance(value, dict) else {}


def safe_list(value):
    """Return a list or an empty list."""
    return value if isinstance(value, list) else []


def unique_items(items):
    """Remove duplicate risk/blocker descriptions while preserving order."""
    unique = []
    seen = set()

    for item in items:
        if isinstance(item, dict):
            description = (
                item.get("risk")
                or item.get("description")
                or item.get("name")
                or str(item)
            )
        else:
            description = str(item)

        key = description.strip().casefold()

        if key and key not in seen:
            seen.add(key)
            unique.append(item)

    return unique


def get_valid_progress_score(progress_evaluation):
    """Return a valid stored progress score, or None."""
    score = progress_evaluation.get("progress_score")

    if (
        isinstance(score, (int, float))
        and not isinstance(score, bool)
        and 0 <= score <= 100
    ):
        return round(float(score), 2)

    return None


def calculate_progress_from_records(progress):
    """
    Calculate average recorded weekly progress only when no valid
    progress evaluation score is available.

    This is a fallback indicator, not necessarily the application's
    official overall progress calculation.
    """
    weekly_scores = []

    for week in progress:
        if not isinstance(week, dict):
            continue

        status = str(week.get("status", "")).strip().lower()

        if status == "completed":
            weekly_scores.append(100)
            continue

        score = week.get(
            "current_progress",
            week.get("progress"),
        )

        if (
            isinstance(score, (int, float))
            and not isinstance(score, bool)
            and 0 <= score <= 100
        ):
            weekly_scores.append(score)

    if not weekly_scores:
        return None

    return round(sum(weekly_scores) / len(weekly_scores), 2)


# ============================================================
# FACULTY PROJECT MONITORING
# ============================================================

@router.get("/projects")
def get_faculty_projects():
    projects = get_projects()
    faculty_projects = []

    for project in projects:
        ai_analysis = safe_dict(project.get("ai_analysis"))
        progress = safe_list(project.get("progress"))
        progress_evaluation = safe_dict(
            project.get("progress_evaluation")
        )
        mentor_risk_analysis = safe_dict(
            project.get("mentor_risk_analysis")
        )

        # ----------------------------------------------------
        # PROGRESS SCORE
        # ----------------------------------------------------

        progress_score = get_valid_progress_score(
            progress_evaluation
        )

        if progress_score is None:
            progress_score = calculate_progress_from_records(
                progress
            )

        if progress_score is None:
            progress_score = 0

        # ----------------------------------------------------
        # RISKS AND BLOCKERS
        # ----------------------------------------------------

        # Initial risks are kept separate from mentor-identified risks.
        initial_risks = unique_items(
            safe_list(ai_analysis.get("risks"))
        )

        mentor_risks = unique_items(
            safe_list(
                mentor_risk_analysis.get("identified_risks")
            )
        )

        blockers = unique_items(
            safe_list(mentor_risk_analysis.get("blockers"))
        )

        plan_adjustment_required = (
            mentor_risk_analysis.get(
                "plan_adjustment_required", False
            )
            is True
        )

        # Risk count represents unique mentor-identified risks.
        # Initial risks are returned separately to avoid combining
        # potentially overlapping risk lists.
        risk_count = len(mentor_risks)
        initial_risk_count = len(initial_risks)
        blocker_count = len(blockers)

        # ----------------------------------------------------
        # HEALTH INDICATOR
        # ----------------------------------------------------

        if blocker_count > 0:
            health = "Needs Attention"

        elif plan_adjustment_required:
            health = "Needs Attention"

        elif progress_score < 40:
            health = "Needs Attention"

        elif progress_score < 70:
            health = "Moderate"

        elif risk_count > 0:
            health = "Moderate"

        else:
            health = "Healthy"

        # ----------------------------------------------------
        # CONSISTENCY WARNINGS
        # ----------------------------------------------------

        consistency_warnings = []

        evaluation_status = str(
            progress_evaluation.get("current_status", "")
        ).strip().lower()

        completed_weeks = [
            week
            for week in progress
            if isinstance(week, dict)
            and str(week.get("status", "")).strip().lower()
            == "completed"
        ]

        if (
            progress_score >= 100
            and evaluation_status
            in {"behind schedule", "delayed", "at risk"}
        ):
            consistency_warnings.append(
                "Recorded progress is 100%, but the progress "
                "evaluation reports a schedule concern. Review "
                "the schedule records."
            )

        if progress_score >= 100 and plan_adjustment_required:
            consistency_warnings.append(
                "Recorded progress is 100%, but the mentor risk "
                "analysis requests a plan adjustment. Review "
                "whether the assessment is still current."
            )

        if (
            progress
            and len(completed_weeks) == len(progress)
            and progress_score < 100
        ):
            consistency_warnings.append(
                "All recorded weeks are marked Completed, but "
                "the overall progress score is below 100%."
            )

        if not progress_evaluation:
            consistency_warnings.append(
                "No progress evaluation is available. The displayed "
                "score may be based on weekly progress records."
            )

        # ----------------------------------------------------
        # FACULTY PROJECT RESPONSE
        # ----------------------------------------------------

        faculty_projects.append({
            "project_id": project.get("project_id"),
            "student_id": project.get("student_id"),
            "title": project.get("title"),
            "domain": project.get("domain"),
            "status": project.get("status"),

            "progress_score": progress_score,
            "health": health,

            "risk_count": risk_count,
            "initial_risk_count": initial_risk_count,
            "blocker_count": blocker_count,

            "plan_adjustment_required": (
                plan_adjustment_required
            ),

            "consistency_warnings": consistency_warnings,

            "progress": progress,
            "progress_evaluation": progress_evaluation,
            "mentor_risk_analysis": mentor_risk_analysis,
        })

    return {
        "total_projects": len(faculty_projects),
        "projects": faculty_projects,
    }


# ============================================================
# FACULTY PROJECT SUMMARY
# ============================================================

@router.get("/projects/{project_id}/summary")
def get_faculty_project_summary(project_id: str):
    project = get_project_by_id(project_id)

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    try:
        summary = generate_faculty_summary(project)

        return {
            "project_id": project_id,
            "title": project.get("title"),
            "summary": summary,
        }

    except Exception:
        # Log the full exception on the server if logging is configured.
        raise HTTPException(
            status_code=500,
            detail="Faculty summary generation failed.",
        )
