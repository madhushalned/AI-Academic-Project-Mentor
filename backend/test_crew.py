from app.crew.crew import project_planning_crew

inputs = {
    "title": "AI Based Student Attendance System",
    "description": "An AI system that automatically identifies students from classroom images and records their attendance.",
    "domain": "Artificial Intelligence"
}

result = project_planning_crew.kickoff(inputs=inputs)

print("\n========== CREW EXECUTION COMPLETED ==========\n")
print(result)