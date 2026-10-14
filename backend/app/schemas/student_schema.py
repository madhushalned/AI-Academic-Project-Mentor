from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict


class StudentCreate(BaseModel):
    student_id: str
    name: str
    email: EmailStr
    password: str = Field(min_length=8)
    team_id: Optional[str] = None
    skills: Dict[str, str] = Field(default_factory=dict)
    profile_picture: Optional[str] = None

class StudentUpdate(BaseModel):
    name: str
    email: EmailStr
    team_id: Optional[str] = None
    skills: Dict[str, str] = Field(default_factory=dict)
    profile_picture: Optional[str] = None

class StudentResponse(BaseModel):
    student_id: str
    name: str
    email: EmailStr
    team_id: Optional[str] = None
    skills: Dict[str, str] = Field(default_factory=dict)
    profile_picture: Optional[str] = None