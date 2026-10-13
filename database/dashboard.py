from connection import get_db

db = get_db()


def compute_health_status(checkin_status: str, progress_percentage: int, open_blocker_count: int) -> str:
    """Simple traffic-light rule — adjust thresholds later as the team sees real data."""
    if open_blocker_count > 0:
        return "red"
    if checkin_status == "blocked":
        return "red"
    if checkin_status in ("behind", "no_checkin"):
        return "yellow"
    return "green"


def get_team_dashboard(team_id: str):
    """
    One aggregation pipeline that joins students -> their blueprint ->
    their latest check-in -> their open blockers, all in a single DB call.
    """
    pipeline = [
        {"$match": {"team_id": team_id}},

        # Join each student's blueprint
        {"$lookup": {
            "from": "blueprints",
            "localField": "student_id",
            "foreignField": "student_id",
            "as": "blueprint"
        }},
        {"$unwind": {"path": "$blueprint", "preserveNullAndEmptyArrays": True}},

        # Join only each student's single most recent check-in
        {"$lookup": {
            "from": "check_ins",
            "let": {"sid": "$student_id"},
            "pipeline": [
                {"$match": {"$expr": {"$eq": ["$student_id", "$$sid"]}}},
                {"$sort": {"created_at": -1}},
                {"$limit": 1}
            ],
            "as": "latest_checkin"
        }},
        {"$unwind": {"path": "$latest_checkin", "preserveNullAndEmptyArrays": True}},

        # Join only unresolved blockers
        {"$lookup": {
            "from": "progress_updates",
            "let": {"sid": "$student_id"},
            "pipeline": [
                {"$match": {"$expr": {"$and": [
                    {"$eq": ["$student_id", "$$sid"]},
                    {"$eq": ["$update_type", "blocker"]},
                    {"$eq": ["$resolved", False]}
                ]}}}
            ],
            "as": "open_blockers"
        }},

        # Shape the final output — only the fields the dashboard actually needs
        {"$project": {
            "_id": 0,
            "student_id": 1,
            "name": 1,
            "progress_percentage": {"$ifNull": ["$blueprint.progress_percentage", 0]},
            "checkin_status": {"$ifNull": ["$latest_checkin.status", "no_checkin"]},
            "open_blocker_count": {"$size": "$open_blockers"}
        }}
    ]

    results = list(db.students.aggregate(pipeline))

    # health status is custom logic, so compute it in Python after the DB does the heavy lifting
    for r in results:
        r["health"] = compute_health_status(
            r["checkin_status"], r["progress_percentage"], r["open_blocker_count"]
        )

    return results


def get_team_health_summary(team_id: str):
    """Quick counts for a team-level overview card — e.g. '3 green, 1 yellow, 0 red'."""
    students = get_team_dashboard(team_id)
    summary = {"green": 0, "yellow": 0, "red": 0}
    for s in students:
        summary[s["health"]] += 1
    return summary
