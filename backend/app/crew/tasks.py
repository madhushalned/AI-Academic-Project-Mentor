from crewai import Task

from app.crew.agents import (
    project_analysis_agent,
    feasibility_agent,
    technology_agent,
    planning_agent,
    risk_agent
)

from app.schemas.analysis_schema import (
    ScopeAnalysis,
    FeasibilityAnalysis,
    TechnologyRecommendation,
    MilestonePlan,
    RiskAssessment
)


# ============================================================
# 1. PROJECT ANALYSIS TASK
# ============================================================

project_analysis_task = Task(
    description=(
        "Analyze the student's academic project carefully and define a "
        "realistic scope suitable for a student project.\n\n"

        "Project Title: {title}\n"
        "Project Description: {description}\n"
        "Domain: {domain}\n\n"

        "Identify:\n"
        "1. The main problem being addressed.\n"
        "2. Clear and measurable project objectives.\n"
        "3. Functionalities that MUST be included in the project.\n"
        "4. Features that are reasonable but optional.\n"
        "5. Features that should explicitly remain outside the scope.\n"
        "6. Expected technical outcomes.\n\n"

        "IMPORTANT RULES:\n"
        "- Keep the scope realistic for an academic student project.\n"
        "- Do not introduce unrelated features.\n"
        "- Do not expand the project beyond the description.\n"
        "- Avoid unrealistic commercial or enterprise requirements.\n"
        "- Focus on software development, implementation, testing, and "
        "evaluation.\n"
        "- If the project involves AI/ML, include dataset preparation, "
        "model development, evaluation, and integration where appropriate.\n"
        "- Do not assume cloud deployment is required unless the project "
        "description clearly requires it.\n\n"

        "STRICT SCOPE CONTROL:\n"
        "- Every in-scope functionality must be directly supported by the "
        "project description.\n"
        "- Do not introduce unrelated features or requirements.\n"
        "- Do not introduce databases, APIs, dashboards, real-time systems, "
        "mobile applications, cloud deployment, or external integrations "
        "unless they are explicitly required by the project description.\n"
        "- Do not assume a particular technology, platform, database, or "
        "external service unless it is justified by the stated requirements.\n"
        "- If the project involves AI/ML, include only the AI/ML activities "
        "that are appropriate for the stated problem, such as data preparation, "
        "model development, training, evaluation, and integration where "
        "applicable.\n"
        "- If the project involves image processing, focus only on the image "
        "processing or computer vision functionality explicitly required.\n"
        "- If the project involves recommendations, include recommendations "
        "only when they are explicitly part of the project requirements.\n"
        "- Do not add domain-specific features that are not mentioned in the "
        "project description.\n"
        "- Keep the scope focused on the actual problem, objectives, and "
        "requirements provided by the student."
    ),

    expected_output=(
        "A structured academic project analysis containing the problem "
        "statement, objectives, in-scope items, out-of-scope items, "
        "key functionalities, and expected outcomes."
    ),

    agent=project_analysis_agent,

    output_pydantic=ScopeAnalysis
)


# ============================================================
# 2. FEASIBILITY TASK
# ============================================================

feasibility_task = Task(
    description=(
        "Evaluate whether the student's academic project is realistically "
        "feasible for a student development team.\n\n"

        "Project Title: {title}\n"
        "Project Description: {description}\n"
        "Domain: {domain}\n\n"

        "Use the Project Analysis result provided as context.\n\n"

        "Evaluate the following:\n"
        "1. Technical feasibility.\n"
        "2. Time feasibility.\n"
        "3. Resource feasibility.\n"
        "4. Required technical skills.\n"
        "5. Dataset or data availability if applicable.\n"
        "6. Implementation complexity.\n"
        "7. Integration complexity.\n"
        "8. Major limitations.\n\n"

        "Provide:\n"
        "- A feasibility score from 0 to 100.\n"
        "- A decision such as 'Feasible', 'Partially feasible', or "
        "'Not feasible'.\n"
        "- Major strengths.\n"
        "- Major concerns.\n"
        "- Practical recommendations.\n\n"

        "IMPORTANT RULES:\n"
        "- Judge feasibility for a student academic project, not a "
        "commercial production system.\n"
        "- Do not require expensive infrastructure unless necessary.\n"
        "- Prefer publicly available datasets and free/open-source tools.\n"
        "- Do not recommend field experiments, external experts, or "
        "large-scale deployment unless explicitly required.\n"
        "- If the scope is too large, recommend reducing the scope rather "
        "than expanding resources.\n"
        "- Do not introduce feasibility concerns for features that are "
        "not actually required by the project description.\n"
        "- Base concerns and recommendations only on the defined project "
        "scope and actual technical requirements."

        "- Treat all functionality explicitly mentioned in the project "
        "description as an existing project requirement.\n"
        "- If the project description includes disease-related recommendations, "
        "treat those recommendations as part of the current project scope.\n"
        "- Do not describe disease-related recommendations as a future feature "
        "or optional expansion.\n"
        "- Disease-related recommendations can be generated locally using "
        "predefined rules, project knowledge, or the AI/ML system output; "
        "do not assume an external API is required.\n"
    ),

    expected_output=(
        "A structured feasibility assessment containing a score, decision, "
        "strengths, concerns, and practical recommendations."
    ),

    agent=feasibility_agent,

    context=[project_analysis_task],

    output_pydantic=FeasibilityAnalysis
)


# ============================================================
# 3. TECHNOLOGY RECOMMENDATION TASK
# ============================================================

technology_task = Task(
    description=(
        "Recommend a practical technology stack for the student's "
        "academic project.\n\n"

        "Project Title: {title}\n"
        "Project Description: {description}\n"
        "Domain: {domain}\n\n"

        "Use the previous project analysis and feasibility assessment "
        "as context.\n\n"

        "Recommend:\n"
        "1. Programming language(s).\n"
        "2. Frameworks and libraries.\n"
        "3. ONE primary database if a database is required.\n"
        "4. AI/ML techniques if applicable.\n"
        "5. Development tools.\n"
        "6. External APIs only if genuinely necessary.\n"
        "7. A concise justification for the complete technology stack.\n\n"

        "IMPORTANT TECHNOLOGY RULES:\n"
        "- Recommend technologies based directly on the project "
        "requirements.\n"
        "- Prefer free and open-source technologies.\n"
        "- Do not recommend multiple competing databases.\n"
        "- Recommend a database only when the project requirements "
        "actually need persistent structured data storage.\n"
        "- If a database is required, select ONE primary database and "
        "explain why it is suitable.\n"
        "- Do not recommend Google Cloud Vision, Azure Computer Vision, "
        "or similar external APIs when the project itself develops and "
        "trains its own computer vision model.\n"
        "- Do not recommend unnecessary cloud services.\n"
        "- Do not recommend technologies merely because they are popular.\n"
        "- Every recommended technology must have a clear purpose.\n"
        "- Keep the stack simple enough for a student team to implement "
        "and maintain.\n\n"
        "- Training datasets, image files, CSV files, model files, and temporary "
        "files do not by themselves justify using a database.\n"
        "- If persistent application data storage is not explicitly required by "
        "the project description, the database field MUST be [].\n"
        "- If the project only requires image input, prediction, evaluation, "
        "and recommendations, do not recommend a database.\n"

        "IMPORTANT API RULE:\n"
        "- The APIs field must contain only actual external APIs required by "
        "the project.\n"
        "- If no external API is required, return an empty list: [].\n"
        "- Never use placeholder values such as 'None', 'N/A', 'Not required', "
        "'No API', or 'None required'.\n"
        "- Do not treat Python libraries, frameworks, local modules, databases, "
        "or model files as APIs.\n"
        "- Only include an API when the project description explicitly requires "
        "an external service or when a required functionality genuinely depends "
        "on one.\n"
    ),

    expected_output=(
        "A structured technology recommendation containing programming "
        "languages, frameworks, one primary database where required, "
        "AI/ML techniques, development tools, necessary APIs, and "
        "justification."
    ),

    agent=technology_agent,

    context=[feasibility_task],

    output_pydantic=TechnologyRecommendation
)


# ============================================================
# 4. MILESTONE PLANNING TASK
# ============================================================

planning_task = Task(
    description=(
        "Create a realistic implementation plan for the student's "
        "academic project.\n\n"

        "Project Title: {title}\n"
        "Project Description: {description}\n"
        "Domain: {domain}\n\n"

        "Use the previous project analysis, feasibility assessment, "
        "and technology recommendation as context.\n\n"

        "Create a realistic week-by-week implementation plan.\n\n"

        "For each milestone include:\n"
        "1. Week number.\n"
        "2. Milestone title.\n"
        "3. Specific development tasks.\n"
        "4. Task priorities.\n"
        "5. Dependencies.\n"
        "6. Estimated timeline.\n"
        "7. Concrete software/project deliverables.\n\n"

        "IMPORTANT RULES:\n"
        "- Create approximately 6 to 10 weeks depending on project "
        "complexity.\n"
        "- Do not create unnecessary milestones.\n"
        "- Dependencies must refer to actual previous project outputs.\n"
        "Deliverables should be concrete artifacts appropriate to the project, "
        "such as datasets, source code, trained models, required APIs, required "
        "database modules, UI components, test reports, evaluation results, "
        "or documentation. Only include an artifact when it is actually "
        "required by the project.\n"
        "- Do not use vague deliverables such as 'work completed'.\n"
        "- Do not add commercial deployment unless required.\n"
        "- Do not introduce technologies that were not recommended.\n"
        "- AI/ML projects should normally include data preparation, "
        "model development, training, evaluation, integration, and "
        "testing.\n"
        "- Include final integration and testing before project completion.\n\n"
        "- If the technology recommendation has database=[], DO NOT create "
        "any database development or database integration milestone.\n"
        "- Never create a milestone for storing training datasets or training "
        "images in a database unless explicitly required by the project.\n"
        "- Do not introduce dashboards, analytics, data visualization, or "
        "reporting systems unless they are explicitly required.\n"
        "- The milestone plan must follow the actual project requirements rather "
        "than automatically adding common software components.\n"

        "STRICT DEPLOYMENT RULE:\n"
        "- Do NOT include deployment as a milestone unless deployment is "
        "explicitly required in the project description.\n"
        "- For an academic prototype, prioritize local implementation, "
        "testing, evaluation, and demonstration.\n"
        "- Never add AWS, Azure, Google Cloud, cloud hosting, server "
        "deployment, or production deployment merely because it is "
        "technically possible.\n"
        "- Do not create a deployment dependency when deployment is not "
        "required.\n\n"

        "PLANNING ORDER:\n"
        "- Follow a logical implementation sequence.\n"
        "- Data preparation must occur before model training.\n"
        "- Model development must occur before model evaluation.\n"
        "- Required backend/database components should be developed "
        "before final integration.\n"
        "- UI components should be integrated after the required backend "
        "functionality is available.\n"
        "- Final testing and evaluation must occur after all required "
        "components are integrated."
    ),

    expected_output=(
        "A structured milestone plan containing realistic weekly milestones. "
        "Each milestone must contain week, title, tasks, priorities, "
        "dependencies, timeline, and concrete deliverables."
    ),

    agent=planning_agent,

    context=[technology_task],

    output_pydantic=MilestonePlan
)


# ============================================================
# 5. RISK ASSESSMENT TASK
# ============================================================

risk_task = Task(
    description=(
        "Identify realistic risks that could affect successful completion "
        "of the student's academic project.\n\n"

        "Project Title: {title}\n"
        "Project Description: {description}\n"
        "Domain: {domain}\n\n"

        "Use the previous project analysis, feasibility assessment, "
        "technology recommendation, and project plan as context.\n\n"

        "Consider risks related to:\n"
        "1. Technical implementation.\n"
        "2. Dataset or data availability.\n"
        "3. Model performance if AI/ML is involved.\n"
        "4. Development schedule.\n"
        "5. Team skills.\n"
        "6. Integration between components.\n"
        "7. Testing and validation.\n"
        "8. Scope changes.\n"
        "9. Software or technology dependencies.\n"
        "10. Hardware or computational limitations.\n\n"

        "For each important risk provide:\n"
        "- Risk description.\n"
        "- Likelihood: Low, Medium, or High.\n"
        "- Impact: Low, Medium, or High.\n"
        "- A practical mitigation strategy.\n\n"

        "IMPORTANT RULES:\n"
        "- Risks must be directly relevant to the project.\n"
        "- Avoid duplicate risks.\n"
        "- Mitigation strategies must be achievable by a student team.\n"
        "- Do not suggest hiring consultants, freelancers, or external "
        "experts.\n"
        "- Do not recommend paid external services unless explicitly "
        "required by the project.\n"
        "- Do not recommend cloud infrastructure merely as a default "
        "solution.\n"
        "- Prefer practical solutions such as reducing scope, using "
        "public datasets, data augmentation, modular development, "
        "backup technologies, version control, testing, and regular "
        "progress reviews.\n"
        "- Do not create risks for technologies that are not being used.\n\n"

        "HARDWARE LIMITATION RULE:\n"
        "- For hardware limitations, prefer smaller models, transfer "
        "learning, reduced image resolution, batch-size adjustment, "
        "CPU/GPU optimization, or Google Colab when available.\n"
        "- Do not recommend distributed computing or paid cloud GPU "
        "infrastructure unless explicitly required.\n\n"

        "TEAM SKILL RULE:\n"
        "- If team skills are limited, recommend internal learning, "
        "documentation, tutorials, pair programming, code reviews, "
        "modular development, or simplifying the implementation.\n"
        "- Do not recommend hiring consultants, freelancers, or "
        "external experts."
    ),

    expected_output=(
        "A structured risk assessment containing a list of realistic and "
        "project-specific risks. Each risk must contain risk description, "
        "likelihood, impact, and a practical mitigation strategy."
    ),

    agent=risk_agent,

    context=[planning_task],

    output_pydantic=RiskAssessment
)
