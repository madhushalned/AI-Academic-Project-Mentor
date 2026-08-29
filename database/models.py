from pydantic import BaseModel, Field
from typing import Dict, Optional
from datetime import datetime

class Student(BaseModel):
    student_id: str
    name: str
    email: str
    team_id: Optional[str] = None
    skills: Dict[str, str] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SkillAssessment(BaseModel):
    student_id: str
    assessment_date: datetime = Field(default_factory=datetime.utcnow)
    raw_scores: Dict[str, int]
    normalized_vector: Dict[str, float]
    confidence: str = "medium"