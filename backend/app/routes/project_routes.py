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
def get_all_projects():
    """
    Get all projects.
    """
    projects = get_projects()

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