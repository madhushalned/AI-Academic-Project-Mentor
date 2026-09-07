from datetime import datetime
from connection import get_db
from models import Blueprint

db = get_db()

def create_blueprint(blueprint: Blueprint):
    return db.blueprints.insert_one(blueprint.model_dump()).inserted_id

def get_blueprint(student_id: str):
    return db.blueprints.find_one(
        {"student_id": student_id}, sort=[("created_at", -1)]
    )

def update_blueprint_section(student_id: str, section_name: str, section_data: dict):
    return db.blueprints.update_one(
        {"student_id": student_id},
        {"$set": {section_name: section_data, "updated_at": datetime.utcnow()}}
    )

def update_blueprint_status(student_id: str, status: str):
    return db.blueprints.update_one(
        {"student_id": student_id},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )