import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

const Profile = () => {
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [skills, setSkills] = useState(null);

  const [loading, setLoading] = useState(true);
  const [skillLoading, setSkillLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    team_id: "",
  });

  const [skillForm, setSkillForm] = useState({
    raw_scores: {},
    normalized_vector: {},
    confidence: "medium",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const storedStudent = localStorage.getItem("student");

    if (!storedStudent) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    try {
      const loggedInStudent = JSON.parse(storedStudent);
      const studentId = loggedInStudent.student_id;

      const response = await fetch(
        `${API_BASE_URL}/students/${studentId}`
      );

      if (!response.ok) {
        throw new Error("Failed to load student profile");
      }

      const studentData = await response.json();

      setStudent(studentData);

      setProfileForm({
        name: studentData.name || "",
        email: studentData.email || "",
        team_id: studentData.team_id || "",
      });

      setLoading(false);

      loadSkillAssessment(studentId);
    } catch (error) {
      console.error("Profile loading error:", error);
      alert("Unable to load profile.");
      setLoading(false);
    }
  };

  const loadSkillAssessment = async (studentId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/skills/${studentId}`
      );

      if (response.status === 404) {
        setSkills(null);
        setSkillLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load skill assessment");
      }

      const skillData = await response.json();

      setSkills(skillData);

      setSkillForm({
        raw_scores: skillData.raw_scores || {},
        normalized_vector:
          skillData.normalized_vector || {},
        confidence: skillData.confidence || "medium",
      });

      setSkillLoading(false);
    } catch (error) {
      console.error("Skill assessment loading error:", error);
      setSkillLoading(false);
    }
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSkillChange = (event, type, skillName) => {
    const value = event.target.value;

    setSkillForm((previous) => ({
      ...previous,
      [type]: {
        ...previous[type],
        [skillName]: Number(value),
      },
    }));
  };

  const saveProfile = async () => {
    if (!student) return;

    try {
      setSaving(true);

      const response = await fetch(
        `${API_BASE_URL}/students/${student.student_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profileForm),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Failed to update profile"
        );
      }

      setStudent(result);

      localStorage.setItem(
        "student",
        JSON.stringify({
          ...JSON.parse(localStorage.getItem("student")),
          ...result,
        })
      );

      setIsEditing(false);

      alert("Profile updated successfully.");
    } catch (error) {
      console.error("Profile update error:", error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const saveSkillAssessment = async () => {
    if (!student) return;

    try {
      setSkillLoading(true);

      const method = skills ? "PUT" : "POST";

      const url = skills
        ? `${API_BASE_URL}/skills/${student.student_id}`
        : `${API_BASE_URL}/skills/`;

      const body = {
        student_id: student.student_id,
        raw_scores: skillForm.raw_scores,
        normalized_vector:
          skillForm.normalized_vector,
        confidence: skillForm.confidence,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail ||
            "Failed to save skill assessment"
        );
      }

      setSkills(result);

      alert("Skill assessment saved successfully.");
    } catch (error) {
      console.error(
        "Skill assessment update error:",
        error
      );
      alert(error.message);
    } finally {
      setSkillLoading(false);
    }
  };

  const skillNames = [
    "Python",
    "Java",
    "JavaScript",
    "Machine Learning",
    "Database",
  ];

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div style={styles.loadingPage}>
        <p>Student profile not found.</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>
            Student Profile
          </h1>

          <p style={styles.headerSubtitle}>
            Manage your profile and skill assessment
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          style={styles.backButton}
        >
          ← Dashboard
        </button>
      </header>

      <main style={styles.content}>
        {/* Student Profile */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                Student Information
              </h2>

              <p style={styles.cardSubtitle}>
                Your registered academic information
              </p>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                style={styles.primaryButton}
              >
                Edit Profile
              </button>
            )}
          </div>

          <div style={styles.profileGrid}>
            <div style={styles.field}>
              <label style={styles.label}>
                Student ID
              </label>

              <div style={styles.readOnlyField}>
                {student.student_id}
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Name
              </label>

              {isEditing ? (
                <input
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  style={styles.input}
                />
              ) : (
                <div style={styles.readOnlyField}>
                  {student.name || "Not provided"}
                </div>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Email
              </label>

              {isEditing ? (
                <input
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  style={styles.input}
                />
              ) : (
                <div style={styles.readOnlyField}>
                  {student.email || "Not provided"}
                </div>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Team ID
              </label>

              {isEditing ? (
                <input
                  name="team_id"
                  value={profileForm.team_id}
                  onChange={handleProfileChange}
                  placeholder="Enter team ID"
                  style={styles.input}
                />
              ) : (
                <div style={styles.readOnlyField}>
                  {student.team_id || "Not assigned"}
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div style={styles.actionRow}>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveProfile}
                disabled={saving}
                style={styles.primaryButton}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </section>

        {/* Skill Assessment */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                Skill Assessment
              </h2>

              <p style={styles.cardSubtitle}>
                Record your technical skill levels
              </p>
            </div>
          </div>

          <div style={styles.skillTable}>
            <div style={styles.tableHeader}>
              <span>Skill</span>
              <span>Raw Score</span>
              <span>Normalized Score</span>
            </div>

            {skillNames.map((skillName) => (
              <div
                key={skillName}
                style={styles.tableRow}
              >
                <span style={styles.skillName}>
                  {skillName}
                </span>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={
                    skillForm.raw_scores[skillName] ?? ""
                  }
                  onChange={(event) =>
                    handleSkillChange(
                      event,
                      "raw_scores",
                      skillName
                    )
                  }
                  style={styles.scoreInput}
                />

                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={
                    skillForm.normalized_vector[
                      skillName
                    ] ?? ""
                  }
                  onChange={(event) =>
                    handleSkillChange(
                      event,
                      "normalized_vector",
                      skillName
                    )
                  }
                  style={styles.scoreInput}
                />
              </div>
            ))}
          </div>

          <div style={styles.confidenceSection}>
            <label style={styles.label}>
              Confidence
            </label>

            <select
              value={skillForm.confidence}
              onChange={(event) =>
                setSkillForm((previous) => ({
                  ...previous,
                  confidence: event.target.value,
                }))
              }
              style={styles.select}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div style={styles.actionRow}>
            <button
              type="button"
              onClick={saveSkillAssessment}
              disabled={skillLoading}
              style={styles.primaryButton}
            >
              {skillLoading
                ? "Saving..."
                : "Save Skill Assessment"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

const styles = {
  page: {
    width: "100%",
    height: "100vh",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    boxSizing: "border-box",
    overflowX: "hidden"
  },

  loadingPage: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    color: "#475569",
    fontSize: "16px",
  },

  header: {
    minHeight: "80px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    padding: "0 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    margin: 0,
    fontSize: "26px",
    color: "#0f172a",
  },

  headerSubtitle: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  backButton: {
    border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff",
    color: "#334155",
    borderRadius: "8px",
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: "500",
  },

  content: {
    width: "100%",
    maxWidth: "1100px",
    boxSizing: "border-box",
    margin: "0 auto",
    padding: "32px 40px 60px",
  },

  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "28px",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "24px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#0f172a",
  },

  cardSubtitle: {
    margin: "6px 0 0",
    fontSize: "14px",
    color: "#64748b",
  },

  profileGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "11px 12px",
    fontSize: "14px",
    color: "#0f172a",
    outline: "none",
  },

  readOnlyField: {
    minHeight: "18px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "11px 12px",
    color: "#334155",
    fontSize: "14px",
  },

  primaryButton: {
    border: "none",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    borderRadius: "8px",
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: "600",
  },

  cancelButton: {
    border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff",
    color: "#334155",
    borderRadius: "8px",
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: "500",
  },

  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "24px",
  },

  skillTable: {
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    overflow: "hidden",
  },

  tableHeader: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gap: "16px",
    padding: "14px 16px",
    backgroundColor: "#f8fafc",
    color: "#475569",
    fontSize: "13px",
    fontWeight: "600",
  },

  tableRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gap: "16px",
    alignItems: "center",
    padding: "14px 16px",
    borderTop: "1px solid #e2e8f0",
  },

  skillName: {
    color: "#334155",
    fontSize: "14px",
    fontWeight: "500",
  },

  scoreInput: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    padding: "9px 10px",
    fontSize: "14px",
  },

  confidenceSection: {
    marginTop: "24px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  select: {
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "9px 12px",
    backgroundColor: "#ffffff",
    color: "#334155",
  },
};

export default Profile;