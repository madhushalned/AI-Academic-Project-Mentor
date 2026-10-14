
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr

from app.services.faculty_auth_service import (
    authenticate_faculty,
    register_faculty,
    get_current_faculty,
)
from app.services.project_service import (
    get_projects,
    get_project_by_id,
)
from app.services.ai_service import generate_faculty_summary
from app.database import students_collection


router = APIRouter(
    prefix="/faculty",
    tags=["Faculty Monitoring"],
)


# ============================================================
# FACULTY REGISTRATION & LOGIN
# ============================================================

class FacultyRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    department: str = "Computer Science"


@router.post("/register")
def faculty_register(data: FacultyRegisterRequest):
    """Register a new faculty account."""
    return register_faculty(
        name=data.name,
        email=str(data.email).strip().lower(),
        password=data.password,
        department=data.department,
    )


class FacultyLoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/login")
def faculty_login(data: FacultyLoginRequest):
    """Authenticate a faculty member and return a JWT token."""
    return authenticate_faculty(
        email=str(data.email).strip().lower(),
        password=data.password,
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


def calculate_progress_from_records(progress, total_planned=None):
    """
    Calculate verified progress based on weekly progress records: (1/N) * sum(p_w).
    """
    if not isinstance(progress, list) or not progress:
        return 0.0

    weekly_scores = []

    for week in progress:
        if not isinstance(week, dict):
            continue

        status = str(week.get("status", "")).strip().lower()

        if status == "completed":
            weekly_scores.append(100.0)
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
            weekly_scores.append(float(score))

    if not weekly_scores:
        return 0.0

    divisor = total_planned if total_planned and total_planned > 0 else len(weekly_scores)
    return round(sum(weekly_scores) / divisor, 1)


# ============================================================
# FACULTY PROJECT MONITORING
# ============================================================

@router.get("/projects")
def get_faculty_projects(
    current_faculty: dict = Depends(get_current_faculty),
):
    """Return project monitoring data to authenticated faculty."""
    projects = get_projects()
    student_ids = [p.get("student_id") for p in projects if p.get("student_id")]
    student_map = {}
    if student_ids:
        try:
            for s in students_collection.find({"student_id": {"$in": student_ids}}):
                student_map[s["student_id"]] = s.get("name") or s.get("email") or s["student_id"]
        except Exception:
            student_map = {}

    faculty_projects = []

    for project in projects:
        student_id = project.get("student_id")
        student_name = (
            student_map.get(student_id)
            or project.get("student_name")
            or (f"Student ({student_id})" if student_id else "Student")
        )
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

        milestones = safe_list(ai_analysis.get("milestones"))
        total_planned = len(milestones) if milestones else len(progress)

        progress_score = get_valid_progress_score(
            progress_evaluation
        )

        if progress_score is None:
            progress_score = calculate_progress_from_records(
                progress,
                total_planned=total_planned
            )

        if progress_score is None:
            progress_score = 0.0

        # ----------------------------------------------------
        # RISKS AND BLOCKERS
        # ----------------------------------------------------

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
            if (
                isinstance(week, dict)
                and str(week.get("status", "")).strip().lower()
                == "completed"
            )
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
            "student_id": student_id,
            "student_name": student_name,
            "title": project.get("title"),
            "description": project.get("description", ""),
            "domain": project.get("domain"),
            "status": project.get("status"),
            "progress_score": progress_score,
            "health": health,
            "risk_count": risk_count,
            "initial_risk_count": initial_risk_count,
            "blocker_count": blocker_count,
            "plan_adjustment_required": plan_adjustment_required,
            "consistency_warnings": consistency_warnings,
            "progress": progress,
            "progress_evaluation": progress_evaluation,
            "mentor_risk_analysis": mentor_risk_analysis,
            "ai_analysis": ai_analysis,
        })

    return {
        "total_projects": len(faculty_projects),
        "projects": faculty_projects,
    }


# ============================================================
# FACULTY PROJECT SUMMARY
# ============================================================

@router.get("/projects/{project_id}/summary")
def get_faculty_project_summary(
    project_id: str,
    current_faculty: dict = Depends(get_current_faculty),
):
    """Return an AI-generated summary to authenticated faculty."""
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
        raise HTTPException(
            status_code=500,
            detail="Faculty summary generation failed.",
        )
