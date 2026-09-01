from fastapi import FastAPI

from app.routes.student_routes import router as student_router
from app.routes.skill_routes import router as skill_router


app = FastAPI()

app.include_router(student_router)
app.include_router(skill_router)


@app.get("/")
def home():
    return {"message": "AI Academic Project Mentor API is running"}