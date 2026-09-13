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

from typing import List


class FeasibilitySection(BaseModel):
    score: Optional[float] = None
    viability_report: Optional[str] = None


class ScopeSection(BaseModel):
    in_scope: List[str] = Field(default_factory=list)
    out_of_scope: List[str] = Field(default_factory=list)


class TechStackSection(BaseModel):
    recommendations: List[str] = Field(default_factory=list)
    justification: Optional[str] = None


class WeekPlan(BaseModel):
    week_number: int
    deliverables: str
    effort_hours: Optional[int] = None


class PlanningSection(BaseModel):
    weeks: List[WeekPlan] = Field(default_factory=list)


class RiskItem(BaseModel):
    description: str
    severity: str
    mitigation: str


class RiskSection(BaseModel):
    risks: List[RiskItem] = Field(default_factory=list)


class Blueprint(BaseModel):
    student_id: str
    original_idea: str
    status: str = "pending"
    feasibility: Optional[FeasibilitySection] = None
    scope: Optional[ScopeSection] = None
    tech_stack: Optional[TechStackSection] = None
    planning: Optional[PlanningSection] = None
    risk: Optional[RiskSection] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)