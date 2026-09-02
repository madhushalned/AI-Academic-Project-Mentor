from app.crew.crew import project_planning_crew


def analyze_project(project_data: dict):
    result = project_planning_crew.kickoff(
        inputs={
            "title": project_data["title"],
            "description": project_data["description"],
            "domain": project_data["domain"]
        }
    )

    return str(result)
