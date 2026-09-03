from fastapi import FastAPI

from app.routes.ai_routes import router as ai_router
from app.routes.student_routes import router as student_router
from app.routes.skill_routes import router as skill_router


app = FastAPI(
    title="AI Academic Project Mentor API",
    description="AI-powered academic project planning and mentorship backend",
    version="1.0.0"
)

# Include API routers
app.include_router(ai_router)
app.include_router(student_router)
app.include_router(skill_router)


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