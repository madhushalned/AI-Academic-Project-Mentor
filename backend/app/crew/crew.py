from crewai import Crew, Process, LLM

from app.crew.agents import (
    project_analysis_agent,
    feasibility_agent,
    technology_agent,
    planning_agent,
    risk_agent
)

from app.crew.tasks import (
    project_analysis_task,
    feasibility_task,
    technology_task,
    planning_task,
    risk_task
)

llm = LLM(
    model="ollama/llama3.2:latest",
    base_url="http://localhost:11434",
    api_key="ollama",
    temperature=0.1,
    max_tokens=500
)

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