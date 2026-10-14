from connection import get_db
from models import CheckIn
from blueprints import update_progress

db = get_db()

def log_checkin(checkin: CheckIn):
    result = db.check_ins.insert_one(checkin.model_dump()).inserted_id
    if checkin.progress_percentage is not None:
        update_progress(checkin.student_id, checkin.progress_percentage)
    return result

def get_checkins_for_student(student_id: str):
    """Full check-in history for a student, oldest first."""
    cursor = db.check_ins.find(
        {"student_id": student_id}
    ).sort("week_number", 1)
    return list(cursor)

def get_latest_checkin(student_id: str):
    """Most recent check-in — used by the mentor agent for context."""
    return db.check_ins.find_one(
        {"student_id": student_id}, sort=[("created_at", -1)]
    )

def has_checked_in_this_week(student_id: str, week_number: int) -> bool:
    """Used by the health dashboard to flag students who've gone quiet."""
    result = db.check_ins.find_one(
        {"student_id": student_id, "week_number": week_number}
    )
    return result is not None