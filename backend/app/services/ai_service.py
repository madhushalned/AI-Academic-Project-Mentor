from app.crew.crew import (
    project_planning_crew,
    progress_evaluation_crew,
    weekly_mentor_crew
)

from app.schemas.analysis_schema import (
    ProjectAnalysis,
    ProgressEvaluation,
    MentorRiskAnalysis
)

from app.services.project_service import (
    update_project_ai_analysis,
    update_project_progress_evaluation
)

import json


# ============================================================
# PROJECT ANALYSIS
# ============================================================

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

        print(
            f"AI project analysis failed: {e}"
        )

        raise


# ============================================================
# PROJECT PROGRESS EVALUATION
# ============================================================

def evaluate_project_progress(project_data: dict):

    try:
        ai_analysis = project_data.get(
            "ai_analysis",
            {}
        )

        milestones = ai_analysis.get(
            "milestones",
            []
        )

        progress = project_data.get(
            "progress",
            []
        )

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

        evaluation_data = json.loads(
            raw_output
        )

        evaluation = ProgressEvaluation(
            **evaluation_data
        )

        # ----------------------------------------------------
        # Calculate progress score deterministically
        # ----------------------------------------------------

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
                progress_by_week.get(
                    week,
                    0
                )
                for week in planned_weeks
            )

            calculated_score = (
                total_progress / len(planned_weeks)
            )

        else:

            calculated_score = 0

        # Override the LLM numerical score
        # with the deterministic value.
        evaluation.progress_score = round(
            calculated_score,
            2
        )

        evaluation_data = evaluation.model_dump()

        # Save progress evaluation
        update_project_progress_evaluation(
            project_data["project_id"],
            evaluation_data
        )

        return evaluation_data

    except Exception as e:

        print(
            f"AI progress evaluation failed: {e}"
        )

        raise


# ============================================================
# WEEKLY MENTOR + RISK ANALYSIS
# ============================================================

def analyze_weekly_mentor_update(
    project_data: dict,
    checkin_data: dict
):

    try:

        # ----------------------------------------------------
        # Get existing AI-generated project plan
        # ----------------------------------------------------

        ai_analysis = project_data.get(
            "ai_analysis",
            {}
        )

        milestones = ai_analysis.get(
            "milestones",
            []
        )

        # ----------------------------------------------------
        # Run Weekly Mentor CrewAI agent
        # ----------------------------------------------------

        result = weekly_mentor_crew.kickoff(
            inputs={

                "title": project_data.get(
                    "title",
                    ""
                ),

                "description": project_data.get(
                    "description",
                    ""
                ),

                "domain": project_data.get(
                    "domain",
                    ""
                ),

                "milestones": milestones,

                "week": checkin_data.get(
                    "week",
                    1
                ),

                "completed_work": checkin_data.get(
                    "completed_work",
                    []
                ),

                "current_progress": checkin_data.get(
                    "current_progress",
                    0
                ),

                "blockers": checkin_data.get(
                    "blockers",
                    []
                ),

                "next_goals": checkin_data.get(
                    "next_goals",
                    []
                ),

                "remarks": checkin_data.get(
                    "remarks"
                )
            }
        )

        # ----------------------------------------------------
        # Get structured Pydantic output when available
        # ----------------------------------------------------

        task_output = result.tasks_output[0]

        evaluation_data = None

        pydantic_output = getattr(
            task_output,
            "pydantic",
            None
        )

        if pydantic_output is not None:

            if hasattr(
                pydantic_output,
                "model_dump"
            ):

                evaluation_data = (
                    pydantic_output.model_dump()
                )

            elif isinstance(
                pydantic_output,
                dict
            ):

                evaluation_data = dict(
                    pydantic_output
                )

        # ----------------------------------------------------
        # Fall back to raw JSON parsing
        # ----------------------------------------------------

        if evaluation_data is None:

            raw_output = str(
                getattr(
                    task_output,
                    "raw",
                    ""
                )
            ).strip()

            # ------------------------------------------------
            # Remove Markdown JSON fences
            # ------------------------------------------------

            if raw_output.startswith("```json"):

                raw_output = raw_output[
                    len("```json"):
                ].strip()

            if raw_output.startswith("```"):

                raw_output = raw_output[
                    len("```"):
                ].strip()

            if raw_output.endswith("```"):

                raw_output = raw_output[
                    :-len("```")
                ].strip()

            # ------------------------------------------------
            # Extract only the JSON object
            # ------------------------------------------------

            start = raw_output.find("{")
            end = raw_output.rfind("}")

            if start == -1 or end == -1:

                raise ValueError(
                    "Weekly mentor did not return "
                    "a valid JSON object."
                )

            raw_output = raw_output[
                start:end + 1
            ]

            # ------------------------------------------------
            # Parse JSON
            # ------------------------------------------------

            try:

                evaluation_data = json.loads(
                    raw_output
                )

            except json.JSONDecodeError as json_error:

                print(
                    "Weekly mentor returned invalid JSON."
                )

                print(
                    f"Raw output:\n{raw_output}"
                )

                raise ValueError(
                    "Invalid JSON returned by weekly "
                    f"mentor: {json_error}"
                )

        # ----------------------------------------------------
        # Normalize list fields
        # ----------------------------------------------------

        list_fields = [
            "identified_risks",
            "blockers",
            "resolutions",
            "recommendations",
            "adjusted_plan",
            "next_actions"
        ]

        for field in list_fields:

            value = evaluation_data.get(
                field
            )

            if isinstance(
                value,
                str
            ):

                evaluation_data[field] = [
                    value
                ]

            elif value is None:

                evaluation_data[field] = []

        # ----------------------------------------------------
        # Normalize plan adjustment flag
        # ----------------------------------------------------

        plan_adjustment = evaluation_data.get(
            "plan_adjustment_required",
            False
        )

        if isinstance(
            plan_adjustment,
            str
        ):

            evaluation_data[
                "plan_adjustment_required"
            ] = (
                plan_adjustment.lower()
                in ["true", "yes", "1"]
            )

        # ----------------------------------------------------
        # Validate using Pydantic
        # ----------------------------------------------------

        evaluation = MentorRiskAnalysis(
            **evaluation_data
        )

        # ----------------------------------------------------
        # Return clean dictionary
        # ----------------------------------------------------

        return evaluation.model_dump()

    except Exception as e:

        print(
            f"AI weekly mentor analysis failed: {e}"
        )

        raise
