from models import Student, SkillAssessment
from students import insert_student, get_student, insert_skill_assessment, get_latest_assessment

student = Student(
    student_id="23CSE9999", name="Suraj Test", email="suraj.test@example.com",
    team_id="team_01", skills={"python": "intermediate", "mongodb": "beginner"}
)
insert_student(student)
print("Inserted student:", get_student("23CSE9999"))

assessment = SkillAssessment(
    student_id="23CSE9999", raw_scores={"python": 7, "mongodb": 4},
    normalized_vector={"python": 0.7, "mongodb": 0.4}, confidence="high"
)
insert_skill_assessment(assessment)
print("Inserted assessment:", get_latest_assessment("23CSE9999"))