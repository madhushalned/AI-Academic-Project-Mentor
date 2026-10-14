import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import {
  getStudent,
  updateStudent,
  getSkillAssessment,
  updateSkillAssessment,
} from "../services/api.js";

export default function StudentProfile() {
  const [student, setStudent] = useState(null);
  const [skillAssessment, setSkillAssessment] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    confidence: "medium",
    profile_picture: "",
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const storedStudent = localStorage.getItem("student");
        if (!storedStudent) {
          throw new Error("Please log in again to view your profile.");
        }

        const loggedInStudent = JSON.parse(storedStudent);
        const studentId = loggedInStudent?.student_id;
        if (!studentId) {
          throw new Error("Student ID is missing. Please log in again.");
        }

        const studentData = await getStudent(studentId);
        if (cancelled) return;

        setStudent(studentData);

        let currentConfidence = "medium";
        try {
          const assessmentData = await getSkillAssessment(studentId);
          if (!cancelled && assessmentData) {
            setSkillAssessment(assessmentData);
            if (assessmentData.confidence) {
              currentConfidence = assessmentData.confidence;
            }
          }
        } catch {
          if (!cancelled) {
            setSkillAssessment(null);
          }
        }

        setFormData({
          name: studentData.name || "",
          email: studentData.email || "",
          confidence: currentConfidence,
          profile_picture: studentData.profile_picture || "",
        });
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load student profile.");
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

  const handleEdit = () => {
    if (!student) return;

    setFormData({
      name: student.name || "",
      email: student.email || "",
      confidence: skillAssessment?.confidence || "medium",
      profile_picture: student.profile_picture || "",
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
        confidence: skillAssessment?.confidence || "medium",
        profile_picture: student.profile_picture || "",
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

  const handlePictureChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, WebP, etc.).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size exceeds 2MB limit. Please select a smaller photo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setFormData((previous) => ({
        ...previous,
        profile_picture: dataUrl,
      }));
      setSaved(false);
      setError("");
    };
    reader.onerror = () => {
      setError("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePicture = (e) => {
    e.stopPropagation();
    setFormData((previous) => ({
      ...previous,
      profile_picture: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

      const loggedInStudent = JSON.parse(
        localStorage.getItem("student") || "null"
      );
      const studentId = loggedInStudent?.student_id;

      if (!studentId) {
        throw new Error("Please log in again to update your profile.");
      }

      // 1. Update Student Profile in database
      const updatedStudent = await updateStudent(studentId, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        profile_picture: formData.profile_picture,
      });

      setStudent(updatedStudent);

      // 2. Synchronize confidence level with Skill Assessment source of truth
      try {
        const currentRaw = skillAssessment?.raw_scores || {};
        const currentNorm = skillAssessment?.normalized_vector || {};
        const updatedAssessment = await updateSkillAssessment(studentId, {
          raw_scores: currentRaw,
          normalized_vector: currentNorm,
          confidence: formData.confidence,
        });
        setSkillAssessment(updatedAssessment);
      } catch (skillErr) {
        console.warn("Could not synchronize confidence level to skill assessment:", skillErr);
      }

      // 3. Update localStorage session cache so other pages & header see changes immediately
      const stored = JSON.parse(localStorage.getItem("student") || "{}");
      localStorage.setItem(
        "student",
        JSON.stringify({
          ...stored,
          name: updatedStudent.name,
          email: updatedStudent.email,
          profile_picture: updatedStudent.profile_picture,
        })
      );

      setFormData({
        name: updatedStudent.name || "",
        email: updatedStudent.email || "",
        confidence: formData.confidence,
        profile_picture: updatedStudent.profile_picture || "",
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

  const activePicture = editing
    ? formData.profile_picture
    : student.profile_picture;

  const activeConfidence = editing
    ? formData.confidence
    : (skillAssessment?.confidence || formData.confidence || "medium");

  return (
    <div className="student-profile">
      {/* Profile Hero */}
      <section className="profile-hero">
        <div className="profile-hero-background">
          <div className="profile-hero-circle profile-hero-circle-one" />
          <div className="profile-hero-circle profile-hero-circle-two" />
        </div>

        <div className="profile-hero-content">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-large">
              {activePicture ? (
                <img
                  src={activePicture}
                  alt={student.name || "Student Avatar"}
                  className="profile-avatar-img"
                />
              ) : (
                avatarLetter
              )}
            </div>

            {editing && (
              <div className="profile-avatar-controls">
                <button
                  type="button"
                  className="profile-avatar-btn change-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload profile picture"
                >
                  <Icon name="camera" size={14} />
                  <span>{activePicture ? "Change" : "Upload"}</span>
                </button>

                {activePicture && (
                  <button
                    type="button"
                    className="profile-avatar-btn remove-btn"
                    onClick={handleRemovePicture}
                    title="Remove profile picture"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePictureChange}
                  style={{ display: "none" }}
                />
              </div>
            )}
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
              <p>Your basic student information and confidence</p>
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

            {/* Single Confidence Level field connected to Skill Assessment */}
            <div className="profile-info-item">
              <div className="profile-info-label">
                Confidence Level
              </div>

              {editing ? (
                <select
                  className="profile-input profile-select"
                  value={formData.confidence}
                  onChange={(event) =>
                    handleChange("confidence", event.target.value)
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              ) : (
                <div className="profile-info-value">
                  <span className={`confidence-badge confidence-${activeConfidence.toLowerCase()}`}>
                    {activeConfidence.charAt(0).toUpperCase() + activeConfidence.slice(1)} Confidence
                  </span>
                </div>
              )}
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

        {/* Technical Skills Overview & Direct Navigation Card */}
        <section className="profile-card mentorship-card">
          <div className="profile-card-heading">
            <div className="profile-card-icon">
              <Icon name="skill" size={18} />
            </div>

            <div>
              <h3>Skill Assessment & Growth</h3>
              <p>Technical competencies evaluation</p>
            </div>
          </div>

          <div className="profile-info-list" style={{ padding: "20px" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.6", margin: "0 0 16px 0" }}>
              Technical skills (Programming, Frontend, Backend, Database) are managed independently on the dedicated <strong>Skill Assessment</strong> workspace to keep evaluation scores accurate and prevent accidental edits.
            </p>

            <div style={{
              background: "var(--surface-muted, #f8fafc)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "16px",
              marginBottom: "18px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Current Assessment Status
                </span>
                <span className={`confidence-badge confidence-${activeConfidence.toLowerCase()}`}>
                  {activeConfidence.charAt(0).toUpperCase() + activeConfidence.slice(1)}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-main)" }}>
                {skillAssessment
                  ? "Your technical skills assessment is active and synchronized."
                  : "No technical skills evaluated yet."}
              </p>
            </div>

            <Link
              to="/skill-assessment"
              className="btn btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "14px"
              }}
            >
              <Icon name="skill" size={16} />
              Go to Skill Assessment Workspace →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
