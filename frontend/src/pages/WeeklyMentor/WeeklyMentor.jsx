import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../../common/Sidebar";
import Header from "../../common/Header";
import "./WeeklyMentor.css";

const API_BASE_URL = "http://127.0.0.1:8000";
const ACTIVE_PROJECT_STORAGE_KEY = "activeProjectId";

const WeeklyMentor = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryProjectId = searchParams.get("project_id");

  const [student, setStudent] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [trackingData, setTrackingData] = useState(null);

  const [currentWeek, setCurrentWeek] = useState(1);
  const [formData, setFormData] = useState({
    completedWork: "",
    currentProgress: 100,
    hoursSpent: "",
    blockers: "",
    nextGoals: "",
    remarks: "",
  });

  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProject, setLoadingProject] = useState(true);
  const [error, setError] = useState("");
  const [formFeedback, setFormFeedback] = useState(null);

  // Load student profile
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("student") || "null");
      if (stored) {
        setStudent(stored);
      }
    } catch (e) {
      console.error("Error loading student profile:", e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("student");
    localStorage.removeItem(ACTIVE_PROJECT_STORAGE_KEY);
    sessionStorage.clear();
    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  // Fetch student projects
  useEffect(() => {
    const fetchStudentProjects = async () => {
      try {
        setLoadingProject(true);
        setError("");

        const studentData = JSON.parse(localStorage.getItem("student") || "null");
        const studentId = studentData?.student_id;

        const url = studentId
          ? `${API_BASE_URL}/projects/?student_id=${encodeURIComponent(studentId)}`
          : `${API_BASE_URL}/projects/`;

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to load projects (${res.status})`);
        }

        const data = await res.json();
        const projectList = Array.isArray(data) ? data : [];
        setProjects(projectList);

        // Determine active project ID preserving URL query and localStorage
        let selectedId = queryProjectId;
        if (!selectedId) {
          selectedId = localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY);
        }
        if (!selectedId || !projectList.some((p) => p.project_id === selectedId)) {
          if (projectList.length > 0) {
            selectedId = projectList[0].project_id;
          }
        }

        if (selectedId) {
          setProjectId(selectedId);
          localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, selectedId);
        }
      } catch (err) {
        console.error("Failed to fetch student projects:", err);
        setError(err.message || "Failed to load projects.");
      } finally {
        setLoadingProject(false);
      }
    };

    fetchStudentProjects();
  }, [queryProjectId]);

  // Load active project tracking data and check-ins
  const loadProjectDetails = useCallback(async (targetProjectId) => {
    if (!targetProjectId) return;

    try {
      setError("");
      const res = await fetch(
        `${API_BASE_URL}/projects/${encodeURIComponent(targetProjectId)}/tracking`
      );

      if (!res.ok) {
        throw new Error(`Failed to load project tracking (${res.status})`);
      }

      const data = await res.json();
      setTrackingData(data);
      setProjectTitle(data.title || targetProjectId);

      // Pre-select next uncompleted week
      const milestones = data.milestones || [];
      const progressRecords = data.progress_records || [];
      let nextW = 1;

      for (let i = 0; i < milestones.length; i++) {
        const wNum = milestones[i]?.week || i + 1;
        const rec = progressRecords.find((p) => Number(p.week) === Number(wNum));
        const val = Number(rec?.current_progress ?? rec?.progress ?? 0);
        if (val < 100) {
          nextW = wNum;
          break;
        }
      }
      setCurrentWeek(nextW);

      // Restore saved mentor analysis if available
      if (data.mentor_risk_analysis) {
        setFeedback({
          mentor_analysis: data.mentor_risk_analysis,
        });
      }
    } catch (err) {
      console.error("Error loading project details:", err);
      setError(err.message || "Failed to load project details.");
    }
  }, []);

  useEffect(() => {
    if (projectId) {
      loadProjectDetails(projectId);
    }
  }, [projectId, loadProjectDetails]);

  // Handle Project Selection Change
  const handleProjectSelect = (e) => {
    const newId = e.target.value;
    setProjectId(newId);
    localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, newId);
    setSearchParams({ project_id: newId });
  };

  // Form Field Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const textToArray = (text) => {
    if (!text) return [];
    return text
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  // Submit Weekly Check-in
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setFormFeedback(null);

    try {
      if (!projectId) {
        throw new Error("No active project selected.");
      }

      const progressValue = Number(formData.currentProgress);
      if (
        !Number.isFinite(progressValue) ||
        progressValue < 0 ||
        progressValue > 100
      ) {
        throw new Error("Current progress must be a number between 0 and 100.");
      }

      const requestBody = {
        project_id: projectId,
        week: Number(currentWeek),
        completed_work: textToArray(formData.completedWork),
        current_progress: progressValue,
        blockers: textToArray(formData.blockers),
        next_goals: textToArray(formData.nextGoals),
        pending_work: textToArray(formData.nextGoals),
        hours_spent: formData.hoursSpent ? Number(formData.hoursSpent) : null,
        remarks: formData.remarks ? formData.remarks.trim() : null,
      };

      const response = await fetch(`${API_BASE_URL}/ai/weekly-mentor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to submit check-in.");
      }

      setFeedback(data);
      setFormFeedback({
        type: "success",
        message: `Week ${currentWeek} check-in saved successfully! Progress updated to ${progressValue}%.`,
      });

      // Clear input fields
      setFormData({
        completedWork: "",
        currentProgress: 100,
        hoursSpent: "",
        blockers: "",
        nextGoals: "",
        remarks: "",
      });

      // Reload project tracking to update history and milestones
      await loadProjectDetails(projectId);
    } catch (err) {
      console.error("Weekly Mentor Error:", err);
      setError(err.message || "Failed to submit weekly check-in.");
      setFormFeedback({
        type: "error",
        message: err.message || "Submission failed. Please check connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  const mentorAnalysis = feedback?.mentor_analysis || {};
  const milestones = trackingData?.milestones || [];
  const checkins = trackingData?.weekly_checkins || [];

  return (
    <div className="weekly-mentor-page">
      <Sidebar onLogout={handleLogout} />

      <div className="weekly-mentor-main">
        <Header
          user={{
            name: student?.name || "Student",
            role: "Student",
          }}
          onProfileClick={handleProfileClick}
        />

        <main className="weekly-mentor-content">
          {/* Header & Project Selector */}
          <div className="page-heading-row">
            <div className="page-heading">
              <h1>Weekly AI Mentor</h1>
              <p>
                Submit your weekly progress, log dedicated hours, and receive
                AI-guided mentorship and risk resolutions.
              </p>
            </div>

            <div className="mentor-project-selector">
              <label htmlFor="mentor-project-select">Active Project:</label>
              <select
                id="mentor-project-select"
                value={projectId}
                onChange={handleProjectSelect}
                disabled={loadingProject || projects.length === 0}
              >
                {projects.length === 0 ? (
                  <option value="">No projects found</option>
                ) : (
                  projects.map((p) => (
                    <option key={p.project_id} value={p.project_id}>
                      {p.title || p.project_id} ({p.domain || "General"})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Quick Nav Banner to Progress Tracking */}
          <div className="progress-nav-banner">
            <div>
              <strong>Current Project:</strong> {projectTitle || projectId}
              {trackingData && (
                <span style={{ marginLeft: "12px", color: "#64748b" }}>
                  | Verified Progress: <strong>{trackingData.actual_progress}%</strong> |
                  Status: <strong>{trackingData.overall_status}</strong>
                </span>
              )}
            </div>
            <button
              type="button"
              className="view-tracking-link-btn"
              onClick={() =>
                navigate(
                  `/progress-tracking?project_id=${encodeURIComponent(projectId)}`
                )
              }
            >
              Open Progress Tracking Dashboard →
            </button>
          </div>

          {formFeedback && (
            <div className={`mentor-alert ${formFeedback.type}`}>
              {formFeedback.message}
            </div>
          )}

          {error && <div className="mentor-alert error">{error}</div>}

          {/* Main Layout: Left Form + Right Mentor Feedback */}
          <div className="mentor-layout">
            {/* Left Column: Weekly Check-in Form & History */}
            <div className="mentor-left-column">
              <section className="checkin-card">
                <div className="card-header">
                  <h2>Submit Weekly Check-In</h2>
                  <p>
                    Record your milestones, completed tasks, and challenges to
                    update your verifiable project progress.
                  </p>
                </div>

                {loadingProject ? (
                  <div className="empty-mentor-state">
                    <h3>Loading project details...</h3>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {/* Week Selector */}
                    <div className="form-group">
                      <label htmlFor="currentWeek">Select Milestone Week *</label>
                      <select
                        id="currentWeek"
                        name="currentWeek"
                        value={currentWeek}
                        onChange={(e) => setCurrentWeek(Number(e.target.value))}
                        className="form-select-control"
                      >
                        {milestones.length === 0 ? (
                          <option value={1}>Week 1</option>
                        ) : (
                          milestones.map((m, idx) => (
                            <option key={idx} value={m.week || idx + 1}>
                              Week {m.week || idx + 1}: {m.title || `Milestone ${idx + 1}`}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    {/* Completed Work */}
                    <div className="form-group">
                      <label htmlFor="completedWork">
                        What did you complete this week? *
                      </label>
                      <textarea
                        id="completedWork"
                        name="completedWork"
                        value={formData.completedWork}
                        onChange={handleChange}
                        placeholder="Enter each completed task on a new line..."
                        required
                      />
                      <small>You can enter multiple tasks, one per line.</small>
                    </div>

                    {/* Current Progress & Hours */}
                    <div className="form-row-two-col">
                      <div className="form-group">
                        <label htmlFor="currentProgress">
                          Verified Progress (0 - 100%) *
                        </label>
                        <input
                          id="currentProgress"
                          type="number"
                          name="currentProgress"
                          value={formData.currentProgress}
                          onChange={handleChange}
                          min="0"
                          max="100"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="hoursSpent">Hours Spent this Week</label>
                        <input
                          id="hoursSpent"
                          type="number"
                          name="hoursSpent"
                          value={formData.hoursSpent}
                          onChange={handleChange}
                          step="0.5"
                          min="0"
                          placeholder="e.g. 12.5"
                        />
                      </div>
                    </div>

                    {/* Blockers */}
                    <div className="form-group">
                      <label htmlFor="blockers">Any blockers or challenges?</label>
                      <textarea
                        id="blockers"
                        name="blockers"
                        value={formData.blockers}
                        onChange={handleChange}
                        placeholder="Enter any blockers or technical impediments (one per line)..."
                      />
                      <small>Leave empty if no blockers occurred.</small>
                    </div>

                    {/* Next Goals */}
                    <div className="form-group">
                      <label htmlFor="nextGoals">What are your goals for next week?</label>
                      <textarea
                        id="nextGoals"
                        name="nextGoals"
                        value={formData.nextGoals}
                        onChange={handleChange}
                        placeholder="Enter your upcoming goals or next planned milestones..."
                      />
                    </div>

                    {/* Remarks */}
                    <div className="form-group">
                      <label htmlFor="remarks">Additional Remarks (Optional)</label>
                      <input
                        id="remarks"
                        type="text"
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                        placeholder="Notes for faculty or AI mentor..."
                        className="form-input-control"
                      />
                    </div>

                    <button
                      type="submit"
                      className="submit-checkin-btn"
                      disabled={loading || loadingProject || !projectId}
                    >
                      {loading ? "Recording Check-in & Generating AI Advice..." : "Submit Weekly Check-In"}
                    </button>
                  </form>
                )}
              </section>

              {/* Check-in History */}
              <section className="history-card" style={{ marginTop: "24px" }}>
                <div className="card-header">
                  <h2>Submitted Weekly Check-In History</h2>
                  <p>
                    {checkins.length} recorded check-in
                    {checkins.length !== 1 ? "s" : ""} for this project.
                  </p>
                </div>

                {checkins.length === 0 ? (
                  <div className="empty-history-note">
                    No weekly check-ins submitted yet. Use the form above to record Week 1.
                  </div>
                ) : (
                  <div className="checkin-history-stack">
                    {checkins.map((chk, idx) => (
                      <div key={idx} className="mentor-history-item">
                        <div className="mentor-history-header">
                          <span className="mentor-history-badge">
                            Week {chk.week}
                          </span>
                          <span className="mentor-history-date">
                            {chk.submitted_at
                              ? new Date(chk.submitted_at).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Persisted Record"}
                          </span>
                        </div>

                        <div className="mentor-history-stats">
                          <span>
                            Progress: <strong>{chk.current_progress}%</strong>
                          </span>
                          {chk.hours_spent && (
                            <span style={{ marginLeft: "16px" }}>
                              Hours: <strong>{chk.hours_spent}h</strong>
                            </span>
                          )}
                        </div>

                        {chk.completed_work && chk.completed_work.length > 0 && (
                          <div style={{ marginTop: "8px" }}>
                            <strong style={{ fontSize: "12px", color: "#16a34a" }}>
                              Completed:
                            </strong>
                            <ul className="mentor-history-list">
                              {chk.completed_work.map((task, tIdx) => (
                                <li key={tIdx}>{task}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {chk.blockers && chk.blockers.length > 0 && (
                          <div style={{ marginTop: "8px" }}>
                            <strong style={{ fontSize: "12px", color: "#dc2626" }}>
                              Blockers:
                            </strong>
                            <ul className="mentor-history-list" style={{ color: "#b91c1c" }}>
                              {chk.blockers.map((blk, bIdx) => (
                                <li key={bIdx}>{blk}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Right Column: AI Mentor Response & Actionable Guidance */}
            <div className="mentor-right-column">
              <section className="mentor-response-card">
                <div className="card-header">
                  <h2>AI Mentor Feedback & Guidance</h2>
                  <p>
                    Intelligent mentorship analysis, identified risks, and recommended actions.
                  </p>
                </div>

                {!feedback && !loading && (
                  <div className="empty-mentor-state">
                    <div className="empty-icon">🤖</div>
                    <h3>No feedback generated yet</h3>
                    <p>
                      Submit a weekly check-in using the form on the left to receive
                      real-time personalized mentorship and risk resolutions.
                    </p>
                  </div>
                )}

                {loading && (
                  <div className="empty-mentor-state">
                    <div className="loading-spinner-circle" />
                    <h3>Analyzing your update...</h3>
                    <p>
                      The AI mentor is evaluating your progress, checking
                      milestone risks, and generating customized guidance.
                    </p>
                  </div>
                )}

                {feedback && !loading && (
                  <div className="mentor-feedback">
                    {/* Overall Assessment */}
                    {mentorAnalysis.overall_assessment && (
                      <div className="feedback-section assessment-box">
                        <h3>Overall Assessment</h3>
                        <p>{mentorAnalysis.overall_assessment}</p>
                      </div>
                    )}

                    {/* Summary */}
                    {mentorAnalysis.summary && (
                      <div className="feedback-section">
                        <h3>Progress Summary</h3>
                        <p>{mentorAnalysis.summary}</p>
                      </div>
                    )}

                    {/* Identified Risks */}
                    {Array.isArray(mentorAnalysis.identified_risks) &&
                      mentorAnalysis.identified_risks.length > 0 && (
                        <div className="feedback-section risk-box">
                          <h3>Identified Risks</h3>
                          <ul>
                            {mentorAnalysis.identified_risks.map((risk, index) => (
                              <li key={index}>
                                {typeof risk === "object"
                                  ? JSON.stringify(risk)
                                  : risk}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* Active Blockers */}
                    {Array.isArray(mentorAnalysis.blockers) &&
                      mentorAnalysis.blockers.length > 0 && (
                        <div className="feedback-section blocker-box">
                          <h3>Active Blockers</h3>
                          <ul>
                            {mentorAnalysis.blockers.map((blk, index) => (
                              <li key={index}>
                                {typeof blk === "object"
                                  ? JSON.stringify(blk)
                                  : blk}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* Recommendations */}
                    {Array.isArray(mentorAnalysis.recommendations) &&
                      mentorAnalysis.recommendations.length > 0 && (
                        <div className="feedback-section guidance-box">
                          <h3>Actionable Recommendations</h3>
                          <ul>
                            {mentorAnalysis.recommendations.map((rec, index) => (
                              <li key={index}>
                                {typeof rec === "object"
                                  ? JSON.stringify(rec)
                                  : rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* Resolutions */}
                    {Array.isArray(mentorAnalysis.resolutions) &&
                      mentorAnalysis.resolutions.length > 0 && (
                        <div className="feedback-section resolution-box">
                          <h3>Recommended Resolutions</h3>
                          <ul>
                            {mentorAnalysis.resolutions.map((res, index) => (
                              <li key={index}>
                                {typeof res === "object"
                                  ? JSON.stringify(res)
                                  : res}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WeeklyMentor;