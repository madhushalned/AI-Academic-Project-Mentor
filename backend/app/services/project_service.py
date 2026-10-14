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


def get_projects(student_id=None):
    """
    Get projects from MongoDB, optionally filtered by student_id.
    """
    query = {}
    if student_id:
        query["student_id"] = student_id

    projects = list(
        projects_collection.find(query)
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
                "ai_analysis": ai_analysis,
                "status": "Analysis Completed"
            }
        }
    )

    if result.matched_count == 0:
        return False

    return True

def update_project_progress(project_id, progress_data):
    """
    Update progress for a specific milestone week.
    """

    project = projects_collection.find_one(
        {"project_id": project_id}
    )

    if project is None:
        return False

    progress_list = project.get("progress", [])

    updated = False

    for item in progress_list:
        if item.get("week") == progress_data["week"]:
            item["status"] = progress_data["status"]
            item["progress"] = progress_data["progress"]
            item["remarks"] = progress_data.get("remarks")
            updated = True
            break

    if not updated:
        progress_list.append(progress_data)

    projects_collection.update_one(
        {"project_id": project_id},
        {
            "$set": {
                "progress": progress_list
            }
        }
    )

    return True

def update_project_progress_evaluation(project_id, evaluation):
    """
    Save AI-generated progress evaluation for a project.
    """

    result = projects_collection.update_one(
        {"project_id": project_id},
        {
            "$set": {
                "progress_evaluation": evaluation
            }
        }
    )

    if result.matched_count == 0:
        return False

    return True

def save_weekly_checkin(project_id, checkin_data):
    """
    Save or update a student's weekly check-in, preventing duplicate records for the same week.
    """
    project = projects_collection.find_one({"project_id": project_id})
    if project is None:
        return False

    checkins = project.get("weekly_checkins", [])
    if not isinstance(checkins, list):
        checkins = []

    target_week = checkin_data.get("week")
    new_checkins = []
    updated = False
    for c in checkins:
        if isinstance(c, dict) and c.get("week") == target_week:
            if not updated:
                new_checkins.append(checkin_data)
                updated = True
        else:
            new_checkins.append(c)

    if not updated:
        new_checkins.append(checkin_data)

    result = projects_collection.update_one(
        {"project_id": project_id},
        {"$set": {"weekly_checkins": new_checkins}}
    )

    if result.matched_count == 0:
        return False

    return True


def update_mentor_risk_analysis(project_id, analysis):
    """
    Save the latest AI mentor and risk analysis.
    """

    result = projects_collection.update_one(
        {"project_id": project_id},
        {
            "$set": {
                "mentor_risk_analysis": analysis
            }
        }
    )

    if result.matched_count == 0:
        return False

    return True