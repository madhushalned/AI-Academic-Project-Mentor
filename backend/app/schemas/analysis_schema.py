from pydantic import BaseModel, Field, field_validator
from typing import List, Optional


class FeasibilityAnalysis(BaseModel):
    score: Optional[float] = Field(default=None, ge=0, le=10)
    decision: Optional[str] = None
    strengths: List[str] = Field(default_factory=list)
    concerns: List[str] = Field(default_factory=list)
    recommendation: Optional[str] = None


class ScopeAnalysis(BaseModel):
    problem_statement: Optional[str] = None
    objectives: List[str] = Field(default_factory=list)
    in_scope: List[str] = Field(default_factory=list)
    out_of_scope: List[str] = Field(default_factory=list)
    key_functionalities: List[str] = Field(default_factory=list)
    expected_outcomes: List[str] = Field(default_factory=list)


class TechnologyRecommendation(BaseModel):
    programming_languages: List[str] = Field(default_factory=list)
    frameworks: List[str] = Field(default_factory=list)
    database: List[str] = Field(default_factory=list)
    ai_ml: List[str] = Field(default_factory=list)
    tools: List[str] = Field(default_factory=list)
    apis: List[str] = Field(default_factory=list)
    justification: Optional[str] = None

    @field_validator(
        "programming_languages",
        "frameworks",
        "database",
        "ai_ml",
        "tools",
        "apis"
    )
    @classmethod
    def clean_empty_values(cls, values):
        invalid_values = {"none", "n/a", "na", "null", ""}
        return [
            value for value in values
            if isinstance(value, str)
            and value.strip().lower() not in invalid_values
        ]

class Milestone(BaseModel):
    week: Optional[int] = None
    title: Optional[str] = None
    tasks: List[str] = Field(default_factory=list)
    priorities: List[str] = Field(default_factory=list)
    dependencies: List[str] = Field(default_factory=list)
    timeline: Optional[str] = None
    deliverables: List[str] = Field(default_factory=list)


class Risk(BaseModel):
    risk: Optional[str] = None
    likelihood: Optional[str] = None
    impact: Optional[str] = None
    mitigation: Optional[str] = None


class ProjectAnalysis(BaseModel):
    project_id: str
    project_analysis: Optional[str] = None
    scope: Optional[ScopeAnalysis] = None
    feasibility: Optional[FeasibilityAnalysis] = None
    technology: Optional[TechnologyRecommendation] = None
    milestones: List[Milestone] = Field(default_factory=list)
    risks: List[Risk] = Field(default_factory=list)
    status: str = "completed"

class MilestonePlan(BaseModel):
    milestones: List[Milestone] = Field(default_factory=list)

class RiskAssessment(BaseModel):
    risks: List[Risk] = Field(default_factory=list)