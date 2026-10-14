# AI-Academic-Project-Mentor
AI-Guided Academic Project Progress Tracking and Mentorship Platform using Multi-Agent AI

## Overview

The AI-Guided Academic Project Progress Tracking and Mentorship Platform is a web-based application that helps students plan, manage, and monitor their academic projects with the assistance of multi-agent artificial intelligence.

Students can submit project ideas, receive AI-generated feasibility assessments and technology recommendations, follow week-wise milestones, record weekly progress, and identify potential risks. Faculty members can monitor student projects and review AI-generated progress summaries through a dedicated dashboard.

## Key Features

- **AI Project Analysis:** Evaluates submitted project ideas.
- **Feasibility Assessment:** Helps assess project scope and practicality.
- **Technology Recommendations:** Suggests suitable technologies for the project.
- **Milestone Planning:** Generates a week-wise project plan.
- **Risk Assessment:** Identifies potential risks and mitigation strategies.
- **Weekly Progress Tracking:** Records completed tasks, hours spent, and challenges.
- **AI Mentorship:** Supports progress evaluation and planning adjustments.
- **Faculty Dashboard:** Enables faculty to monitor projects and review summaries.
- **Student Profile and Skill Assessment:** Supports student profiles and skill tracking.

## Technology Stack

### Frontend
- React.js
- Vite
- JavaScript
- CSS

### Backend
- Python
- FastAPI
- Uvicorn
- Pydantic

### Database
- MongoDB

### Artificial Intelligence
- CrewAI for multi-agent orchestration
- Ollama for running the local Llama 3.2 model

### Development Tools
- Visual Studio Code
- Git and GitHub
- Python virtual environment (`venv`)
- Node.js and npm

## Installation and Setup

### Prerequisites

Install the following tools before running the project:

- Python 3.12
- Node.js and npm
- MongoDB
- Ollama
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/madhushalned/AI-Academic-Project-Mentor.git
cd AI-Academic-Project-Mentor
```

### 2. Configure the Backend

Open a terminal in the project root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Configure the required environment variables and MongoDB connection settings according to your backend configuration.

### 3. Start the Backend

From the `backend` directory, activate the virtual environment if necessary, then run:

```powershell
uvicorn app.main:app --reload
```

The backend should be available at:

`http://127.0.0.1:8000`

API documentation:

`http://127.0.0.1:8000/docs`

### 4. Configure the Frontend

Open a second terminal from the project root:

```powershell
cd frontend
npm install
```

### 5. Start the Frontend

```powershell
npm run dev
```

Open the local URL displayed by Vite in your browser.

### 6. Configure the AI Model

Install and start Ollama, and ensure the Llama 3.2 model is available locally. Configure the backend to connect to your Ollama server using the settings required by your AI service.

### 7. Run Backend Tests

From the project root, run:

```powershell
backend\.venv\Scripts\python -m pytest -v backend\test_mentor_verification.py backend\test_integration_flow.py
```

## API Overview

The backend exposes REST API endpoints for project management, AI analysis, progress tracking, student profiles, and faculty operations.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/projects/` | Create a project |
| GET | `/projects/` | Retrieve projects |
| GET | `/projects/{project_id}` | Retrieve project details |
| POST | `/projects/{project_id}/analyze` | Trigger AI project analysis |
| POST | `/ai/analyze-project` | Run AI project analysis |
| POST | `/ai/evaluate-progress` | Evaluate project progress |
| GET | `/projects/{project_id}/progress` | Retrieve project progress |
| PUT | `/projects/{project_id}/progress` | Update project progress |
| GET | `/projects/{project_id}/milestones` | Retrieve project milestones |
| GET | `/faculty/projects/{project_id}/summary` | Retrieve a faculty project summary |

Interactive API documentation is available at `http://127.0.0.1:8000/docs` when the backend is running.

**Note:** The endpoint list is a high-level overview. Refer to the live API documentation for the complete endpoint list and required request parameters.

