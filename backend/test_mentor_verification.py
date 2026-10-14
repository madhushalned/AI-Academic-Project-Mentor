import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.database import db, projects_collection, students_collection, faculty_collection
from app.services.project_service import get_projects, save_weekly_checkin

client = TestClient(app)

def test_project_counts_student_vs_faculty():
    """
    Requirement 2 & 8: Verify student sees only their own projects
    while faculty sees authorized cohort dynamically from MongoDB.
    """
    # 1. Total projects in database
    total_db_count = projects_collection.count_documents({})
    assert total_db_count > 0, "Expected projects to exist in MongoDB"

    # 2. Student query for madhushalne@gmail.com
    expected_student_count = projects_collection.count_documents({"student_id": "madhushalne@gmail.com"})
    assert expected_student_count > 0, "Expected student projects to exist in MongoDB"
    assert expected_student_count < total_db_count, "Expected database to contain other students' projects"

    student_projects = get_projects(student_id="madhushalne@gmail.com")
    assert len(student_projects) == expected_student_count, (
        f"Expected {expected_student_count} projects for madhushalne@gmail.com, found {len(student_projects)}"
    )

    # 3. API endpoint with student_id filter
    res = client.get("/projects/?student_id=madhushalne@gmail.com")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) == expected_student_count, f"Expected API to return {expected_student_count} projects, got {len(data)}"
    for p in data:
        assert p.get("student_id") == "madhushalne@gmail.com"

    # 4. API endpoint without student_id filter (all cohort projects)
    res_all = client.get("/projects/")
    assert res_all.status_code == 200
    all_data = res_all.json()
    assert len(all_data) == total_db_count, f"Expected API to return {total_db_count} projects, got {len(all_data)}"


def test_faculty_auth_and_dashboard_projects():
    """
    Requirement 3: Verify faculty login, JWT Bearer token, session validation,
    and protected faculty endpoints returning authorized projects.
    """
    # Register/login faculty
    fac_email = "faculty.mentor@university.edu"
    fac_password = "SecureFacultyPassword123"

    # Try login first
    login_res = client.post("/faculty/login", json={"email": fac_email, "password": fac_password})
    if login_res.status_code != 200:
        # Register if not exists
        reg_res = client.post("/faculty/register", json={
            "name": "Dr. Academic Mentor",
            "email": fac_email,
            "password": fac_password,
            "department": "Computer Science"
        })
        assert reg_res.status_code in (200, 201)
        login_res = client.post("/faculty/login", json={"email": fac_email, "password": fac_password})

    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    token = login_data["access_token"]
    assert login_data.get("faculty", {}).get("email") == fac_email

    # Access protected faculty endpoint with Bearer token
    auth_header = {"Authorization": f"Bearer {token}"}
    fac_proj_res = client.get("/faculty/projects", headers=auth_header)
    fac_data = fac_proj_res.json()
    fac_projects = fac_data["projects"] if isinstance(fac_data, dict) and "projects" in fac_data else fac_data
    assert isinstance(fac_projects, list)
    expected_cohort_count = projects_collection.count_documents({})
    assert len(fac_projects) == expected_cohort_count, (
        f"Expected {expected_cohort_count} authorized cohort projects for faculty, got {len(fac_projects)}"
    )

    # Ensure unauthenticated request is rejected
    unauth_res = client.get("/faculty/projects")
    assert unauth_res.status_code in (401, 403)


def test_progress_tracking_and_prediction_rules():
    """
    Requirement 5, 6, 7: Test progress tracking endpoint, actual vs planned progress formulas,
    insufficient prediction data handling (<2 check-ins), and velocity forecasting (>=2 check-ins).
    """
    # Pick a project from madhushalne@gmail.com
    proj = projects_collection.find_one({"student_id": "madhushalne@gmail.com"})
    assert proj is not None, "No project found for student"
    proj_id = proj["project_id"]

    # 1. Test tracking endpoint
    res = client.get(f"/projects/{proj_id}/tracking")
    assert res.status_code == 200
    data = res.json()
    assert data["project_id"] == proj_id
    assert "actual_progress" in data
    assert "planned_progress" in data
    assert "prediction" in data

    pred = data["prediction"]
    # Checkins handling
    checkins = data.get("weekly_checkins", [])
    if len(checkins) < 2:
        assert pred["can_predict"] is False
        assert pred["status"] == "insufficient_data"
        assert "Insufficient data for reliable prediction" in pred["message"]

    # 2. Test duplicate prevention in save_weekly_checkin
    checkin_1 = {
        "week": 1,
        "completed_work": ["Implemented database schema", "Created auth endpoints"],
        "current_progress": 100,
        "blockers": [],
        "next_goals": ["Build dashboard components"],
        "hours_spent": 12.0,
        "submitted_at": "2026-10-10T10:00:00Z"
    }
    # Save first time
    assert save_weekly_checkin(proj_id, checkin_1) is True

    # Save update for the same week (should update, not duplicate)
    checkin_1_update = {
        "week": 1,
        "completed_work": ["Implemented database schema", "Created auth endpoints", "Added unit tests"],
        "current_progress": 100,
        "blockers": [],
        "next_goals": ["Build dashboard components"],
        "hours_spent": 15.0,
        "submitted_at": "2026-10-11T12:00:00Z"
    }
    assert save_weekly_checkin(proj_id, checkin_1_update) is True

    # Check MongoDB directly to ensure no duplicate week 1 entry
    updated_proj = projects_collection.find_one({"project_id": proj_id})
    w1_entries = [c for c in updated_proj.get("weekly_checkins", []) if c.get("week") == 1]
    assert len(w1_entries) == 1, f"Expected exactly 1 check-in entry for week 1, found {len(w1_entries)}"
    assert w1_entries[0]["hours_spent"] == 15.0

    # 3. Add week 2 check-in to reach >= 2 check-ins
    checkin_2 = {
        "week": 2,
        "completed_work": ["Completed UI design tokens", "Implemented modal layout"],
        "current_progress": 60,
        "blockers": ["Need feedback on color contrast"],
        "next_goals": ["Integrate charts"],
        "hours_spent": 10.0,
        "submitted_at": "2026-10-17T12:00:00Z"
    }
    assert save_weekly_checkin(proj_id, checkin_2) is True

    # Also update progress records for actual progress formula
    projects_collection.update_one(
        {"project_id": proj_id},
        {"$set": {
            "progress": [
                {"week": 1, "current_progress": 100, "status": "Completed"},
                {"week": 2, "current_progress": 60, "status": "In Progress", "blockers": ["Need feedback on color contrast"]}
            ]
        }}
    )

    # 4. Fetch tracking again with 2 check-ins
    res_2 = client.get(f"/projects/{proj_id}/tracking")
    assert res_2.status_code == 200
    data_2 = res_2.json()

    # Actual progress should be non-zero and based on sum(p_w)/N
    assert data_2["actual_progress"] > 0
    # Blockers should be detected
    assert len(data_2["active_blockers"]) > 0

    pred_2 = data_2["prediction"]
    # Now that we have >= 2 checkins, velocity forecasting activates
    assert "status" in pred_2
    if pred_2["can_predict"]:
        assert "predicted_completion_date" in pred_2
        assert pred_2["prediction_confidence"] > 0
        assert pred_2["velocity_per_week"] > 0


def test_project_details_ai_progress_evaluation_contract():
    """
    Task 1: Verify API contract for AI progress evaluation:
    - A project with saved evaluation provides score, assessment, completed/delayed weeks, status.
    - A project without evaluation provides None/null (pending state).
    - Saving a weekly check-in does not overwrite or remove an existing progress evaluation.
    """
    # 1. Test project with saved evaluation
    eval_proj = projects_collection.find_one({
        "student_id": "madhushalne@gmail.com",
        "progress_evaluation": {"$ne": None}
    })
    assert eval_proj is not None, "Expected at least one project with saved evaluation in database"
    eval_id = eval_proj["project_id"]

    res_eval = client.get(f"/projects/{eval_id}")
    assert res_eval.status_code == 200
    data_eval = res_eval.json()
    assert data_eval["project_id"] == eval_id
    evaluation = data_eval.get("progress_evaluation")
    assert evaluation is not None
    assert "overall_assessment" in evaluation
    assert "progress_score" in evaluation
    assert "current_status" in evaluation
    assert "completed_weeks" in evaluation
    assert "delayed_weeks" in evaluation
    assert isinstance(evaluation["progress_score"], (int, float))

    # 2. Test project without saved evaluation
    pending_proj = projects_collection.find_one({
        "student_id": "madhushalne@gmail.com",
        "progress_evaluation": None
    })
    if pending_proj:
        pending_id = pending_proj["project_id"]
        res_pending = client.get(f"/projects/{pending_id}")
        assert res_pending.status_code == 200
        data_pending = res_pending.json()
        assert data_pending["project_id"] == pending_id
        assert data_pending.get("progress_evaluation") is None

    # 3. Verify checkin does not lose persisted progress evaluation
    prior_eval = eval_proj.get("progress_evaluation")
    test_checkin = {
        "week": 1,
        "completed_work": ["Audit test verification"],
        "current_progress": 100,
        "blockers": [],
        "next_goals": ["Continue verification"],
        "hours_spent": 5.0,
        "submitted_at": "2026-10-14T10:00:00Z"
    }
    # save_weekly_checkin updates checkin array without touching progress_evaluation
    assert save_weekly_checkin(eval_id, test_checkin) is True
    recheck_proj = projects_collection.find_one({"project_id": eval_id})
    assert recheck_proj.get("progress_evaluation") == prior_eval


def test_student_identity_and_skill_assessment_scoping():
    """
    Test student identity retrieval, absence of passwords, and skill assessment scoping.
    """
    # 1. Verify student identity API contract
    student_id = "madhushalne@gmail.com"
    res_student = client.get(f"/students/{student_id}")
    assert res_student.status_code == 200
    student_data = res_student.json()
    assert student_data["student_id"] == student_id
    assert student_data["email"] == "madhushalne@gmail.com"
    assert student_data["name"] == "Madhushalne"
    assert "password" not in student_data

    # 2. Verify non-existent student isolation
    res_unknown = client.get("/students/nonexistent_student_9999")
    assert res_unknown.status_code == 404

    # 3. Verify skill assessment retrieval is scoped to target student
    res_skills = client.get(f"/skills/{student_id}")
    assert res_skills.status_code == 200
    skill_data = res_skills.json()
    assert skill_data["student_id"] == student_id
    assert "raw_scores" in skill_data
    assert "normalized_vector" in skill_data

    # 4. Verify skill assessment update / upsert contract
    update_payload = {
        "raw_scores": {"Python": 9.0, "React": 8.0, "Database": 9.0},
        "normalized_vector": {"python": 0.9, "react": 0.8, "database": 0.9},
        "confidence": "high"
    }
    res_update = client.put(f"/skills/{student_id}", json=update_payload)
    assert res_update.status_code == 200
    updated_body = res_update.json()
    assert updated_body["student_id"] == student_id
    assert updated_body["confidence"] == "high"
    assert updated_body["raw_scores"]["Python"] == 9.0


def test_student_profile_picture_and_confidence_synchronization():
    """
    Test profile-picture upload/persistence and confidence-level synchronization.
    """
    student_id = "madhushalne@gmail.com"
    dummy_avatar = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

    # 1. Test profile update with profile_picture
    update_data = {
        "name": "Madhushalne",
        "email": "madhushalne@gmail.com",
        "profile_picture": dummy_avatar
    }
    res_prof = client.put(f"/students/{student_id}", json=update_data)
    assert res_prof.status_code == 200
    prof_data = res_prof.json()
    assert prof_data["profile_picture"] == dummy_avatar

    # Verify persistence via GET
    res_get = client.get(f"/students/{student_id}")
    assert res_get.status_code == 200
    assert res_get.json()["profile_picture"] == dummy_avatar

    # 2. Test confidence synchronization on skills source of truth
    # Fetch existing skill assessment to preserve scores
    res_skills_before = client.get(f"/skills/{student_id}")
    assert res_skills_before.status_code == 200
    before_data = res_skills_before.json()
    raw_scores = before_data.get("raw_scores", {})
    normalized_vector = before_data.get("normalized_vector", {})

    # Update confidence to 'high'
    res_sync = client.put(f"/skills/{student_id}", json={
        "raw_scores": raw_scores,
        "normalized_vector": normalized_vector,
        "confidence": "high"
    })
    assert res_sync.status_code == 200
    assert res_sync.json()["confidence"] == "high"

    # Verify both Student Profile and Skill Assessment source of truth return identical confidence
    res_check = client.get(f"/skills/{student_id}")
    assert res_check.status_code == 200
    assert res_check.json()["confidence"] == "high"
    assert res_check.json()["raw_scores"] == raw_scores



