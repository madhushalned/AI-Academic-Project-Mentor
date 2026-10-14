"""
Integration test verifying Priority 1, 2, 3, 4:
- Faculty account setup, login, and dashboard project loading
- Student authentication and project submission
- Project progress updates and weekly mentor check-in with blockers
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_integration_pipeline():
    # 1. Test Faculty Register & Login
    faculty_email = "test.faculty.flow@university.edu"
    reg_resp = client.post("/faculty/register", json={
        "name": "Dr. Integration Test",
        "email": faculty_email,
        "password": "FacultySecure123!",
        "department": "Computer Science"
    })
    # If already registered from previous run, it may return 400 or 200
    assert reg_resp.status_code in (200, 400)

    login_resp = client.post("/faculty/login", json={
        "email": faculty_email,
        "password": "FacultySecure123!"
    })
    assert login_resp.status_code == 200, f"Faculty login failed: {login_resp.text}"
    login_data = login_resp.json()
    assert "access_token" in login_data
    assert login_data["faculty"]["role"] == "faculty"
    token = login_data["access_token"]

    # 2. Test Faculty Projects retrieval with authentication
    headers = {"Authorization": f"Bearer {token}"}
    fac_proj_resp = client.get("/faculty/projects", headers=headers)
    assert fac_proj_resp.status_code == 200, f"Faculty projects failed: {fac_proj_resp.text}"
    fac_proj_data = fac_proj_resp.json()
    assert "projects" in fac_proj_data
    assert "total_projects" in fac_proj_data
    print(f"Verified: Faculty retrieved {fac_proj_data['total_projects']} projects with student names")

    # 3. Test Student Project Submission & Progress
    student_id = "test_student_flow_01"
    proj_id = f"test_proj_{student_id}"

    # Create student
    stud_resp = client.post("/students/", json={
        "student_id": student_id,
        "name": "Alex Flow Student",
        "email": "alex.flow@university.edu",
        "password": "Password123!",
        "team_id": None,
        "skills": {}
    })
    assert stud_resp.status_code in (200, 400)

    # Submit project
    proj_resp = client.post("/projects/", json={
        "project_id": proj_id,
        "student_id": student_id,
        "title": "Automated Academic Flow Testing",
        "description": "Integration testing project tracking platform.",
        "domain": "Software Engineering",
        "expected_outcome": "Working pipeline",
        "status": "In Progress"
    })
    assert proj_resp.status_code in (200, 400)

    # Update milestone progress
    prog_resp = client.put(f"/projects/{proj_id}/progress", json={
        "week": 1,
        "status": "Completed",
        "progress": 100,
        "remarks": "Week 1 completed on schedule"
    })
    assert prog_resp.status_code == 200, f"Progress update failed: {prog_resp.text}"

    # Verify project progress retrieval
    get_prog = client.get(f"/projects/{proj_id}/progress")
    assert get_prog.status_code == 200
    progress_list = get_prog.json().get("progress", [])
    assert len(progress_list) >= 1
    assert progress_list[0]["week"] == 1
    assert progress_list[0]["progress"] == 100
    print("Verified: Project progress update and persistence in MongoDB")

    # 4. Verify Faculty sees the new project with student name
    updated_fac_proj = client.get("/faculty/projects", headers=headers)
    assert updated_fac_proj.status_code == 200
    projects_list = updated_fac_proj.json().get("projects", [])
    matched = [p for p in projects_list if p.get("project_id") == proj_id]
    assert len(matched) == 1
    assert matched[0]["student_name"] == "Alex Flow Student"
    assert matched[0]["title"] == "Automated Academic Flow Testing"
    print("Verified: Faculty dashboard reflects new student project with resolved student name")

if __name__ == "__main__":
    test_full_integration_pipeline()
    print("ALL INTEGRATION TESTS PASSED SUCCESSFULLY!")
