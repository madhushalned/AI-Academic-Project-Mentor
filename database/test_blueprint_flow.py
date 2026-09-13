from models import Blueprint
from blueprints import (
    create_blueprint, get_blueprint,
    update_blueprint_section, update_blueprint_status
)

# Step 1: student submits idea, blueprint created empty
blueprint = Blueprint(
    student_id="23CSE9999",
    original_idea="A mobile app that tracks water intake and reminds users to hydrate."
)
create_blueprint(blueprint)
update_blueprint_status("23CSE9999", "in_progress")
print("Created blueprint:", get_blueprint("23CSE9999"))

# Step 2: Feasibility Agent writes its section
update_blueprint_section("23CSE9999", "feasibility", {
    "score": 8.2,
    "viability_report": "Feasible for a beginner-intermediate skill level."
})

# Step 3: Scope Agent writes its section
update_blueprint_section("23CSE9999", "scope", {
    "in_scope": ["Water intake logging", "Daily reminders", "Progress chart"],
    "out_of_scope": ["Social sharing", "Wearable device sync"]
})

# Step 4: Tech Stack Agent writes its section
update_blueprint_section("23CSE9999", "tech_stack", {
    "recommendations": ["React Native", "Firebase"],
    "justification": "Matches student's existing React knowledge; Firebase simplifies backend."
})

# Step 5: Planning Agent writes its section
update_blueprint_section("23CSE9999", "planning", {
    "weeks": [
        {"week_number": 1, "deliverables": "UI wireframes", "effort_hours": 6},
        {"week_number": 2, "deliverables": "Reminder notifications", "effort_hours": 8}
    ]
})

# Step 6: Risk Agent writes its section
update_blueprint_section("23CSE9999", "risk", {
    "risks": [
        {
            "description": "Notification permissions vary across devices",
            "severity": "medium",
            "mitigation": "Test on both iOS and Android early"
        }
    ]
})

# Step 7: mark pipeline complete
update_blueprint_status("23CSE9999", "completed")

# Final check — full blueprint should now have all 5 sections filled
print("\nFinal blueprint:", get_blueprint("23CSE9999"))