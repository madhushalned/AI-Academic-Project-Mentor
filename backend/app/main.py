from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.ai_routes import router as ai_router
from app.routes.student_routes import router as student_router
from app.routes.skill_routes import router as skill_router
from app.routes.project_routes import router as project_router


app = FastAPI(
    title="AI Academic Project Mentor API",
    description="AI-powered academic project planning and mentorship backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(ai_router)
app.include_router(student_router)
app.include_router(skill_router)
app.include_router(project_router)


@app.get("/")
def home():
    return {
        "message": "AI Academic Project Mentor API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }