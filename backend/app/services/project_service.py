from datetime import datetime

from app.database import db


projects_collection = db["projects"]


def create_project(project):
    """
    Create a new project in MongoDB.
    """

    project_data = project.model_dump()

    # Check if project already exists
    existing_project = projects_collection.find_one(
        {"project_id": project_data["project_id"]}
    )
    if existing_project:
        raise ValueError(
            "Project already exists"
        )

    # Automatically add creation time
    project_data["created_at"] = datetime.utcnow()

    # Insert into MongoDB
    result = projects_collection.insert_one(project_data)

    # Convert ObjectId to string
    project_data["_id"] = str(result.inserted_id)

    return project_data


def get_projects():
    """
    Get all projects from MongoDB.
    """

    projects = list(
        projects_collection.find()
    )

    return projects


def get_project_by_id(project_id):
    """
    Get one project by project_id.
    """

    project = projects_collection.find_one(
        {"project_id": project_id}
    )

    return project
    
def update_project_ai_analysis(project_id, ai_analysis):
    result = projects_collection.update_one(
        {"project_id": project_id},
        {
            "$set": {
                "ai_analysis": ai_analysis
            }
        }
    )

    if result.matched_count == 0:
        return False

    return True
    