from models import Blueprint
from blueprints import create_blueprint, update_blueprint_section, get_blueprint
from versioning import get_version_history, get_specific_version

# Step 1: create a fresh blueprint
blueprint = Blueprint(
    student_id="23CSE6666",
    original_idea="A budgeting app for college students."
)
create_blueprint(blueprint)
print("Created — version:", get_blueprint("23CSE6666")["version"])

# Step 2: first update (simulates Feasibility Agent)
update_blueprint_section("23CSE6666", "feasibility", {
    "score": 7.0,
    "viability_report": "Feasible, moderate complexity."
})
print("After update 1 — version:", get_blueprint("23CSE6666")["version"])

# Step 3: second update (simulates Scope Agent)
update_blueprint_section("23CSE6666", "scope", {
    "in_scope": ["Expense tracking", "Monthly budget limit"],
    "out_of_scope": ["Bank account sync"]
})
print("After update 2 — version:", get_blueprint("23CSE6666")["version"])

# Step 4: check full history
history = get_version_history("23CSE6666")
print(f"\nTotal archived versions: {len(history)}")
for h in history:
    print(f"  Version {h['version']} archived at {h['archived_at']}")

# Step 5: fetch one specific old version
old = get_specific_version("23CSE6666", 1)
print("\nVersion 1 snapshot had feasibility:", old["snapshot"].get("feasibility"))