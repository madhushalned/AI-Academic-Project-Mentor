from typing import Optional
import math
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException

from app.schemas.project_schema import ProjectCreate, ProgressUpdate
from app.services.ai_service import analyze_project, evaluate_project_progress

from app.services.project_service import (
    create_project,
    get_projects,
    get_project_by_id,
    update_project_progress
)


router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)


@router.post("/")
def create_new_project(project: ProjectCreate):
    """
    Create a new project.
    """
    try:
        result = create_project(project)
        return result

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.post("/{project_id}/analyze")
def analyze_existing_project(project_id: str):
    """
    Run AI analysis for an existing project.
    """
    project = get_project_by_id(project_id)

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    try:
        analysis = analyze_project(project)
        return analysis

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI analysis failed: {str(e)}"
        )


@router.get("/")
def get_all_projects(student_id: Optional[str] = None):
    """
    Get all projects, optionally filtered by student_id.
    """
    projects = get_projects(student_id=student_id)

    for project in projects:
        if "_id" in project:
            project["_id"] = str(project["_id"])

    return projects


@router.get("/{project_id}")
def get_single_project(project_id: str):
    """
    Get one project by project_id.
    """
    project = get_project_by_id(project_id)

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    if "_id" in project:
        project["_id"] = str(project["_id"])

    return project


@router.get("/{project_id}/milestones")
def get_project_milestones(project_id: str):
    """
    Get AI-generated milestones for a project.
    """
    project = get_project_by_id(project_id)

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    ai_analysis = project.get("ai_analysis")

    if not ai_analysis:
        raise HTTPException(
            status_code=404,
            detail="AI analysis not found for this project"
        )

    milestones = ai_analysis.get("milestones", [])

    return {
        "project_id": project_id,
        "milestones": milestones
    }


@router.get("/{project_id}/risks")
def get_project_risks(project_id: str):
    """
    Get AI-generated risks for a project.
    """
    project = get_project_by_id(project_id)

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    ai_analysis = project.get("ai_analysis")

    if not ai_analysis:
        raise HTTPException(
            status_code=404,
            detail="AI analysis not found for this project"
        )

    risks = ai_analysis.get("risks", [])

    return {
        "project_id": project_id,
        "risks": risks
    }


@router.put("/{project_id}/progress")
def update_progress(
    project_id: str,
    progress: ProgressUpdate
):
    """
    Update progress for a specific milestone.
    """
    project = get_project_by_id(project_id)

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    success = update_project_progress(
        project_id,
        progress.model_dump()
    )

    if not success:
        raise HTTPException(
            status_code=500,
            detail="Failed to update project progress"
        )

    return {
        "message": "Project progress updated successfully",
        "project_id": project_id,
        "progress": progress.model_dump()
    }

@router.get("/{project_id}/progress")
def get_project_progress(project_id: str):
    """
    Get progress for a project.
    """
    project = get_project_by_id(project_id)

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return {
        "project_id": project_id,
        "progress": project.get("progress", [])
    }


@router.get("/{project_id}/tracking")
def get_project_tracking(project_id: str):
    """
    Get comprehensive, evidence-based progress tracking and prediction data for a project.
    """
    project = get_project_by_id(project_id)

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    ai_analysis = project.get("ai_analysis") or {}
    milestones = ai_analysis.get("milestones", []) if isinstance(ai_analysis, dict) else []
    progress_list = project.get("progress", [])
    if not isinstance(progress_list, list):
        progress_list = []

    weekly_checkins = project.get("weekly_checkins", [])
    if not isinstance(weekly_checkins, list):
        weekly_checkins = []

    # Map verified progress by week
    progress_by_week = {}
    for p in progress_list:
        if isinstance(p, dict) and p.get("week") is not None:
            val = p.get("current_progress")
            if val is None:
                val = p.get("progress", 0)
            try:
                val = float(val)
            except (TypeError, ValueError):
                val = 0.0
            progress_by_week[int(p["week"])] = max(0.0, min(100.0, val))

    # Planned milestone weeks
    planned_weeks = []
    for m in milestones:
        if isinstance(m, dict) and m.get("week") is not None:
            try:
                planned_weeks.append(int(m["week"]))
            except (TypeError, ValueError):
                pass
    planned_weeks = sorted(list(dict.fromkeys(planned_weeks)))
    if not planned_weeks and progress_by_week:
        planned_weeks = sorted(list(progress_by_week.keys()))

    total_planned = len(planned_weeks) if planned_weeks else 1

    # Actual Progress Formula: sum(p_w) / N
    total_progress_sum = sum(progress_by_week.get(w, 0.0) for w in planned_weeks)
    actual_progress = round(total_progress_sum / total_planned, 1) if planned_weeks else 0.0
    actual_progress = max(0.0, min(100.0, actual_progress))

    # Planned Progress: based on elapsed 7-day milestone intervals since creation
    created_at = project.get("created_at")
    elapsed_weeks = 1
    if created_at:
        try:
            if isinstance(created_at, str):
                c_date = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            else:
                c_date = created_at
            if c_date.tzinfo is None:
                c_date = c_date.replace(tzinfo=timezone.utc)
            now = datetime.now(timezone.utc)
            days = (now - c_date).total_seconds() / 86400
            elapsed_weeks = max(1, math.ceil(days / 7))
        except Exception:
            elapsed_weeks = 1

    planned_progress = round(min(100.0, max(0.0, (elapsed_weeks / total_planned) * 100.0)), 1) if planned_weeks else 0.0

    # Categorize weeks
    completed_weeks = []
    in_progress_weeks = []
    blocked_weeks = []
    delayed_weeks = []
    active_blockers = []

    for w in planned_weeks:
        w_prog = progress_by_week.get(w, 0.0)
        w_blockers = []
        for p in progress_list:
            if isinstance(p, dict) and p.get("week") == w:
                b = p.get("blockers")
                if isinstance(b, list):
                    w_blockers.extend([str(item) for item in b if str(item).strip()])
                elif isinstance(b, str) and b.strip():
                    w_blockers.append(b.strip())
        for c in weekly_checkins:
            if isinstance(c, dict) and c.get("week") == w:
                b = c.get("blockers")
                if isinstance(b, list):
                    w_blockers.extend([str(item) for item in b if str(item).strip()])
                elif isinstance(b, str) and b.strip():
                    w_blockers.append(b.strip())

        w_blockers = list(dict.fromkeys(w_blockers))
        if w_blockers and w_prog < 100.0:
            blocked_weeks.append(w)
            active_blockers.extend(w_blockers)

        if w_prog >= 100.0:
            completed_weeks.append(w)
        elif w_prog > 0.0:
            in_progress_weeks.append(w)

        if elapsed_weeks > w and w_prog < 100.0:
            delayed_weeks.append(w)

    active_blockers = list(dict.fromkeys(active_blockers))

    # Total hours spent
    total_hours = 0.0
    for c in weekly_checkins:
        if isinstance(c, dict) and c.get("hours_spent") is not None:
            try:
                total_hours += float(c["hours_spent"])
            except (TypeError, ValueError):
                pass
    total_hours = round(total_hours, 1)

    # Evidence-based AI prediction
    checkins_count = len(weekly_checkins)
    if checkins_count < 2:
        prediction = {
            "can_predict": False,
            "status": "insufficient_data",
            "message": "Insufficient data for reliable prediction",
            "details": "At least 2 weekly check-ins with verified progress are required to evaluate historical velocity and calculate statistical confidence.",
            "checkins_recorded": checkins_count,
            "checkins_required": 2
        }
    else:
        sorted_checkins = sorted(weekly_checkins, key=lambda x: x.get("week", 0))
        valid_deltas = []
        for i in range(1, len(sorted_checkins)):
            p_prev = float(sorted_checkins[i - 1].get("current_progress") or 0.0)
            p_curr = float(sorted_checkins[i].get("current_progress") or 0.0)
            valid_deltas.append(max(0.0, p_curr - p_prev))

        avg_velocity = sum(valid_deltas) / len(valid_deltas) if valid_deltas else (actual_progress / max(1, len(sorted_checkins)))
        if avg_velocity <= 0.5:
            avg_velocity = actual_progress / max(1, len(sorted_checkins))

        if avg_velocity > 1.0:
            rem_progress = max(0.0, 100.0 - actual_progress)
            rem_weeks = max(1, math.ceil(rem_progress / avg_velocity)) if rem_progress > 0 else 0
            pred_date = datetime.now(timezone.utc) + timedelta(days=rem_weeks * 7)
            confidence = max(45.0, min(94.0, 85.0 - (len(active_blockers) * 12.0)))
            prediction = {
                "can_predict": True,
                "status": "predicted",
                "velocity_per_week": round(avg_velocity, 1),
                "weeks_remaining": rem_weeks,
                "predicted_completion_date": pred_date.isoformat(),
                "predicted_completion_formatted": pred_date.strftime("%d %b %Y"),
                "prediction_confidence": round(confidence, 1),
                "message": f"Estimated completion in {rem_weeks} week{'s' if rem_weeks != 1 else ''} based on verified velocity of {round(avg_velocity, 1)}% progress per week."
            }
        else:
            prediction = {
                "can_predict": False,
                "status": "stalled",
                "message": "Progress velocity is currently stagnant due to blockers. Additional check-ins with progress updates are needed.",
                "checkins_recorded": checkins_count,
                "checkins_required": 2
            }

    if actual_progress >= 100.0 and len(completed_weeks) == total_planned:
        overall_status = "Completed"
    elif blocked_weeks:
        overall_status = "At Risk"
    elif delayed_weeks:
        overall_status = "Delayed"
    elif actual_progress > 0.0:
        overall_status = "In Progress"
    else:
        overall_status = project.get("status", "Not Started")

    return {
        "project_id": project_id,
        "title": project.get("title", ""),
        "description": project.get("description", ""),
        "domain": project.get("domain", ""),
        "student_id": project.get("student_id", ""),
        "created_at": str(created_at) if created_at else None,
        "overall_status": overall_status,
        "milestones": milestones,
        "progress_records": progress_list,
        "weekly_checkins": weekly_checkins,
        "mentor_risk_analysis": project.get("mentor_risk_analysis"),
        "progress_evaluation": project.get("progress_evaluation"),
        "actual_progress": actual_progress,
        "planned_progress": planned_progress,
        "total_planned_weeks": total_planned,
        "completed_weeks": completed_weeks,
        "in_progress_weeks": in_progress_weeks,
        "delayed_weeks": delayed_weeks,
        "blocked_weeks": blocked_weeks,
        "total_hours_spent": total_hours,
        "active_blockers": active_blockers,
        "prediction": prediction
    }