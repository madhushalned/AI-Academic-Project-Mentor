from connection import get_db
from models import ProgressUpdate

db = get_db()

def log_progress_update(update: ProgressUpdate):
    return db.progress_updates.insert_one(update.model_dump()).inserted_id

def get_open_blockers(student_id: str):
    """Unresolved blockers — this is what the faculty dashboard will surface."""
    cursor = db.progress_updates.find(
        {"student_id": student_id, "update_type": "blocker", "resolved": False}
    )
    return list(cursor)

def resolve_blocker(student_id: str, week_number: int, description: str):
    return db.progress_updates.update_one(
        {"student_id": student_id, "week_number": week_number, "description": description},
        {"$set": {"resolved": True}}
    )