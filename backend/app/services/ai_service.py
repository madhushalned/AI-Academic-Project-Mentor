from app.crew.crew import project_planning_crew
from app.schemas.analysis_schema import ProjectAnalysis
from app.services.project_service import update_project_ai_analysis


def analyze_project(project_data: dict):

    # Run the complete CrewAI pipeline
    result = project_planning_crew.kickoff(
        inputs={
            "title": project_data["title"],
            "description": project_data["description"],
            "domain": project_data["domain"]
        }
    )

    # Get structured outputs from individual tasks
    task_outputs = result.tasks_output

    project_analysis_output = task_outputs[0].pydantic
    feasibility_output = task_outputs[1].pydantic
    technology_output = task_outputs[2].pydantic
    planning_output = task_outputs[3].pydantic
    risk_output = task_outputs[4].pydantic

    # Build the final ProjectAnalysis object
    analysis = ProjectAnalysis(
        project_id=project_data["project_id"],

        project_analysis=(
            project_analysis_output.problem_statement
        ),

        scope=project_analysis_output,

        feasibility=feasibility_output,

        technology=technology_output,

        milestones=planning_output.milestones,

        risks=risk_output.risks,

        status="completed"
    )

    # Convert Pydantic model to dictionary
    analysis_data = analysis.model_dump()

    # Save AI analysis inside the project document
    update_project_ai_analysis(
        project_data["project_id"],
        analysis_data
    )

    return analysis_data