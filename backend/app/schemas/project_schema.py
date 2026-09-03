from pydantic import BaseModel, Field
from typing import Optional


class ProjectCreate(BaseModel):
    project_id: str
    student_id: str
    title: str
    description: Optional[str] = None
    domain: Optional[str] = None
    status: str = "not_started"


class ProjectResponse(BaseModel):
    project_id: str
    student_id: str
    title: str
    description: Optional[str] = None
    domain: Optional[str] = None
    status: str = "not_started"