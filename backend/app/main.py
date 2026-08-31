from fastapi import FastAPI

from app.routes.student_routes import router as student_router

app = FastAPI()

app.include_router(student_router)


@app.get("/")
def home():
    return {"message": "AI Academic Project Mentor API is running"}