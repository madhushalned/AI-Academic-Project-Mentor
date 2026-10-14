from models import Student, SkillAssessment, Blueprint, CheckIn, GeneratedDocument, ProgressUpdate
from students import insert_student, get_student, insert_skill_assessment, get_latest_assessment
from blueprints import create_blueprint, get_blueprint, update_blueprint_section, update_progress
from checkins import log_checkin, get_checkins_for_student
from versioning import get_version_history
from documents import save_document_metadata, get_documents_for_student
from progress import log_progress_update, get_open_blockers, resolve_blocker
from dashboard import get_team_dashboard, get_team_health_summary

SID = "23REGRESSION01"
TEAM = "team_regression"

print("1. Student + skill assessment...")
insert_student(Student(student_id=SID, name="Regression Test", email="reg@test.com", team_id=TEAM))
insert_skill_assessment(SkillAssessment(student_id=SID, raw_scores={"python": 8}, normalized_vector={"python": 0.8}))
assert get_student(SID) is not None
assert get_latest_assessment(SID) is not None
print("   OK")

print("2. Blueprint creation + section update + versioning...")
create_blueprint(Blueprint(student_id=SID, original_idea="Regression test idea."))
update_blueprint_section(SID, "feasibility", {"score": 9.0, "viability_report": "Strong."})
history = get_version_history(SID)
assert len(history) == 1
print("   OK")

print("3. Check-in + progress sync...")
log_checkin(CheckIn(student_id=SID, week_number=1, student_message="Going well.", status="on_track", progress_percentage=35))
assert get_blueprint(SID)["progress_percentage"] == 35
assert len(get_checkins_for_student(SID)) == 1
print("   OK")

print("4. Document metadata...")
save_document_metadata(GeneratedDocument(student_id=SID, document_type="synopsis", content="Test synopsis."))
assert len(get_documents_for_student(SID)) == 1
print("   OK")

print("5. Blocker tracking...")
log_progress_update(ProgressUpdate(student_id=SID, week_number=1, update_type="blocker", description="Test blocker."))
assert len(get_open_blockers(SID)) == 1
resolve_blocker(SID, 1, "Test blocker.")
assert len(get_open_blockers(SID)) == 0
print("   OK")

print("6. Dashboard aggregation...")
dashboard = get_team_dashboard(TEAM)
assert len(dashboard) == 1
assert dashboard[0]["health"] == "green"
summary = get_team_health_summary(TEAM)
assert summary["green"] == 1
print("   OK")

print("\n✅ ALL REGRESSION CHECKS PASSED")
