from pydantic import BaseModel, Field
from typing import Dict


class SkillAssessmentCreate(BaseModel):
    student_id: str
    raw_scores: Dict[str, float] = Field(default_factory=dict)
    normalized_vector: Dict[str, float] = Field(default_factory=dict)
    confidence: str = "medium"


class SkillAssessmentResponse(BaseModel):
    student_id: str
    raw_scores: Dict[str, float]
    normalized_vector: Dict[str, float]
    confidence: str
    assessment_date: str