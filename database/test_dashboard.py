from models import Student, Blueprint, CheckIn, ProgressUpdate
from students import insert_student
from blueprints import create_blueprint
from checkins import log_checkin
from progress import log_progress_update
from dashboard import get_team_dashboard, get_team_health_summary

TEAM = "team_test_01"

# Student A — on track, green
insert_student(Student(student_id="23A001", name="Student A", email="a@test.com", team_id=TEAM))
create_blueprint(Blueprint(student_id="23A001", original_idea="Idea A"))
log_checkin(CheckIn(student_id="23A001", week_number=1, student_message="On track.", status="on_track", progress_percentage=40))

# Student B — behind, yellow
insert_student(Student(student_id="23A002", name="Student B", email="b@test.com", team_id=TEAM))
create_blueprint(Blueprint(student_id="23A002", original_idea="Idea B"))
log_checkin(CheckIn(student_id="23A002", week_number=1, student_message="Fell behind.", status="behind", progress_percentage=10))

# Student C — has an open blocker, red
insert_student(Student(student_id="23A003", name="Student C", email="c@test.com", team_id=TEAM))
create_blueprint(Blueprint(student_id="23A003", original_idea="Idea C"))
log_checkin(CheckIn(student_id="23A003", week_number=1, student_message="Stuck.", status="blocked", progress_percentage=5))
log_progress_update(ProgressUpdate(
    student_id="23A003", week_number=1, update_type="blocker",
    description="Can't get API key approved."
))

# Run the dashboard
print("=== Team Dashboard ===")
for row in get_team_dashboard(TEAM):
    print(f"  {row['name']}: {row['progress_percentage']}% | {row['checkin_status']} | "
          f"{row['open_blocker_count']} blockers | health = {row['health']}")

print("\n=== Team Health Summary ===")
print(get_team_health_summary(TEAM))
