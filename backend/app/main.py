from fastapi import FastAPI

from app.routes.ai_routes import router as ai_router


app = FastAPI(
    title="AI Academic Project Mentor API",
    description="AI-powered academic project planning and mentorship backend",
    version="1.0.0"
)

app.include_router(ai_router)


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