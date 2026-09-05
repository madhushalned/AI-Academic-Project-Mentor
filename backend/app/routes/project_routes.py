from fastapi import APIRouter, HTTPException

from app.schemas.project_schema import ProjectCreate
from app.services.project_service import (
    create_project,
    get_projects,
    get_project_by_id
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