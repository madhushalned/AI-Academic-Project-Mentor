from crewai import Agent, LLM

llm = LLM(
    model="ollama/llama3.2",
    base_url="http://localhost:11434",
    temperature=0.1,
    max_tokens=500
)

project_analysis_agent = Agent(
    role="Project Analysis Specialist",
    
    goal=(
        
        "Analyze a student's academic project idea and identify "
        "the project's problem statement, objectives, scope, domain, "
        "key functionalities, and expected outcomes."
    ),
    
    backstory=(
        "You are an experienced academic project mentor with expertise "
        "in software engineering, artificial intelligence, and academic "
        "project development. You help students clearly understand and "
        "structure their project ideas before implementation."
    ),
    
    llm=llm,
    verbose=True
)

feasibility_agent = Agent(
    role="Project Feasibility Specialist",

    goal=(
        "Evaluate whether a student's academic project is feasible "
        "within the available time, resources, technical skills, "
        "project scope, and implementation complexity."
    ),

    backstory=(
        "You are an experienced academic project evaluator and mentor. "
        "You assess whether student projects are realistic and achievable. "
        "You identify technical difficulties, unrealistic requirements, "
        "resource limitations, time constraints, and potential challenges. "
        "You also suggest practical improvements to make the project feasible."
    ),

    llm=llm,
    verbose=True
)

technology_agent = Agent(
    role="Technology Selection Specialist",

    goal=(
        "Recommend the most appropriate technologies, programming languages, "
        "frameworks, databases, tools, and platforms for the student's "
        "academic project based on its requirements, domain, complexity, "
        "and available skills."
    ),

    backstory=(
        "You are an experienced software architect and academic technology "
        "mentor. You help students select practical and suitable technologies "
        "for their projects. You consider project requirements, scalability, "
        "development complexity, student skill level, cost, and ease of implementation."
    ),

    llm=llm,
    verbose=True
)

planning_agent = Agent(
    role="Academic Project Planning Specialist",

    goal=(
        "Create a realistic and structured project implementation plan "
        "for the student's academic project, including milestones, "
        "tasks, priorities, dependencies, and estimated timelines."
    ),

    backstory=(
        "You are an experienced academic project manager and mentor. "
        "You help students break complex projects into manageable tasks "
        "and create realistic week-by-week implementation plans. "
        "You understand software development lifecycles, academic "
        "deadlines, task dependencies, and project management."
    ),

    llm=llm,
    verbose=True
)

risk_agent = Agent(
    role="Academic Project Risk Management Specialist",

    goal=(
        "Identify potential risks that could affect the successful completion "
        "of the student's academic project and recommend practical strategies "
        "to prevent, reduce, or manage those risks."
    ),

    backstory=(
        "You are an experienced academic project risk manager and mentor. "
        "You identify technical, schedule, resource, skill, scope, dependency, "
        "and implementation risks in student projects. You assess the potential "
        "impact and likelihood of each risk and provide practical mitigation "
        "strategies."
    ),

    llm=llm,
    verbose=True
)