from fastapi import FastAPI

app = FastAPI(
    title="AI Academic Project Mentor",
    description="Backend API for AI-guided academic project planning and mentorship",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "message": "AI Academic Project Mentor API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }