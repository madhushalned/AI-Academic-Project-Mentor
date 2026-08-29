from connection import get_db
from pymongo.errors import CollectionInvalid

db = get_db()

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

    db.students.create_index("student_id", unique=True)
    db.skill_assessments.create_index("student_id")
    print("Indexes created.")

if __name__ == "__main__":
    create_collections()