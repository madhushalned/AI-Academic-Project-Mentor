import { useEffect, useMemo, useState } from "react";
import Icon from "../components/Icon.jsx";

const STUDENT_ID = "student001";

const API_BASE_URL = "http://127.0.0.1:8000";

const SKILL_CATEGORIES = [
  {
    name: "Programming",
    skills: ["Python", "Java", "JavaScript"],
  },
  {
    name: "Frontend",
    skills: ["React", "HTML/CSS"],
  },
  {
    name: "Backend",
    skills: ["Node.js", "REST API"],
  },
  {
    name: "Database",
    skills: ["MongoDB", "MySQL"],
  },
];

function normalizeSkillName(skillName) {
  return skillName
    .toLowerCase()
    .replace(/[\s_-]+/g, "")
    .replace(/\//g, "");
}

function getBackendScore(scores, skillName) {
  const target = normalizeSkillName(skillName);

  const matchingKey = Object.keys(scores || {}).find(
    (key) => normalizeSkillName(key) === target
  );

  return matchingKey ? Number(scores[matchingKey]) || 0 : 0;
}

function getSkillLevel(percentage) {
  if (percentage <= 30) {
    return "Beginner";
  }

  if (percentage <= 70) {
    return "Intermediate";
  }

  return "Advanced";
}

async function getStudent(studentId) {
  const response = await fetch(
    `${API_BASE_URL}/students/${studentId}`
  );

  if (!response.ok) {
    let errorMessage = "Failed to load student profile.";

    try {
      const errorData = await response.json();

      if (errorData.detail) {
        errorMessage = errorData.detail;
      }
    } catch {
      // Keep default error message.
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

async function updateStudent(studentId, data) {
  const response = await fetch(
    `${API_BASE_URL}/students/${studentId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    let errorMessage = "Failed to update student profile.";

    try {
      const errorData = await response.json();

      if (errorData.detail) {
        errorMessage = errorData.detail;
      }
    } catch {
      // Keep default error message.
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

async function getSkillAssessment(studentId) {
  const response = await fetch(
    `${API_BASE_URL}/skills/${studentId}`
  );

  if (!response.ok) {
    let errorMessage = "Failed to load skill assessment.";

    try {
      const errorData = await response.json();

      if (errorData.detail) {
        errorMessage = errorData.detail;
      }
    } catch {
      // Keep default error message.
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

export default function StudentProfile() {
  const [student, setStudent] = useState(null);
  const [skillAssessment, setSkillAssessment] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [expandedCategories, setExpandedCategories] =
    useState({
      Programming: true,
      Frontend: true,
      Backend: true,
      Database: true,
    });

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const [studentData, assessmentData] =
          await Promise.all([
            getStudent(STUDENT_ID),
            getSkillAssessment(STUDENT_ID),
          ]);

        if (cancelled) {
          return;
        }

        setStudent(studentData);
        setSkillAssessment(assessmentData);

        setFormData({
          name: studentData.name || "",
          email: studentData.email || "",
        });
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Unable to load student profile."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const categorizedSkills = useMemo(() => {
    if (!skillAssessment) {
      return [];
    }

    return SKILL_CATEGORIES.map((category) => {
      const skills = category.skills
        .map((skillName) => {
          const rawScore = getBackendScore(
            skillAssessment.raw_scores,
            skillName
          );

          const percentage = Math.round(rawScore * 10);

          return {
            name: skillName,
            percentage,
            level: getSkillLevel(percentage),
          };
        })
        .filter((skill) => skill.percentage > 0);

      return {
        name: category.name,
        skills,
      };
    }).filter((category) => category.skills.length > 0);
  }, [skillAssessment]);

  const totalAssessedSkills = useMemo(() => {
    return categorizedSkills.reduce(
      (total, category) => total + category.skills.length,
      0
    );
  }, [categorizedSkills]);

  const toggleCategory = (categoryName) => {
    setExpandedCategories((previous) => ({
      ...previous,
      [categoryName]: !previous[categoryName],
    }));
  };

  const handleEdit = () => {
    if (!student) {
      return;
    }

    setFormData({
      name: student.name || "",
      email: student.email || "",
    });

    setError("");
    setSaved(false);
    setEditing(true);
  };

  const handleCancel = () => {
    if (student) {
      setFormData({
        name: student.name || "",
        email: student.email || "",
      });
    }

    setError("");
    setSaved(false);
    setEditing(false);
  };

  const handleChange = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setSaved(false);
    setError("");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaved(false);
      setError("");

      if (!formData.name.trim()) {
        throw new Error("Name is required.");
      }

      if (!formData.email.trim()) {
        throw new Error("Email is required.");
      }

      const updatedStudent = await updateStudent(
        STUDENT_ID,
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
        }
      );

      setStudent(updatedStudent);

      setFormData({
        name: updatedStudent.name || "",
        email: updatedStudent.email || "",
      });

      setEditing(false);
      setSaved(true);
    } catch (err) {
      setError(
        err.message || "Unable to save student profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="student-profile">
        <div className="profile-loading">
          <div className="profile-loading-spinner" />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="student-profile">
        <div className="error-banner">
          <Icon name="alert" size={18} />
          <span>
            {error || "Student profile could not be loaded."}
          </span>
        </div>
      </div>
    );
  }

  const avatarLetter =
    student.name?.charAt(0)?.toUpperCase() || "S";

  return (
    <div className="student-profile">
      {/* Profile Hero */}
      <section className="profile-hero">
        <div className="profile-hero-background">
          <div className="profile-hero-circle profile-hero-circle-one" />
          <div className="profile-hero-circle profile-hero-circle-two" />
        </div>

        <div className="profile-hero-content">
          <div className="profile-avatar-large">
            {avatarLetter}
          </div>

          <div className="profile-identity">
            <div className="profile-name-row">
              <h2>{student.name}</h2>
              <span className="profile-student-badge">
                Student
              </span>
            </div>

            <p className="profile-student-id">
              {student.student_id}
            </p>

            <p className="profile-email">
              <Icon name="mail" size={15} />
              {student.email}
            </p>
          </div>

          {!editing && (
            <button
              className="profile-edit-button"
              onClick={handleEdit}
            >
              <Icon name="edit" size={16} />
              Edit Profile
            </button>
          )}
        </div>
      </section>

      {/* Messages */}
      {saved && (
        <div className="profile-success-message">
          <Icon name="check" size={18} />
          <span>Profile updated successfully.</span>
        </div>
      )}

      {error && (
        <div className="profile-error-message">
          <Icon name="alert" size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="profile-content-grid">
        {/* Personal Information */}
        <section className="profile-card personal-card">
          <div className="profile-card-heading">
            <div className="profile-card-icon">
              <Icon name="user" size={18} />
            </div>

            <div>
              <h3>Personal Information</h3>
              <p>Your basic student information</p>
            </div>
          </div>

          <div className="profile-info-list">
            <div className="profile-info-item">
              <div className="profile-info-label">
                Student ID
              </div>

              <div className="profile-info-value">
                {student.student_id}
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-label">
                Full Name
              </div>

              {editing ? (
                <input
                  className="profile-input"
                  type="text"
                  value={formData.name}
                  onChange={(event) =>
                    handleChange(
                      "name",
                      event.target.value
                    )
                  }
                />
              ) : (
                <div className="profile-info-value">
                  {student.name}
                </div>
              )}
            </div>

            <div className="profile-info-item">
              <div className="profile-info-label">
                Email Address
              </div>

              {editing ? (
                <input
                  className="profile-input"
                  type="email"
                  value={formData.email}
                  onChange={(event) =>
                    handleChange(
                      "email",
                      event.target.value
                    )
                  }
                />
              ) : (
                <div className="profile-info-value profile-email-value">
                  <Icon name="mail" size={15} />
                  {student.email}
                </div>
              )}
            </div>

            <div className="profile-info-item">
              <div className="profile-info-label">
                Account Type
              </div>

              <div className="profile-info-value">
                <span className="account-type-badge">
                  Student
                </span>
              </div>
            </div>
          </div>

          {editing && (
            <div className="profile-form-actions">
              <button
                className="profile-cancel-button"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="profile-save-button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <Icon name="check" size={15} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </section>

        {/* Skills */}
        <section className="profile-card skills-card">
          <div className="profile-card-heading skills-heading">
            <div>
              <h3>Skills</h3>
              <p>
                Your assessed technical proficiencies
              </p>
            </div>

            <div className="skill-count-badge">
              {totalAssessedSkills}{" "}
              {totalAssessedSkills === 1
                ? "Skill"
                : "Skills"}
            </div>
          </div>

          <div className="skills-scroll-area">
            {categorizedSkills.length === 0 ? (
              <div className="skills-empty-state">
                <div className="skills-empty-icon">
                  <Icon name="skill" size={22} />
                </div>

                <h4>No assessed skills yet</h4>

                <p>
                  Complete your Skill Assessment to
                  display your technical skills here.
                </p>
              </div>
            ) : (
              categorizedSkills.map((category) => {
                const isExpanded =
                  expandedCategories[category.name];

                return (
                  <div
                    className="skill-category"
                    key={category.name}
                  >
                    <button
                      className="skill-category-header"
                      onClick={() =>
                        toggleCategory(category.name)
                      }
                    >
                      <div className="skill-category-title">
                        <span className="skill-category-dot" />
                        <span>{category.name}</span>
                        <span className="skill-category-count">
                          {category.skills.length}
                        </span>
                      </div>

                      <Icon
                        name={
                          isExpanded
                            ? "chevron-up"
                            : "chevron-down"
                        }
                        size={17}
                      />
                    </button>

                    {isExpanded && (
                      <div className="skill-category-list">
                        {category.skills.map((skill) => (
                          <div
                            className="profile-skill-row"
                            key={skill.name}
                          >
                            <div className="profile-skill-top">
                              <span className="profile-skill-name">
                                {skill.name}
                              </span>

                              <div className="profile-skill-meta">
                                <span
                                  className={`skill-level-badge ${skill.level.toLowerCase()}`}
                                >
                                  {skill.level}
                                </span>

                                <span className="profile-skill-score">
                                  {skill.percentage}%
                                </span>
                              </div>
                            </div>

                            <div className="profile-skill-progress">
                              <div
                                className="profile-skill-progress-fill"
                                style={{
                                  width: `${skill.percentage}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Growth Card */}
      <section className="profile-growth-card">
        <div className="profile-growth-icon">
          <Icon name="skill" size={22} />
        </div>

        <div className="profile-growth-content">
          <h3>Keep Growing!</h3>
          <p>
            Keep your skills updated through Skill
            Assessment to track your progress and get
            better project recommendations.
          </p>
        </div>

        <div className="profile-growth-stat">
          <strong>{totalAssessedSkills}</strong>
          <span>
            {totalAssessedSkills === 1
              ? "assessed skill"
              : "assessed skills"}
          </span>
        </div>
      </section>
    </div>
  );
}