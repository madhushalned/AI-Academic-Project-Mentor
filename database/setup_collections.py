from connection import get_db
from pymongo.errors import CollectionInvalid

db = get_db()

blueprint_validator = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["student_id", "original_idea", "status"],
        "properties": {
            "student_id": {"bsonType": "string"},
            "original_idea": {"bsonType": "string"},
            "status": {"enum": ["pending", "in_progress", "completed"]},
            "feasibility": {"bsonType": ["object", "null"]},
            "scope": {"bsonType": ["object", "null"]},
            "tech_stack": {"bsonType": ["object", "null"]},
            "planning": {"bsonType": ["object", "null"]},
            "risk": {"bsonType": ["object", "null"]},
            "created_at": {"bsonType": "date"},
            "updated_at": {"bsonType": "date"}
        }
    }
}

history_validator = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["student_id", "version", "snapshot", "archived_at"],
        "properties": {
            "student_id": {"bsonType": "string"},
            "version": {"bsonType": "int"},
            "snapshot": {"bsonType": "object"},
            "archived_at": {"bsonType": "date"}
        }
    }
}

checkin_validator = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["student_id", "week_number", "student_message"],
        "properties": {
            "student_id": {"bsonType": "string"},
            "week_number": {"bsonType": "int"},
            "student_message": {"bsonType": "string"},
            "mentor_response": {"bsonType": ["string", "null"]},
            "status": {"enum": ["on_track", "behind", "blocked"]},
            "created_at": {"bsonType": "date"}
        }
    }
}

student_validator = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["student_id", "name", "email"],
        "properties": {
            "student_id": {"bsonType": "string"},
            "name": {"bsonType": "string"},
            "email": {"bsonType": "string"},
            "team_id": {"bsonType": ["string", "null"]},
            "skills": {"bsonType": "object"},
            "created_at": {"bsonType": "date"}
        }
    }
}

assessment_validator = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["student_id", "raw_scores", "normalized_vector"],
        "properties": {
            "student_id": {"bsonType": "string"},
            "assessment_date": {"bsonType": "date"},
            "raw_scores": {"bsonType": "object"},
            "normalized_vector": {"bsonType": "object"},
            "confidence": {"bsonType": "string"}
        }
    }
}

def create_collections():
    try:
        db.create_collection("students", validator=student_validator)
        print("Created 'students' collection.")
    except CollectionInvalid:
        print("'students' already exists — skipping.")

    try:
        db.create_collection("skill_assessments", validator=assessment_validator)
        print("Created 'skill_assessments' collection.")
    except CollectionInvalid:
        print("'skill_assessments' already exists — skipping.")
    try:
        db.create_collection("blueprints", validator=blueprint_validator)
        print("Created 'blueprints' collection.")
    except CollectionInvalid:
        print("'blueprints' already exists — skipping.")
    try:
        db.create_collection("blueprint_history", validator=history_validator)
        print("Created 'blueprint_history' collection.")
    except CollectionInvalid:
        print("'blueprint_history' already exists — skipping.")
    try:
        db.create_collection("check_ins", validator=checkin_validator)
        print("Created 'check_ins' collection.")
    except CollectionInvalid:
        print("'check_ins' already exists — skipping.")

    db.students.create_index("student_id", unique=True)
    db.skill_assessments.create_index("student_id")
    db.blueprints.create_index("student_id")
    db.skill_assessments.create_index([("student_id", 1), ("assessment_date", -1)])
    db.blueprints.create_index([("student_id", 1), ("status", 1)])
    db.blueprint_history.create_index([("student_id", 1), ("version", 1)])
    db.check_ins.create_index([("student_id", 1), ("week_number", 1)])
    print("Compound indexes created.")
    print("Indexes created.")

if __name__ == "__main__":
    create_collections()