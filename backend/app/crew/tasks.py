from crewai import Task

from app.crew.agents import project_analysis_agent, feasibility_agent, technology_agent, planning_agent, risk_agent

project_analysis_task = Task(
    description=(
        "Analyze the student's academic project based on the following information:\n\n"
        "Project Title: {title}\n"
        "Project Description: {description}\n"
        "Domain: {domain}\n\n"
        "Identify and explain:\n"
        "1. The main problem being addressed.\n"
        "2. The primary objectives of the project.\n"
        "3. The proposed scope of the project.\n"
        "4. The major functionalities that should be included.\n"
        "5. The expected outcomes.\n\n"
        "Provide a clear and structured analysis suitable for an academic project."
    ),

    expected_output=(
        "A structured project analysis containing the problem statement, "
        "objectives, scope, key functionalities, and expected outcomes."
    ),

    agent=project_analysis_agent
)

feasibility_task = Task(
    description=(
        "Evaluate the feasibility of the student's academic project.\n\n"
        "Project Title: {title}\n"
        "Project Description: {description}\n"
        "Domain: {domain}\n\n"

        "Use the Project Analysis result provided as context.\n\n"

        "Evaluate:\n"
        "1. Technical feasibility.\n"
        "2. Time feasibility.\n"
        "3. Resource feasibility.\n"
        "4. Required skills.\n"
        "5. Project complexity.\n"
        "6. Implementation challenges.\n"
        "7. Improvements needed to make the project achievable.\n\n"

        "Keep the assessment concise and practical."
    ),

    expected_output=(
        "A concise feasibility assessment covering technical feasibility, "
        "time, resources, skills, complexity, challenges, and recommendations."
    ),

    agent=feasibility_agent,

    context=[project_analysis_task]
)

technology_task = Task(
    description=(
        "Recommend suitable technologies for the student's academic project.\n\n"
        "Project Title: {title}\n"
        "Project Description: {description}\n"
        "Domain: {domain}\n\n"

        "Use the previous feasibility assessment as context.\n\n"

        "Recommend:\n"
        "1. Programming languages.\n"
        "2. Frameworks and libraries.\n"
        "3. Database.\n"
        "4. AI/ML techniques if applicable.\n"
        "5. Development tools.\n"
        "6. APIs or external services if required.\n"
        "7. Brief justification for the choices.\n\n"

        "Prefer practical, affordable, and easy-to-implement technologies."
    ),

    expected_output=(
        "A concise technology recommendation covering languages, frameworks, "
        "database, AI/ML techniques, tools, APIs, and justification."
    ),

    agent=technology_agent,

    context=[feasibility_task]
)

planning_task = Task(
    description=(
        "Create a realistic implementation plan for the student's academic project.\n\n"
        "Project Title: {title}\n"
        "Project Description: {description}\n"
        "Domain: {domain}\n\n"

        "Use the previous technology recommendation as context.\n\n"

        "Create:\n"
        "1. Major project phases.\n"
        "2. Week-by-week milestones.\n"
        "3. Important tasks.\n"
        "4. Task priorities.\n"
        "5. Dependencies.\n"
        "6. Estimated timelines.\n"
        "7. Deliverables.\n\n"

        "Keep the plan realistic for an academic project."
    ),

    expected_output=(
        "A concise project plan containing phases, weekly milestones, "
        "tasks, priorities, dependencies, timelines, and deliverables."
    ),

    agent=planning_agent,

    context=[technology_task]
)

risk_task = Task(
    description=(
        "Identify important risks that could affect successful completion "
        "of the student's academic project.\n\n"

        "Project Title: {title}\n"
        "Project Description: {description}\n"
        "Domain: {domain}\n\n"

        "Use the previous project plan as context.\n\n"

        "Identify risks related to:\n"
        "1. Technical implementation.\n"
        "2. Schedule and deadlines.\n"
        "3. Required skills.\n"
        "4. Resources.\n"
        "5. Scope.\n"
        "6. Technology dependencies.\n"
        "7. Data availability.\n"
        "8. Integration and testing.\n\n"

        "For each important risk, provide likelihood, impact, "
        "and a practical mitigation strategy."
    ),

    expected_output=(
        "A concise risk assessment containing important risks, "
        "likelihood, impact, and mitigation strategies."
    ),

    agent=risk_agent,

    context=[planning_task]
)