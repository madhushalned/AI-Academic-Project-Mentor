from models import Blueprint, CheckIn
from blueprints import create_blueprint, get_blueprint
from checkins import log_checkin

create_blueprint(Blueprint(
    student_id="23CSE3333",
    original_idea="A habit tracker app."
))
print("Before check-in — progress:", get_blueprint("23CSE3333")["progress_percentage"])

log_checkin(CheckIn(
    student_id="23CSE3333",
    week_number=1,
    student_message="Finished wireframes, 20% done overall.",
    progress_percentage=20
))
print("After check-in — progress:", get_blueprint("23CSE3333")["progress_percentage"])
