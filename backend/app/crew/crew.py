from crewai import Crew, Process

from app.crew.agents import project_analysis_agent, feasibility_agent, technology_agent, planning_agent, risk_agent
from app.crew.tasks import project_analysis_task, feasibility_task, technology_task, planning_task, risk_task

project_planning_crew = Crew(
    agents=[project_analysis_agent, feasibility_agent, technology_agent, planning_agent, risk_agent],
    tasks=[project_analysis_task, feasibility_task, technology_task, planning_task, risk_task],

    process=Process.sequential,
    verbose=True
)