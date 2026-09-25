from pydantic import BaseModel, Field
from typing import Optional

class ProjectCreate(BaseModel):
    project_id: str
    student_id: str
    title: str
    description: Optional[str] = None
    domain: Optional[str] = None
    problemStatement: Optional[str] = None
    expectedOutcome: Optional[str] = None
    status: str = "not_started"

class ProgressUpdate(BaseModel):
    week: int = Field(..., ge=1)
    status: str
    progress: int = Field(..., ge=0, le=100)
    remarks: Optional[str] = None

class ProjectResponse(BaseModel):
    project_id: str
    student_id: str
    title: str
    description: Optional[str] = None
    domain: Optional[str] = None
    status: str = "not_started"
    ai_analysis: Optional[dict] = None
    