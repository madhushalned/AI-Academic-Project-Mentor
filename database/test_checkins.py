from models import CheckIn
from checkins import (
    log_checkin, get_checkins_for_student,
    get_latest_checkin, has_checked_in_this_week
)

# Simulate two weekly check-ins
log_checkin(CheckIn(
    student_id="23CSE5555",
    week_number=1,
    student_message="Finished the UI wireframes, starting on the backend next.",
    mentor_response="Great pace — make sure the backend matches the wireframe's data needs.",
    status="on_track"
))

log_checkin(CheckIn(
    student_id="23CSE5555",
    week_number=2,
    student_message="Stuck on notification permissions, haven't made progress this week.",
    mentor_response="Let's break that down — which platform is giving you trouble?",
    status="blocked"
))

# Fetch full history
history = get_checkins_for_student("23CSE5555")
print(f"Total check-ins: {len(history)}")
for h in history:
    print(f"  Week {h['week_number']} — {h['status']}: {h['student_message'][:40]}...")

# Fetch latest
latest = get_latest_checkin("23CSE5555")
print("\nLatest check-in status:", latest["status"])

# Test the dashboard helper
checked_in = has_checked_in_this_week("23CSE5555", 2)
not_checked_in = has_checked_in_this_week("23CSE5555", 3)
print(f"\nChecked in for week 2: {checked_in} (expected True)")
print(f"Checked in for week 3: {not_checked_in} (expected False)")