from app.crew.crew import (

    project_planning_crew,

    progress_evaluation_crew,

    weekly_mentor_crew,

    faculty_summary_crew,

    create_document_generation_crew

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

from datetime import datetime, timedelta, timezone

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

                try:

                    week = int(week)

                except (

                    TypeError,

                    ValueError

                ):

                    continue

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

        #

        # A week is completed only when its stored progress

        # reaches 100%.

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

        # Calculate overall project progress

        #

        # Overall progress is based on completed planned

        # weeks, not the average of weekly progress values.

        # ----------------------------------------------------

        if planned_weeks:

            calculated_score = (

                len(completed_weeks)

                / len(planned_weeks)

            ) * 100

        else:

            calculated_score = 0

        calculated_score = round(

            calculated_score,

            2

        )

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

        # A week is delayed when:

        # 1. Its own 7-day deadline has passed

        # 2. That particular week is NOT completed

        #

        # Week 1 deadline = project creation + 7 days

        # Week 2 deadline = project creation + 14 days

        # Week N deadline = project creation + N * 7 days

        #

        # Partial progress does NOT remove a delayed week.

        # Only 100% completion removes it.

        # ----------------------------------------------------

        delayed_weeks = []

        project_created_at = project_data.get(

            "created_at"

        )

        if project_created_at:

            try:

                if isinstance(

                    project_created_at,

                    str

                ):

                    created_at = datetime.fromisoformat(

                        project_created_at.replace(

                            "Z",

                            "+00:00"

                        )

                    )

                else:

                    created_at = project_created_at

                if created_at.tzinfo is None:

                    created_at = created_at.replace(

                        tzinfo=timezone.utc

                    )

                now = datetime.now(

                    timezone.utc

                )

                for week in planned_weeks:

                    week_progress = progress_by_week.get(

                        week,

                        0

                    )

                    week_item = next(

                        (

                            item

                            for item in normalized_progress

                            if item.get("week") == week

                        ),

                        {}

                    )

                    week_status = str(

                        week_item.get(

                            "status",

                            ""

                        )

                    ).strip().lower()

                    is_completed = (

                        week_progress >= 100

                        or week_status == "completed"

                    )

                    week_deadline = (

                        created_at

                        + timedelta(

                            days=week * 7

                        )

                    )

                    if (

                        now >= week_deadline

                        and not is_completed

                    ):

                        delayed_weeks.append(

                            week

                        )

            except (

                TypeError,

                ValueError

            ) as e:

                print(

                    f"Unable to calculate delayed weeks: {e}"

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

                "current_project_status": project_data.get(
                    "status",
                    project_data.get("current_status", "Unknown")
                ),
                "progress_evaluation": project_data.get(
                    "progress_evaluation",
                    {}
                ),
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

        # Prefer CrewAI's structured Pydantic output

        # ----------------------------------------------------

        # This avoids relying on Ollama returning perfectly valid

        # JSON text. If the task is configured with a Pydantic

        # output model, CrewAI has already parsed and validated it.

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

                evaluation_data = pydantic_output.model_dump()

            elif isinstance(

                pydantic_output,

                dict

            ):

                evaluation_data = dict(

                    pydantic_output

                )

        # ----------------------------------------------------

        # Fallback to raw output when structured output is not

        # available

        # ----------------------------------------------------

        if evaluation_data is None:

            raw_output = str(

                getattr(

                    task_output,

                    "raw",

                    ""

                )

            ).strip()

            # Remove Markdown JSON fences

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

            # Extract JSON object

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

            # Parse JSON

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

            elif not isinstance(

                value,

                list

            ):

                evaluation_data[field] = [

                    str(value)

                ]

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

                plan_adjustment.strip().lower()

                in [

                    "true",

                    "yes",

                    "1"

                ]

            )

        # ----------------------------------------------------

        # Normalize overall assessment

        # ----------------------------------------------------

        if not isinstance(

            evaluation_data.get(

                "overall_assessment"

            ),

            str

        ):

            evaluation_data[

                "overall_assessment"

            ] = str(

                evaluation_data.get(

                    "overall_assessment",

                    ""

                )

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
    """Build a factual faculty summary from persisted records without LLM guesses."""
    from difflib import SequenceMatcher
    import re
    from datetime import datetime

    def as_dict(value):
        return value if isinstance(value, dict) else {}

    def as_list(value):
        if value is None:
            return []
        return value if isinstance(value, list) else [value]

    def clean_text(value):
        if value is None:
            return ""
        if isinstance(value, (dict, list)):
            return json.dumps(value, ensure_ascii=False, default=str)
        return str(value).strip()

    def risk_text(item):
        if isinstance(item, dict):
            for key in ("description", "risk", "title", "name", "details", "message", "blocker"):
                if item.get(key):
                    return clean_text(item[key])
            return clean_text(item)
        return clean_text(item)

    def unique_text(items):
        """Remove exact and near-duplicate text while preserving first occurrence."""
        result = []
        normalized_seen = []
        for item in items:
            value = clean_text(item)
            if not value:
                continue
            normalized = re.sub(r"[^a-z0-9]+", " ", value.casefold()).strip()
            if not normalized:
                continue
            duplicate = False
            for prior in normalized_seen:
                ratio = SequenceMatcher(None, normalized, prior).ratio()
                words_a, words_b = set(normalized.split()), set(prior.split())
                union = words_a | words_b
                jaccard = len(words_a & words_b) / len(union) if union else 1.0
                if ratio >= 0.82 or (ratio >= 0.70 and jaccard >= 0.70):
                    duplicate = True
                    break
            if not duplicate:
                result.append(value)
                normalized_seen.append(normalized)
        return result

    def is_no_blocker_statement(value):
        text = re.sub(r"[^a-z0-9']+", " ", clean_text(value).casefold()).strip()
        no_blocker_patterns = (
            r"\bno blockers?\b",
            r"\bno blockers? reported\b",
            r"\bno blockers? mentioned\b",
            r"\bi have not (?:got|get|had|encountered|found) (?:any )?blockers?\b",
            r"\bi haven.t (?:got|get|had|encountered|found) (?:any )?blockers?\b",
            r"\bi have no blockers?\b",
            r"\bi do not have (?:any )?blockers?\b",
            r"\bi don.t have (?:any )?blockers?\b",
            r"\bthere are no blockers?\b",
            r"\bno blockers? (?:at the moment|currently|for now)\b",
            r"\bnone\b",
            r"^no$",
            r"^n/?a$",
        )
        return any(re.search(pattern, text) for pattern in no_blocker_patterns)

    def parse_datetime(value):
        if not value:
            return None
        if isinstance(value, datetime):
            parsed = value
        else:
            try:
                parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
            except (TypeError, ValueError):
                return None
        # Convert comparable timestamps to a numeric timestamp; naive values are treated as UTC.
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.timestamp()

    ai_analysis = as_dict(project_data.get("ai_analysis"))
    progress_evaluation = as_dict(project_data.get("progress_evaluation"))
    mentor_analysis = as_dict(project_data.get("mentor_risk_analysis"))
    progress_records = as_list(project_data.get("progress"))
    milestones = as_list(ai_analysis.get("milestones") or project_data.get("milestones"))
    initial_risks = as_list(ai_analysis.get("risks") or project_data.get("risks"))
    weekly_checkins = [item for item in as_list(project_data.get("weekly_checkins")) if isinstance(item, dict)]

    title = clean_text(project_data.get("title")) or "Untitled project"
    project_status = clean_text(project_data.get("status"))

    # Keep the latest progress record per week; when no timestamp exists, later array entries win.
    latest_progress_by_week = {}
    for index, record in enumerate(progress_records):
        if not isinstance(record, dict) or record.get("week") is None:
            continue
        week_key = str(record["week"])
        stamp = max((parse_datetime(record.get(key)) for key in ("updated_at", "created_at", "timestamp", "submitted_at") if parse_datetime(record.get(key)) is not None), default=None)
        previous = latest_progress_by_week.get(week_key)
        if previous is None or (stamp is not None and (previous[1] is None or stamp >= previous[1])) or (stamp is None and previous[1] is None and index >= previous[0]):
            latest_progress_by_week[week_key] = (index, stamp, record)
    current_progress_records = [entry[2] for entry in latest_progress_by_week.values()]
    if not current_progress_records:
        current_progress_records = [record for record in progress_records if isinstance(record, dict)]

    # Select one latest weekly check-in per week for current blocker reporting.
    # History itself is not modified or deleted.
    latest_checkin_by_week = {}
    for index, checkin in enumerate(weekly_checkins):
        week = checkin.get("week")
        if week is None:
            continue
        week_key = str(week)
        stamp = max((parse_datetime(checkin.get(key)) for key in ("updated_at", "created_at", "timestamp", "submitted_at", "date") if parse_datetime(checkin.get(key)) is not None), default=None)
        previous = latest_checkin_by_week.get(week_key)
        if previous is None or (stamp is not None and (previous[1] is None or stamp >= previous[1])) or (stamp is None and previous[1] is None and index >= previous[0]):
            latest_checkin_by_week[week_key] = (index, stamp, checkin)
    latest_checkins = [entry[2] for entry in latest_checkin_by_week.values()]
    if not latest_checkins:
        latest_checkins = weekly_checkins

    completed_weeks = progress_evaluation.get("completed_weeks")
    delayed_weeks = progress_evaluation.get("delayed_weeks")
    progress_score = progress_evaluation.get("progress_score")
    evaluation_status = clean_text(progress_evaluation.get("current_status"))
    evaluation_assessment = clean_text(progress_evaluation.get("overall_assessment"))
    mentor_assessment = clean_text(mentor_analysis.get("overall_assessment"))
    plan_adjustment_required = mentor_analysis.get("plan_adjustment_required") is True
    completed_weeks = completed_weeks if isinstance(completed_weeks, list) else []
    delayed_weeks = delayed_weeks if isinstance(delayed_weeks, list) else []

    incomplete_weeks, completed_record_weeks = [], []
    for record in current_progress_records:
        week = record.get("week")
        try:
            percentage = float(record.get("current_progress", record.get("progress", 0)) or 0)
        except (TypeError, ValueError):
            percentage = 0
        status = clean_text(record.get("status")).casefold()
        if week is not None and (percentage >= 100 or status == "completed"):
            completed_record_weeks.append(week)
        elif week is not None:
            incomplete_weeks.append(week)

    mentor_risks = [risk_text(item) for item in as_list(mentor_analysis.get("identified_risks"))]
    mentor_risks = unique_text([item for item in mentor_risks if item and not is_no_blocker_statement(item)])
    mentor_blockers = [risk_text(item) for item in as_list(mentor_analysis.get("blockers"))]
    mentor_blockers = unique_text([item for item in mentor_blockers if item and not is_no_blocker_statement(item)])

    # Report blockers from the latest identifiable check-in per week, not every historical submission.
    current_checkin_blockers = []
    for checkin in latest_checkins:
        for blocker in as_list(checkin.get("blockers")):
            blocker_text = risk_text(blocker)
            if blocker_text and not is_no_blocker_statement(blocker_text):
                current_checkin_blockers.append(blocker_text)
    current_checkin_blockers = unique_text(current_checkin_blockers)

    observations, attention, follow_up, key_risks = [], [], [], []
    observations.append(f"Project status recorded in the database: {project_status or 'not specified'}.")
    if progress_score is not None:
        observations.append(f"Stored progress evaluation reports {clean_text(progress_score)}% overall progress.")
    else:
        observations.append("No stored numerical progress evaluation was found.")
    if evaluation_status:
        observations.append(f"Stored progress evaluation status: {evaluation_status}.")
    if completed_weeks:
        observations.append("Weeks marked completed by the stored progress evaluation: " + ", ".join(map(str, completed_weeks)) + ".")
    elif completed_record_weeks:
        observations.append("Weeks marked completed in current progress records: " + ", ".join(map(str, completed_record_weeks)) + ".")
    if delayed_weeks:
        observations.append("Stored progress evaluation identifies delayed weeks: " + ", ".join(map(str, delayed_weeks)) + ".")
    if evaluation_assessment:
        observations.append(f"Progress evaluation assessment: {evaluation_assessment}")

    conflicts = []
    mentor_lower = mentor_assessment.casefold()
    status_lower = evaluation_status.casefold()
    mentor_mentions_delay = any(term in mentor_lower for term in (
        "behind schedule", "delayed", "delay", "timeline concern", "schedule concern", "timeline extended", "plan adjustment"
    ))
    evaluation_says_complete = (
        status_lower == "completed"
        or ("completed" in evaluation_assessment.casefold() and not delayed_weeks)
        or (isinstance(progress_score, (int, float)) and progress_score >= 100)
    )
    if mentor_assessment and mentor_mentions_delay and evaluation_says_complete:
        conflicts.append("The progress evaluation indicates completion or 100% progress, while the stored mentor assessment reports schedule concerns.")
    if delayed_weeks and evaluation_says_complete:
        conflicts.append("The progress evaluation reports completed/100% progress but also lists delayed weeks.")
    if status_lower == "completed" and incomplete_weeks:
        conflicts.append("The progress evaluation says Completed, but current progress records contain weeks below 100%.")
    if isinstance(progress_score, (int, float)) and progress_score >= 100 and incomplete_weeks:
        conflicts.append("The stored progress score is 100%, but one or more current progress records are below 100%.")
    if not progress_evaluation:
        conflicts.append("A stored progress evaluation is missing, so overall completion cannot be independently verified.")

    if conflicts:
        observations.extend(conflicts)
        attention.extend(conflicts)
        follow_up.append("Review the progress records and completion evaluation; verify whether the stored mentor/risk assessment predates the latest progress update before making a schedule judgment.")
    if mentor_assessment:
        observations.append(f"Stored mentor/risk assessment: {mentor_assessment}")
    if plan_adjustment_required:
        if evaluation_says_complete and not delayed_weeks:
            key_risks.append(
                "The stored mentor assessment requested a plan adjustment, but the current progress evaluation reports completion and no delayed weeks; this request is unverified as a current risk."
            )
            attention.append(
                "Verify whether the stored mentor plan-adjustment request is outdated before making any schedule changes."
            )
            follow_up.append(
                "If needed, rerun the weekly mentor assessment using the latest student check-in and current project status."
            )
        else:
            key_risks.append(
                "The stored mentor/risk analysis has plan_adjustment_required set to true; verify its rationale against current progress records and deadlines."
            )
            attention.append(
                "Review the mentor's plan-adjustment flag against the current progress records and project deadlines."
            )
            follow_up.append(
                "Confirm whether a plan adjustment is still necessary and document the decision."
            )

    mentor_assessment_may_be_stale = evaluation_says_complete and not delayed_weeks
    for risk in mentor_risks:
        if mentor_assessment_may_be_stale:
            key_risks.append(
                f"Risk in stored mentor assessment (current status unverified): {risk}"
            )
        else:
            key_risks.append(f"Risk in stored mentor assessment: {risk}")
    for blocker in mentor_blockers:
        if mentor_assessment_may_be_stale:
            key_risks.append(
                f"Blocker in stored mentor assessment (current status unverified): {blocker}"
            )
        else:
            key_risks.append(f"Blocker in stored mentor assessment: {blocker}")
    for blocker in current_checkin_blockers:
        key_risks.append(f"Blocker in the latest check-in for a week: {blocker}")
    for risk in unique_text([risk_text(item) for item in initial_risks]):
        key_risks.append(f"Initial project risk (not confirmed active): {risk}")

    if not mentor_risks and not mentor_blockers and not current_checkin_blockers:
        observations.append("No specific active blocker or mentor-identified risk was found in the latest available records.")
    if weekly_checkins:
        observations.append(f"{len(weekly_checkins)} weekly check-in record(s) are stored across {len(latest_checkins)} latest-per-week record(s). Historical submissions are retained.")
        if len(weekly_checkins) > len(latest_checkins):
            observations.append("Multiple check-ins exist for at least one week; current blocker reporting uses the latest identifiable check-in for each week.")
        follow_up.append("Review the latest check-in for each week when assessing current student progress; retain historical check-ins as an audit trail.")
    else:
        observations.append("No weekly check-in history was found.")
        attention.append("No weekly check-in history is available for faculty review.")
        follow_up.append("Request a weekly check-in so progress, completed work, blockers, and next goals are documented.")

    if incomplete_weeks:
        attention.append("Review weeks with incomplete progress: " + ", ".join(map(str, unique_text(incomplete_weeks))) + ".")
        follow_up.append("Ask the student to update incomplete weeks with completed work, blockers, and next goals.")
    if not current_progress_records:
        attention.append("No current progress records were found.")
        follow_up.append("Verify that weekly progress records have been created and saved.")

    observations = unique_text(observations)
    key_risks = unique_text(key_risks)
    attention = unique_text(attention)
    follow_up = unique_text(follow_up)

    if conflicts:
        mentor_summary = f"{title}: stored records contain conflicting progress and mentor/risk assessments. Faculty review is recommended before concluding whether the project is on schedule."
    elif status_lower == "completed" or (isinstance(progress_score, (int, float)) and progress_score >= 100):
        mentor_summary = f"{title}: the stored progress evaluation reports completion or 100% progress. Review any listed risks and check-in history before confirming schedule performance."
    elif progress_score is not None:
        mentor_summary = f"{title}: the stored progress evaluation reports {clean_text(progress_score)}% progress. Use the observations and risks below to guide the next faculty check-in."
    else:
        mentor_summary = f"{title}: current progress information is incomplete or unavailable. Review the project records before assessing project health."

    return {
        "mentor_summary": mentor_summary,
        "key_progress_observations": observations,
        "key_risks": key_risks,
        "faculty_attention": attention,
        "recommended_follow_up": follow_up,
    }

def generate_project_document(

    project_data: dict,

    document_type: str

):

    """

    Generate an academic project document.

    Supported document types:

    - synopsis

    - methodology

    - progress_report

    A new CrewAI Crew instance is created for every

    document-generation request to prevent executor

    concurrency errors.

    """

    allowed_types = {

        "synopsis",

        "methodology",

        "progress_report"

    }

    # --------------------------------------------------------

    # Validate document type

    # --------------------------------------------------------

    if document_type not in allowed_types:

        raise ValueError(

            "Invalid document_type. "

            "Allowed values: synopsis, methodology, progress_report"

        )

    # --------------------------------------------------------

    # Create a NEW Crew instance for this request

    # --------------------------------------------------------

    #

    # IMPORTANT:

    #

    # Do NOT reuse a global document_generation_crew.

    # CrewAI's executor cannot be invoked concurrently

    # on the same Crew instance.

    #

    # --------------------------------------------------------

    document_generation_crew = (

        create_document_generation_crew()

    )

    # --------------------------------------------------------

    # Run document generation

    # --------------------------------------------------------

    result = document_generation_crew.kickoff(

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

            "expected_outcome": project_data.get(

                "expectedOutcome",

                ""

            ),

            "ai_analysis": project_data.get(

                "ai_analysis",

                {}

            ),

            "milestones": project_data.get(

                "milestones",

                []

            ),

            "risks": project_data.get(

                "risks",

                []

            ),

            "progress": project_data.get(

                "progress",

                []

            ),

            "progress_evaluation": project_data.get(

                "progress_evaluation",

                {}

            ),

            "document_type": document_type

        }

    )

    # --------------------------------------------------------

    # Get generated document content

    # --------------------------------------------------------

    content = str(

        result.raw

    ).strip()

    # --------------------------------------------------------

    # Validate generated content

    # --------------------------------------------------------

    if not content:

        raise ValueError(

            "Document generation returned empty content."

        )

    # --------------------------------------------------------

    # Return generated document

    # --------------------------------------------------------

    return {

        "document_type": document_type,

        "content": content

    }
