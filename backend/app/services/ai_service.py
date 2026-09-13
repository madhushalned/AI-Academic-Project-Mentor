from app.crew.crew import project_planning_crew, progress_evaluation_crew
from app.schemas.analysis_schema import ProjectAnalysis, ProgressEvaluation
from app.services.project_service import update_project_ai_analysis,update_project_progress_evaluation
import json

def analyze_project(project_data: dict):

    try:
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

    except Exception as e:
        print(f"AI project analysis failed: {e}")
        raise

def evaluate_project_progress(project_data: dict):
    try:
        ai_analysis = project_data.get("ai_analysis", {})
        milestones = ai_analysis.get("milestones", [])
        progress = project_data.get("progress", [])

        result = progress_evaluation_crew.kickoff(
            inputs={
                "title": project_data["title"],
                "description": project_data["description"],
                "domain": project_data["domain"],
                "milestones": milestones,
                "progress": progress
            }
        )

        raw_output = result.tasks_output[0].raw
        evaluation_data = json.loads(raw_output)

        evaluation = ProgressEvaluation(**evaluation_data)

        # Calculate progress score deterministically from all planned weeks.
        progress_by_week = {
            item["week"]: item.get("progress", 0)
            for item in progress
        }

        planned_weeks = [
            milestone["week"]
            for milestone in milestones
            if milestone.get("week") is not None
        ]

        if planned_weeks:
            total_progress = sum(
                progress_by_week.get(week, 0)
                for week in planned_weeks
            )
            calculated_score = total_progress / len(planned_weeks)
        else:
            calculated_score = 0

        # Override the LLM's numerical score with the deterministic value.
        evaluation.progress_score = round(calculated_score, 2)

        evaluation_data = evaluation.model_dump()

        update_project_progress_evaluation(
            project_data["project_id"],
            evaluation_data
        )

        return evaluation_data

    except Exception as e:
        print(f"AI progress evaluation failed: {e}")
        raise