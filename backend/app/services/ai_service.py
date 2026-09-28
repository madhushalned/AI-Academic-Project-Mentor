from app.crew.crew import (
    project_planning_crew,
    progress_evaluation_crew,
    weekly_mentor_crew,
    faculty_summary_crew
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

        # ----------------------------------------------------
        # Run the complete CrewAI pipeline
        # ----------------------------------------------------

        result = project_planning_crew.kickoff(
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
                )
            }
        )

        # ----------------------------------------------------
        # Get structured outputs from individual tasks
        # ----------------------------------------------------

        task_outputs = result.tasks_output

        project_analysis_output = task_outputs[0].pydantic
        feasibility_output = task_outputs[1].pydantic
        technology_output = task_outputs[2].pydantic
        planning_output = task_outputs[3].pydantic
        risk_output = task_outputs[4].pydantic

        # ----------------------------------------------------
        # Build final ProjectAnalysis object
        # ----------------------------------------------------

        analysis = ProjectAnalysis(
            project_id=project_data.get(
                "project_id"
            ),

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

        # ----------------------------------------------------
        # Convert Pydantic model to dictionary
        # ----------------------------------------------------

        analysis_data = analysis.model_dump()

        # ----------------------------------------------------
        # Save AI analysis
        # ----------------------------------------------------

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

        # ----------------------------------------------------
        # Get AI-generated project analysis
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
        # Get project progress
        # ----------------------------------------------------

        progress = project_data.get(
            "progress",
            []
        )

        if not isinstance(progress, list):
            progress = []

        # ----------------------------------------------------
        # Normalize progress data
        #
        # Supports:
        #     current_progress
        #
        # and:
        #     progress
        #
        # This allows both weekly check-ins and the
        # direct progress API to work.
        # ----------------------------------------------------

        normalized_progress = []

        for item in progress:

            if not isinstance(
                item,
                dict
            ):
                continue

            week = item.get(
                "week"
            )

            if week is None:
                continue

            current_progress = item.get(
                "current_progress"
            )

            if current_progress is None:

                current_progress = item.get(
                    "progress",
                    0
                )

            try:

                current_progress = float(
                    current_progress
                )

            except (
                TypeError,
                ValueError
            ):

                current_progress = 0

            # ------------------------------------------------
            # Keep progress between 0 and 100
            # ------------------------------------------------

            current_progress = max(
                0,
                min(
                    100,
                    current_progress
                )
            )

            normalized_item = {
                "week": week,

                "status": item.get(
                    "status",
                    "In Progress"
                ),

                "completed_work": item.get(
                    "completed_work",
                    []
                ),

                "current_progress": current_progress,

                "blockers": item.get(
                    "blockers",
                    []
                ),

                "next_goals": item.get(
                    "next_goals",
                    []
                ),

                "remarks": item.get(
                    "remarks"
                )
            }

            normalized_progress.append(
                normalized_item
            )

        # ----------------------------------------------------
        # Debug information
        # ----------------------------------------------------

        print(
            "Progress records received:",
            len(normalized_progress)
        )

        print(
            "Normalized progress:",
            normalized_progress
        )

        # ----------------------------------------------------
        # Run Progress Evaluation CrewAI
        # ----------------------------------------------------

        result = progress_evaluation_crew.kickoff(
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

                "progress": normalized_progress
            }
        )

        # ----------------------------------------------------
        # Get raw CrewAI output
        # ----------------------------------------------------

        raw_output = result.tasks_output[0].raw.strip()

        # ----------------------------------------------------
        # Remove Markdown JSON fences
        # ----------------------------------------------------

        if raw_output.startswith(
            "```json"
        ):

            raw_output = raw_output[
                len("```json"):
            ].strip()

        if raw_output.startswith(
            "```"
        ):

            raw_output = raw_output[
                len("```"):
            ].strip()

        if raw_output.endswith(
            "```"
        ):

            raw_output = raw_output[
                :-len("```")
            ].strip()

        # ----------------------------------------------------
        # Extract JSON object
        # ----------------------------------------------------

        start = raw_output.find(
            "{"
        )

        end = raw_output.rfind(
            "}"
        )

        if start == -1 or end == -1:

            raise ValueError(
                "Progress evaluation agent did not return "
                "a valid JSON object."
            )

        raw_output = raw_output[
            start:end + 1
        ]

        # ----------------------------------------------------
        # Parse JSON
        # ----------------------------------------------------

        try:

            evaluation_data = json.loads(
                raw_output
            )

        except json.JSONDecodeError as json_error:

            print(
                "Progress evaluation agent returned invalid JSON."
            )

            print(
                f"Raw output:\n{raw_output}"
            )

            raise ValueError(
                "Invalid JSON returned by progress "
                f"evaluation agent: {json_error}"
            )

        # ----------------------------------------------------
        # Validate using Pydantic
        # ----------------------------------------------------

        evaluation = ProgressEvaluation(
            **evaluation_data
        )

        # ====================================================
        # CALCULATE STUDENT PROGRESS
        # ====================================================
        #
        # IMPORTANT:
        #
        # We do NOT divide the student's progress by the
        # total number of planned weeks.
        #
        # Example:
        #
        # Week 1 = 30%
        #
        # Overall reported progress = 30%
        #
        # Week 1 = 100%
        # Week 2 = 50%
        #
        # Overall reported progress = 75%
        #
        # This represents the student's actual submitted
        # progress.
        # ====================================================

        progress_values = []

        progress_by_week = {}

        for item in normalized_progress:

            week = item.get(
                "week"
            )

            current_progress = item.get(
                "current_progress",
                0
            )

            try:

                current_progress = float(
                    current_progress
                )

            except (
                TypeError,
                ValueError
            ):

                current_progress = 0

            current_progress = max(
                0,
                min(
                    100,
                    current_progress
                )
            )

            if week is not None:

                progress_by_week[week] = (
                    current_progress
                )

                progress_values.append(
                    current_progress
                )

        # ----------------------------------------------------
        # Calculate overall student progress
        # ----------------------------------------------------

        if progress_values:

            calculated_score = (
                sum(progress_values)
                / len(progress_values)
            )

        else:

            calculated_score = 0

        calculated_score = round(
            calculated_score,
            2
        )

        # ----------------------------------------------------
        # Get planned milestone weeks
        # ----------------------------------------------------

        planned_weeks = []

        for milestone in milestones:

            if not isinstance(
                milestone,
                dict
            ):
                continue

            week = milestone.get(
                "week"
            )

            if week is not None:

                planned_weeks.append(
                    week
                )

        # Remove duplicate planned weeks
        planned_weeks = list(
            dict.fromkeys(
                planned_weeks
            )
        )

        # ----------------------------------------------------
        # Determine completed weeks
        # ----------------------------------------------------

        completed_weeks = []

        for week in planned_weeks:

            week_progress = progress_by_week.get(
                week,
                0
            )

            if week_progress >= 100:

                completed_weeks.append(
                    week
                )

        # ----------------------------------------------------
        # Determine delayed weeks
        #
        # Only consider planned weeks that have already
        # reached their expected progress stage.
        #
        # For now, unreported future weeks are not treated
        # as delayed automatically.
        # ----------------------------------------------------

        delayed_weeks = []

        for item in normalized_progress:

            week = item.get(
                "week"
            )

            current_progress = item.get(
                "current_progress",
                0
            )

            status = item.get(
                "status",
                ""
            )

            if (
                status.lower() == "delayed"
                and week is not None
            ):

                delayed_weeks.append(
                    week
                )

            elif (
                current_progress < 100
                and status.lower() == "delayed"
                and week is not None
            ):

                delayed_weeks.append(
                    week
                )

        # Remove duplicates
        delayed_weeks = list(
            dict.fromkeys(
                delayed_weeks
            )
        )

        # ----------------------------------------------------
        # Determine current status
        # ----------------------------------------------------

        if not normalized_progress:

            current_status = "Not Started"

        elif (
            planned_weeks
            and len(completed_weeks)
            == len(planned_weeks)
        ):

            current_status = "Completed"

        elif calculated_score > 0:

            current_status = "In Progress"

        else:

            current_status = "Not Started"

        # ----------------------------------------------------
        # Override AI numerical score with actual student
        # progress.
        # ----------------------------------------------------

        evaluation.progress_score = (
            calculated_score
        )

        evaluation.completed_weeks = (
            completed_weeks
        )

        evaluation.delayed_weeks = (
            delayed_weeks
        )

        evaluation.current_status = (
            current_status
        )

        # ----------------------------------------------------
        # Convert to dictionary
        # ----------------------------------------------------

        evaluation_data = evaluation.model_dump()

        # ----------------------------------------------------
        # Save progress evaluation
        # ----------------------------------------------------

        update_project_progress_evaluation(
            project_data["project_id"],
            evaluation_data
        )

        # ----------------------------------------------------
        # Debug output
        # ----------------------------------------------------

        print(
            "Student progress values:",
            progress_values
        )

        print(
            "Completed weeks:",
            completed_weeks
        )

        print(
            "Delayed weeks:",
            delayed_weeks
        )

        print(
            "Final calculated progress score:",
            evaluation.progress_score
        )

        print(
            "Final progress status:",
            evaluation.current_status
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
        # Run Weekly Mentor CrewAI
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
        # Get raw CrewAI output
        # ----------------------------------------------------

        raw_output = (
            result.tasks_output[0].raw.strip()
        )

        # ----------------------------------------------------
        # Remove Markdown JSON fences
        # ----------------------------------------------------

        if raw_output.startswith(
            "```json"
        ):

            raw_output = raw_output[
                len("```json"):
            ].strip()

        if raw_output.startswith(
            "```"
        ):

            raw_output = raw_output[
                len("```"):
            ].strip()

        if raw_output.endswith(
            "```"
        ):

            raw_output = raw_output[
                :-len("```"):
            ].strip()

        # ----------------------------------------------------
        # Extract JSON object
        # ----------------------------------------------------

        start = raw_output.find(
            "{"
        )

        end = raw_output.rfind(
            "}"
        )

        if start == -1 or end == -1:

            raise ValueError(
                "Weekly mentor did not return "
                "a valid JSON object."
            )

        raw_output = raw_output[
            start:end + 1
        ]

        # ----------------------------------------------------
        # Parse JSON
        # ----------------------------------------------------

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
                in [
                    "true",
                    "yes",
                    "1"
                ]
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


# ============================================================
# FACULTY MONITORING SUMMARY
# ============================================================

def generate_faculty_summary(project_data: dict):

    try:

        # ----------------------------------------------------
        # Get existing project information
        # ----------------------------------------------------

        ai_analysis = project_data.get(
            "ai_analysis",
            {}
        )

        milestones = ai_analysis.get(
            "milestones",
            []
        )

        risks = ai_analysis.get(
            "risks",
            []
        )

        progress = project_data.get(
            "progress",
            []
        )

        progress_evaluation = project_data.get(
            "progress_evaluation",
            {}
        )

        weekly_checkins = project_data.get(
            "weekly_checkins",
            []
        )

        mentor_risk_analysis = project_data.get(
            "mentor_risk_analysis",
            {}
        )

        # ----------------------------------------------------
        # Run Faculty Summary CrewAI
        # ----------------------------------------------------

        result = faculty_summary_crew.kickoff(
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

                "progress": progress,

                "progress_evaluation": (
                    progress_evaluation
                ),

                "weekly_checkins": weekly_checkins,

                "mentor_risk_analysis": (
                    mentor_risk_analysis
                ),

                "risks": risks
            }
        )

        # ----------------------------------------------------
        # Get raw CrewAI output
        # ----------------------------------------------------

        raw_output = (
            result.tasks_output[0].raw.strip()
        )

        # ----------------------------------------------------
        # Remove Markdown JSON fences
        # ----------------------------------------------------

        if raw_output.startswith(
            "```json"
        ):

            raw_output = raw_output[
                len("```json"):
            ].strip()

        if raw_output.startswith(
            "```"
        ):

            raw_output = raw_output[
                len("```"):
            ].strip()

        if raw_output.endswith(
            "```"
        ):

            raw_output = raw_output[
                :-len("```"):
            ].strip()

        # ----------------------------------------------------
        # Extract JSON object
        # ----------------------------------------------------

        start = raw_output.find(
            "{"
        )

        end = raw_output.rfind(
            "}"
        )

        if start == -1 or end == -1:

            raise ValueError(
                "Faculty summary agent did not return "
                "a valid JSON object."
            )

        raw_output = raw_output[
            start:end + 1
        ]

        # ----------------------------------------------------
        # Parse JSON
        # ----------------------------------------------------

        try:

            summary_data = json.loads(
                raw_output
            )

        except json.JSONDecodeError as json_error:

            print(
                "Faculty summary agent returned invalid JSON."
            )

            print(
                f"Raw output:\n{raw_output}"
            )

            raise ValueError(
                "Invalid JSON returned by faculty "
                f"summary agent: {json_error}"
            )

        # ----------------------------------------------------
        # Normalize list fields
        # ----------------------------------------------------

        list_fields = [
            "key_progress_observations",
            "key_risks",
            "faculty_attention",
            "recommended_follow_up"
        ]

        for field in list_fields:

            value = summary_data.get(
                field
            )

            if isinstance(
                value,
                str
            ):

                summary_data[field] = [
                    value
                ]

            elif value is None:

                summary_data[field] = []

        # ----------------------------------------------------
        # Ensure summary field exists
        # ----------------------------------------------------

        if not isinstance(
            summary_data.get(
                "mentor_summary"
            ),
            str
        ):

            summary_data[
                "mentor_summary"
            ] = ""

        # ----------------------------------------------------
        # Return clean faculty summary
        # ----------------------------------------------------

        return summary_data

    except Exception as e:

        print(
            f"AI faculty summary generation failed: {e}"
        )

        raise