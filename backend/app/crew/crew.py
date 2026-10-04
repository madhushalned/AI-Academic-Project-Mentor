from crewai import Crew, Process, LLM, Agent, Task

from app.crew.agents import (
    project_analysis_agent,
    feasibility_agent,
    technology_agent,
    planning_agent,
    risk_agent,
    progress_mentor_agent,
    weekly_mentor_agent,
    faculty_summary_agent
)

from app.crew.tasks import (
    project_analysis_task,
    feasibility_task,
    technology_task,
    planning_task,
    risk_task,
    progress_evaluation_task,
    weekly_mentor_task,
    faculty_summary_task,
    document_generation_task
)

llm = LLM(
    model="ollama/llama3.2:latest",
    base_url="http://localhost:11434",
    api_key="ollama",
    temperature=0.1,
    max_tokens=500
)


# ============================================================
# PROJECT PLANNING CREW
# ============================================================

project_planning_crew = Crew(
    agents=[
        project_analysis_agent,
        feasibility_agent,
        technology_agent,
        planning_agent,
        risk_agent
    ],

    tasks=[
        project_analysis_task,
        feasibility_task,
        technology_task,
        planning_task,
        risk_task
    ],

    process=Process.sequential,
    verbose=True
)


# ============================================================
# PROGRESS EVALUATION CREW
# ============================================================

progress_evaluation_crew = Crew(
    agents=[
        progress_mentor_agent
    ],

    tasks=[
        progress_evaluation_task
    ],

    process=Process.sequential,
    llm=llm,
    verbose=True
)


# ============================================================
# WEEKLY MENTOR CREW
# ============================================================

weekly_mentor_crew = Crew(
    agents=[
        weekly_mentor_agent
    ],

    tasks=[
        weekly_mentor_task
    ],

    process=Process.sequential,
    llm=llm,
    verbose=True
)


# ============================================================
# FACULTY SUMMARY CREW
# ============================================================

faculty_summary_crew = Crew(
    agents=[
        faculty_summary_agent
    ],

    tasks=[
        faculty_summary_task
    ],

    process=Process.sequential,
    llm=llm,
    verbose=True
)


# ============================================================
# DOCUMENT GENERATION CREW
# ============================================================

def create_document_generation_crew():

    # --------------------------------------------------------
    # Create a fresh Agent for every document request
    # --------------------------------------------------------

    fresh_document_agent = Agent(
        role="Academic Document Generation Specialist",

        goal=(
            "Generate accurate, well-structured academic project documents "
            "based only on the student's actual project information, AI analysis, "
            "milestones, risks, and recorded progress."
        ),

        backstory=(
            "You are an experienced academic technical writer and project mentor. "
            "You create clear and academically appropriate project documentation "
            "for student projects. You strictly use the information provided by "
            "the project and never invent technologies, results, datasets, "
            "experiments, progress, or achievements."
        ),

        llm=llm,
        verbose=True
    )

    # --------------------------------------------------------
    # Create a fresh Task for every document request
    # --------------------------------------------------------

    fresh_document_task = Task(
        description=document_generation_task.description,
        expected_output=document_generation_task.expected_output,
        agent=fresh_document_agent
    )

    # --------------------------------------------------------
    # Create a fresh Crew for every document request
    # --------------------------------------------------------

    return Crew(
        agents=[
            fresh_document_agent
        ],

        tasks=[
            fresh_document_task
        ],

        process=Process.sequential,
        llm=llm,
        verbose=True
    )