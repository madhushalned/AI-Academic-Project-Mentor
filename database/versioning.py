from datetime import datetime
from connection import get_db

db = get_db()

def archive_current_version(student_id: str):
    """Snapshot the current blueprint into history before it gets modified."""
    current = db.blueprints.find_one({"student_id": student_id})
    if not current:
        return None

    current.pop("_id", None)
    snapshot = {
        "student_id": student_id,
        "version": current.get("version", 1),
        "snapshot": current,
        "archived_at": datetime.utcnow()
    }
    db.blueprint_history.insert_one(snapshot)
    return snapshot["version"]

def get_version_history(student_id: str):
    """Fetch every archived version for a student, oldest first."""
    cursor = db.blueprint_history.find(
        {"student_id": student_id}
    ).sort("version", 1)
    return list(cursor)

def get_specific_version(student_id: str, version: int):
    """Fetch one exact past version of a blueprint."""
    return db.blueprint_history.find_one(
        {"student_id": student_id, "version": version}
    )