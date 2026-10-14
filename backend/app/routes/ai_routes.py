from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime



from app.services.ai_service import (

    analyze_project,

    evaluate_project_progress,

    analyze_weekly_mentor_update,

    generate_project_document

)



from app.services.project_service import (

    get_project_by_id,

    save_weekly_checkin,

    update_project_progress,

    update_mentor_risk_analysis

)





router = APIRouter(

    prefix="/ai",

    tags=["AI"]

)





# ============================================================

# REQUEST MODELS

# ============================================================



class ProjectAnalysisRequest(BaseModel):

    project_id: str

    title: str

    description: str

    domain: str





class ProgressEvaluationRequest(BaseModel):

    project_id: str





class WeeklyMentorRequest(BaseModel):
    project_id: str
    week: int
    completed_work: list[str] = []
    current_progress: int
    blockers: list[str] = []
    next_goals: list[str] = []
    pending_work: list[str] = []
    hours_spent: float | None = None
    remarks: str | None = None





class DocumentGenerationRequest(BaseModel):

    project_id: str

    document_type: str





# ============================================================

# PROJECT ANALYSIS

# ============================================================



@router.post("/analyze-project")

def analyze_project_endpoint(

    project: ProjectAnalysisRequest

):

    """

    Analyze a newly submitted academic project using AI.

    """



    try:

        result = analyze_project(

            project.model_dump()

        )



        return {

            "project_id": project.project_id,

            "analysis": result

        }



    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=f"AI project analysis failed: {str(e)}"

        )





# ============================================================

# PROGRESS EVALUATION

# ============================================================



@router.post("/evaluate-progress")

def evaluate_progress_endpoint(

    request: ProgressEvaluationRequest

):

    """

    Evaluate the student's current project progress using AI.



    Flow:

    1. Get project from MongoDB.

    2. Get saved progress from the project document.

    3. Attach progress to project data.

    4. Send project + progress to AI evaluator.

    5. Return the AI evaluation.

    """



    # --------------------------------------------------------

    # Step 1: Get project

    # --------------------------------------------------------



    project = get_project_by_id(

        request.project_id

    )



    if project is None:

        raise HTTPException(

            status_code=404,

            detail="Project not found"

        )



    try:



        # ----------------------------------------------------

        # Step 2: Get saved progress

        # ----------------------------------------------------



        progress = project.get(

            "progress",

            []

        )



        # Make sure progress is always a list

        if not isinstance(progress, list):

            progress = []



        # ----------------------------------------------------

        # Step 3: Attach progress explicitly

        # ----------------------------------------------------



        project["progress"] = progress



        # ----------------------------------------------------

        # Debug information

        # ----------------------------------------------------



        print(

            "Progress loaded for AI evaluation:",

            len(progress)

        )



        print(

            "Progress data:",

            progress

        )



        # ----------------------------------------------------

        # Step 4: Run AI progress evaluation

        # ----------------------------------------------------



        result = evaluate_project_progress(

            project

        )



        # ----------------------------------------------------

        # Step 5: Return result

        # ----------------------------------------------------



        return {

            "project_id": request.project_id,

            "progress_records": len(progress),

            "evaluation": result

        }



    except HTTPException:

        raise



    except Exception as e:



        print(

            f"AI progress evaluation failed: {e}"

        )



        raise HTTPException(

            status_code=500,

            detail=f"AI progress evaluation failed: {str(e)}"

        )





# ============================================================

# WEEKLY AI MENTOR

# ============================================================



@router.post("/weekly-mentor")

def weekly_mentor_endpoint(

    request: WeeklyMentorRequest

):

    """

    Analyze a student's weekly project update using the AI mentor.



    Flow:

    1. Get project.

    2. Build weekly check-in data.

    3. Save student check-in.

    4. Run AI mentor analysis.

    5. Determine current week status.

    6. Clear resolved/completed risks from CURRENT analysis.

    7. Save project progress.

    8. Save current mentor/risk analysis.

    9. Return the result.



    IMPORTANT:

    Historical weekly check-ins are NOT deleted.



    Only the CURRENT mentor/risk analysis is updated.

    """



    # --------------------------------------------------------

    # Step 1: Get project

    # --------------------------------------------------------



    project = get_project_by_id(

        request.project_id

    )



    if project is None:

        raise HTTPException(

            status_code=404,

            detail="Project not found"

        )



    # --------------------------------------------------------

    # Step 2: Prepare weekly check-in

    # --------------------------------------------------------



    checkin_data = {
        "week": request.week,
        "completed_work": request.completed_work,
        "current_progress": request.current_progress,
        "blockers": request.blockers,
        "next_goals": request.next_goals,
        "pending_work": request.pending_work or [],
        "hours_spent": request.hours_spent,
        "remarks": request.remarks,
        "submitted_at": datetime.utcnow().isoformat()
    }

    try:
        # ----------------------------------------------------
        # Step 3: Save weekly student update
        # ----------------------------------------------------
        saved = save_weekly_checkin(
            request.project_id,
            checkin_data
        )

        if not saved:
            raise HTTPException(
                status_code=500,
                detail="Failed to save weekly check-in"
            )

        # ----------------------------------------------------
        # Step 4: Run AI Mentor analysis with graceful fallback
        # ----------------------------------------------------
        try:
            analysis = analyze_weekly_mentor_update(
                project,
                checkin_data
            )
        except Exception as ai_err:
            print(f"Weekly AI mentor analysis fallback: {ai_err}")
            analysis = {
                "summary": f"Week {request.week} check-in recorded successfully. Live AI mentor evaluation is temporarily offline.",
                "status": "In Progress" if request.current_progress < 100 else "Completed",
                "recommendations": [
                    "Continue with planned milestone tasks for upcoming week.",
                    "Review active blockers with your academic supervisor if assistance is needed."
                ],
                "identified_risks": [],
                "blockers": request.blockers or []
            }



        # ----------------------------------------------------

        # Step 5: Read student-entered blockers
        # ----------------------------------------------------
        #
        # IMPORTANT:
        # The AI may identify potential risks during analysis,
        # but those AI-identified risks must NOT automatically
        # change the weekly progress status to "At Risk".
        #
        # "At Risk" is triggered ONLY when the student enters
        # one or more blockers in the weekly check-in.
        # ----------------------------------------------------

        student_blockers = request.blockers or []

        if not isinstance(
            student_blockers,
            list
        ):
            student_blockers = [student_blockers]

        # Remove empty/null blocker values
        student_blockers = [
            str(blocker).strip()
            for blocker in student_blockers
            if blocker is not None
            and str(blocker).strip()
        ]

        has_blocker = len(student_blockers) > 0

        # ----------------------------------------------------
        # Step 6: Determine current week status
        # ----------------------------------------------------
        #
        # Status rules:
        #
        # 100%                  -> Completed
        # Blocker entered      -> At Risk
        # 1-99%, no blocker    -> In Progress
        # 0%, no blocker       -> Not Started
        #
        # AI-identified risks do NOT determine status.
        # ----------------------------------------------------

        if request.current_progress >= 100:

            progress_status = "Completed"

        elif has_blocker:

            progress_status = "At Risk"

        elif request.current_progress > 0:

            progress_status = "In Progress"

        else:

            progress_status = "Not Started"

        # ----------------------------------------------------
        # Step 7: Keep AI mentor analysis
        # ----------------------------------------------------
        #
        # The AI can still identify risks and provide
        # recommendations. These are displayed as mentor
        # feedback but do not control the progress status.
        #
        # When the student provides blockers, preserve the
        # student's blockers in the saved mentor analysis.
        # When no blockers are provided, do not create an
        # active risk status.
        # ----------------------------------------------------

        if progress_status == "Completed":

            # Completed week:
            # Clear active blockers/risk from current analysis.
            analysis["blockers"] = []
            analysis["identified_risks"] = []

        elif has_blocker:

            # Student reported blockers:
            # Keep the student's blockers as the active blockers.
            analysis["blockers"] = student_blockers

        # If there are no student blockers and progress is not
        # completed, keep the AI's mentor feedback, but the
        # progress status remains In Progress or Not Started.

        # ----------------------------------------------------
        # Step 8: Build progress data
        # ----------------------------------------------------




        progress_data = {

            "week": request.week,

            "status": progress_status,

            "progress": request.current_progress,

            "remarks": request.remarks

        }



        # ----------------------------------------------------

        # Step 9: Save project progress

        # ----------------------------------------------------



        progress_updated = update_project_progress(

            request.project_id,

            progress_data

        )



        if not progress_updated:



            raise HTTPException(

                status_code=500,

                detail="Failed to update project progress"

            )



        # ----------------------------------------------------

        # Step 10: Save CURRENT mentor/risk analysis

        # ----------------------------------------------------



        saved_analysis = update_mentor_risk_analysis(

            request.project_id,

            analysis

        )



        if not saved_analysis:



            raise HTTPException(

                status_code=500,

                detail="Failed to save mentor analysis"

            )



        # ----------------------------------------------------

        # Step 11: Return result

        # ----------------------------------------------------



        return {

            "project_id": request.project_id,

            "week": request.week,

            "checkin": checkin_data,

            "progress_updated": progress_data,

            "mentor_analysis": analysis

        }



    except HTTPException:



        raise



    except Exception as e:



        print(

            f"Weekly mentor analysis failed: {e}"

        )



        raise HTTPException(

            status_code=500,

            detail=f"Weekly mentor analysis failed: {str(e)}"

        )





# ============================================================

# DOCUMENT GENERATION

# ============================================================



@router.post("/generate-document")

def generate_document_endpoint(

    request: DocumentGenerationRequest

):

    """

    Generate an academic project document using CrewAI.

    """



    allowed_types = {

        "synopsis",

        "methodology",

        "progress_report"

    }



    if request.document_type not in allowed_types:



        raise HTTPException(

            status_code=400,

            detail=(

                "Invalid document_type. "

                "Allowed values: synopsis, methodology, progress_report"

            )

        )



    project = get_project_by_id(

        request.project_id

    )



    if not project:



        raise HTTPException(

            status_code=404,

            detail="Project not found."

        )



    try:



        result = generate_project_document(

            project_data=project,

            document_type=request.document_type

        )



        return {

            "project_id": request.project_id,

            "document_type": request.document_type,

            "content": result["content"]

        }



    except ValueError as exc:



        raise HTTPException(

            status_code=400,

            detail=str(exc)

        )



    except Exception as exc:



        print(

            f"Document generation failed: {exc}"

        )



        raise HTTPException(

            status_code=500,

            detail="Document generation failed."

        )