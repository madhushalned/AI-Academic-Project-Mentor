from datetime import datetime
from async_connection import get_async_db
from models import Blueprint

db = get_async_db()

async def create_blueprint(blueprint: Blueprint):
    result = await db.blueprints.insert_one(blueprint.model_dump())
    return result.inserted_id

async def get_blueprint(student_id: str):
    return await db.blueprints.find_one(
        {"student_id": student_id}, sort=[("created_at", -1)]
    )

async def update_blueprint_section(student_id: str, section_name: str, section_data: dict):
    result = await db.blueprints.update_one(
        {"student_id": student_id},
        {"$set": {section_name: section_data, "updated_at": datetime.utcnow()}}
    )
    return result.modified_count

async def update_blueprint_status(student_id: str, status: str):
    result = await db.blueprints.update_one(
        {"student_id": student_id},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )
    return result.modified_count