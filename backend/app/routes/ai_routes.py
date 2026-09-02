from fastapi import APIRouter
from pydantic import BaseModel

from app.services.ai_service import analyze_project


router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)


class ProjectAnalysisRequest(BaseModel):
    title: str
    description: str
    domain: str


@router.post("/analyze-project")
def analyze_project_endpoint(project: ProjectAnalysisRequest):
    result = analyze_project(project.model_dump())

    return {
        "analysis": result
    }
