from datetime import datetime, timedelta
from connection import get_db
from models import SkillAssessment
from students import insert_skill_assessment
from query_optimization import get_recent_assessments, get_blueprints_by_status

db = get_db()

# Insert a few sample assessments with different dates
for i in range(3):
    assessment = SkillAssessment(
        student_id="23CSE7777",
        raw_scores={"python": 5 + i},
        normalized_vector={"python": 0.5 + i * 0.1},
    )
    insert_skill_assessment(assessment)

# Test 1: recent assessments query
results = get_recent_assessments("23CSE7777", limit=2)
print(f"Fetched {len(results)} recent assessments (expected 2)")

# Test 2: confirm the index is actually used, not a full collection scan
explain_result = db.skill_assessments.find(
    {"student_id": "23CSE7777"}
).sort("assessment_date", -1).explain()

stage = explain_result["queryPlanner"]["winningPlan"]["inputStage"]["stage"]
print(f"Query execution stage: {stage}")
if stage == "IXSCAN":
    print("✅ Index is being used correctly (IXSCAN, not COLLSCAN)")
else:
    print("⚠️ Index is NOT being used — check compound index setup")
    