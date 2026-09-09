from connection import get_db

db = get_db()

def get_student_summary(student_id: str):
    """Fetch only the fields needed for a dashboard card — not the full document."""
    return db.students.find_one(
        {"student_id": student_id},
        projection={"_id": 0, "name": 1, "email": 1, "skills": 1}
    )

def get_recent_assessments(student_id: str, limit: int = 5):
    """Fetch a student's most recent assessments, using the compound index — no in-memory sort needed."""
    cursor = db.skill_assessments.find(
        {"student_id": student_id}
    ).sort("assessment_date", -1).limit(limit)
    return list(cursor)

def get_blueprints_by_status(student_id: str, status: str):
    """Filter blueprints by student AND status in one indexed query."""
    cursor = db.blueprints.find(
        {"student_id": student_id, "status": status},
        projection={"_id": 0, "student_id": 1, "status": 1, "original_idea": 1, "updated_at": 1}
    )
    return list(cursor)

def get_blueprint_progress(student_id: str):
    """Fetch only which sections are filled in, not their full content — useful for a progress bar."""
    doc = db.blueprints.find_one(
        {"student_id": student_id},
        projection={
            "_id": 0, "status": 1,
            "feasibility": {"$ifNull": ["$feasibility", None]},
            "scope": {"$ifNull": ["$scope", None]},
            "tech_stack": {"$ifNull": ["$tech_stack", None]},
            "planning": {"$ifNull": ["$planning", None]},
            "risk": {"$ifNull": ["$risk", None]}
        }
    )
    if not doc:
        return None
    return {
        "status": doc.get("status"),
        "sections_complete": {
            "feasibility": doc.get("feasibility") is not None,
            "scope": doc.get("scope") is not None,
            "tech_stack": doc.get("tech_stack") is not None,
            "planning": doc.get("planning") is not None,
            "risk": doc.get("risk") is not None,
        }
    }