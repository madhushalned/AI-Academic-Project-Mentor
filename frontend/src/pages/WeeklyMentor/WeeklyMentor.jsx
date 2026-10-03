import React, { useEffect, useState } from "react";
import Sidebar from "../../common/sidebar";
import Header from "../../common/header";
import "./WeeklyMentor.css";

const API_BASE_URL = "http://127.0.0.1:8000";
const ACTIVE_PROJECT_STORAGE_KEY = "activeProjectId";

const WeeklyMentor = () => {
  const [projectId, setProjectId] = useState("");
  const [currentWeek, setCurrentWeek] = useState(null);
  const [projectTitle, setProjectTitle] = useState("");

  const [formData, setFormData] = useState({
    completedWork: "",
    currentProgress: "",
    blockers: "",
    nextGoals: "",
  });

  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProject, setLoadingProject] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD ACTIVE PROJECT
  // =====================================================

  useEffect(() => {
    const loadActiveProject = async () => {
      try {
        const activeProjectId = localStorage.getItem(
          ACTIVE_PROJECT_STORAGE_KEY
        );

        if (!activeProjectId) {
          throw new Error(
            "No active project found. Please select a project first."
          );
        }

        setProjectId(activeProjectId);

        const response = await fetch(
          `${API_BASE_URL}/projects/${activeProjectId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to load project."
          );
        }

        setProjectTitle(data.title || "");

        // -------------------------------------------------
        // Determine planned weeks from AI milestones
        // -------------------------------------------------

        const milestones = Array.isArray(
          data.ai_analysis?.milestones
        )
          ? data.ai_analysis.milestones
          : [];

        let plannedWeeks = milestones
          .map((milestone) => Number(milestone?.week))
          .filter((week) => Number.isFinite(week));

        // -------------------------------------------------
        // Fallback to saved progress weeks
        // -------------------------------------------------

        if (plannedWeeks.length === 0) {
          const progress = Array.isArray(data.progress)
            ? data.progress
            : [];

          plannedWeeks = progress
            .map((item) => Number(item?.week))
            .filter((week) => Number.isFinite(week));
        }

        plannedWeeks = [...new Set(plannedWeeks)].sort(
          (a, b) => a - b
        );

        // -------------------------------------------------
        // Find first incomplete week
        // -------------------------------------------------

        const progressList = Array.isArray(data.progress)
          ? data.progress
          : [];

        let selectedWeek = null;

        for (const week of plannedWeeks) {
          const savedProgress = progressList.find(
            (item) => Number(item?.week) === Number(week)
          );

          const progress = Number(
            savedProgress?.progress ?? 0
          );

          const status = String(
            savedProgress?.status || ""
          )
            .trim()
            .toLowerCase();

          const completed =
            progress >= 100 || status === "completed";

          if (!completed) {
            selectedWeek = week;
            break;
          }
        }

        // -------------------------------------------------
        // If every planned week is completed
        // -------------------------------------------------

        if (selectedWeek === null && plannedWeeks.length > 0) {
          selectedWeek = plannedWeeks[plannedWeeks.length - 1];
        }

        setCurrentWeek(selectedWeek);
      } catch (err) {
        console.error("Project Load Error:", err);
        setError(err.message);
      } finally {
        setLoadingProject(false);
      }
    };

    loadActiveProject();
  }, []);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =====================================================
  // CONVERT TEXTAREA TO ARRAY
  // =====================================================

  const textToArray = (text) => {
    return text
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  // =====================================================
  // SUBMIT WEEKLY CHECK-IN
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setFeedback(null);

    try {
      if (!projectId) {
        throw new Error(
          "No active project found. Please select a project first."
        );
      }

      if (!currentWeek) {
        throw new Error(
          "Unable to determine the current project week."
        );
      }

      const progressValue = Number(
        formData.currentProgress
      );

      if (
        !Number.isFinite(progressValue) ||
        progressValue < 0 ||
        progressValue > 100
      ) {
        throw new Error(
          "Current progress must be a number between 0 and 100."
        );
      }

      const requestBody = {
        project_id: projectId,
        week: currentWeek,
        completed_work: textToArray(
          formData.completedWork
        ),
        current_progress: progressValue,
        blockers: textToArray(formData.blockers),
        next_goals: textToArray(formData.nextGoals),
        remarks: null,
      };

      console.log(
        "Weekly Mentor Request:",
        requestBody
      );

      const response = await fetch(
        `${API_BASE_URL}/ai/weekly-mentor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to generate mentor feedback."
        );
      }

      console.log(
        "Weekly Mentor Response:",
        data
      );

      setFeedback(data);
    } catch (err) {
      console.error(
        "Weekly Mentor Error:",
        err
      );

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // EXTRACT AI ANALYSIS
  // =====================================================

  const mentorAnalysis =
    feedback?.mentor_analysis || {};

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="weekly-mentor-page">
      <Sidebar />

      <div className="weekly-mentor-main">
        <Header />

        <main className="weekly-mentor-content">
          <div className="page-heading">
            <h1>Weekly AI Mentor</h1>

            <p>
              Share your weekly progress and get
              personalized guidance from your AI mentor.
            </p>

            {!loadingProject && projectId && (
              <p>
                <strong>Project:</strong>{" "}
                {projectTitle || projectId}
                {" | "}
                <strong>Week:</strong>{" "}
                {currentWeek || "Not available"}
              </p>
            )}
          </div>

          <div className="mentor-layout">

            {/* ================================================= */}
            {/* CHECK-IN */}
            {/* ================================================= */}

            <section className="checkin-card">
              <div className="card-header">
                <h2>Weekly Check-in</h2>

                <p>
                  Tell your mentor what you worked on this
                  week.
                </p>
              </div>

              {loadingProject ? (
                <div className="empty-mentor-state">
                  <h3>Loading project...</h3>

                  <p>
                    Determining your current project week.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>

                  {/* COMPLETED WORK */}

                  <div className="form-group">
                    <label>
                      What did you complete this week?
                    </label>

                    <textarea
                      name="completedWork"
                      value={formData.completedWork}
                      onChange={handleChange}
                      placeholder={
                        "Enter each completed task on a new line..."
                      }
                      required
                    />

                    <small>
                      You can enter multiple tasks,
                      one per line.
                    </small>
                  </div>

                  {/* CURRENT PROGRESS */}

                  <div className="form-group">
                    <label>
                      What is your current progress?
                    </label>

                    <input
                      type="number"
                      name="currentProgress"
                      value={formData.currentProgress}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      placeholder="Example: 40"
                      required
                    />

                    <small>
                      Enter your current progress from
                      0 to 100.
                    </small>
                  </div>

                  {/* BLOCKERS */}

                  <div className="form-group">
                    <label>
                      Any blockers or challenges?
                    </label>

                    <textarea
                      name="blockers"
                      value={formData.blockers}
                      onChange={handleChange}
                      placeholder={
                        "Enter each blocker on a new line..."
                      }
                    />

                    <small>
                      Leave empty if there are no blockers.
                    </small>
                  </div>

                  {/* NEXT GOALS */}

                  <div className="form-group">
                    <label>
                      What are your goals for next week?
                    </label>

                    <textarea
                      name="nextGoals"
                      value={formData.nextGoals}
                      onChange={handleChange}
                      placeholder={
                        "Enter each goal on a new line..."
                      }
                      required
                    />

                    <small>
                      Enter each goal on a new line.
                    </small>
                  </div>

                  {/* SUBMIT */}

                  <button
                    type="submit"
                    className="submit-checkin-btn"
                    disabled={
                      loading ||
                      loadingProject ||
                      !projectId ||
                      !currentWeek
                    }
                  >
                    {loading
                      ? "Submitting..."
                      : "Submit Check-in"}
                  </button>
                </form>
              )}

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
            </section>

            {/* ================================================= */}
            {/* AI RESPONSE */}
            {/* ================================================= */}

            <section className="mentor-response-card">
              <div className="card-header">
                <h2>AI Mentor Feedback</h2>

                <p>
                  Your mentor's feedback will appear here
                  after submitting your weekly check-in.
                </p>
              </div>

              {!feedback && !loading && (
                <div className="empty-mentor-state">
                  <h3>No feedback yet</h3>

                  <p>
                    Submit your weekly check-in to receive
                    personalized feedback and recommendations.
                  </p>
                </div>
              )}

              {loading && (
                <div className="empty-mentor-state">
                  <h3>Generating feedback...</h3>

                  <p>
                    Please wait while your weekly update is
                    being processed.
                  </p>
                </div>
              )}

              {feedback && !loading && (
                <div className="mentor-feedback">

                  {/* OVERALL ASSESSMENT */}

                  {mentorAnalysis.overall_assessment && (
                    <div className="feedback-section">
                      <h3>Overall Assessment</h3>

                      <p>
                        {mentorAnalysis.overall_assessment}
                      </p>
                    </div>
                  )}

                  {/* RISKS */}

                  {Array.isArray(
                    mentorAnalysis.identified_risks
                  ) &&
                    mentorAnalysis.identified_risks.length >
                      0 && (
                      <div className="feedback-section">
                        <h3>Risks</h3>

                        <ul>
                          {mentorAnalysis.identified_risks.map(
                            (risk, index) => (
                              <li key={index}>
                                {typeof risk === "object"
                                  ? JSON.stringify(risk)
                                  : risk}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {/* BLOCKERS */}

                  {Array.isArray(
                    mentorAnalysis.blockers
                  ) &&
                    mentorAnalysis.blockers.length > 0 && (
                      <div className="feedback-section">
                        <h3>Blockers</h3>

                        <ul>
                          {mentorAnalysis.blockers.map(
                            (blocker, index) => (
                              <li key={index}>
                                {typeof blocker === "object"
                                  ? JSON.stringify(blocker)
                                  : blocker}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {/* RESOLUTIONS */}

                  {Array.isArray(
                    mentorAnalysis.resolutions
                  ) &&
                    mentorAnalysis.resolutions.length >
                      0 && (
                      <div className="feedback-section">
                        <h3>Resolutions</h3>

                        <ul>
                          {mentorAnalysis.resolutions.map(
                            (resolution, index) => (
                              <li key={index}>
                                {typeof resolution ===
                                "object"
                                  ? JSON.stringify(
                                      resolution
                                    )
                                  : resolution}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {/* RECOMMENDATIONS */}

                  {Array.isArray(
                    mentorAnalysis.recommendations
                  ) &&
                    mentorAnalysis.recommendations.length >
                      0 && (
                      <div className="feedback-section">
                        <h3>Recommendations</h3>

                        <ul>
                          {mentorAnalysis.recommendations.map(
                            (recommendation, index) => (
                              <li key={index}>
                                {typeof recommendation ===
                                "object"
                                  ? JSON.stringify(
                                      recommendation
                                    )
                                  : recommendation}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {/* PLAN ADJUSTMENT */}

                  {mentorAnalysis.plan_adjustment_required !==
                    undefined && (
                    <div className="feedback-section">
                      <h3>Plan Adjustment</h3>

                      <p>
                        {mentorAnalysis.plan_adjustment_required
                          ? "Plan adjustment is required."
                          : "No plan adjustment is required."}
                      </p>
                    </div>
                  )}

                  {/* ADJUSTED PLAN */}

                  {mentorAnalysis.adjusted_plan && (
                    <div className="feedback-section">
                      <h3>Adjusted Plan</h3>

                      {Array.isArray(
                        mentorAnalysis.adjusted_plan
                      ) ? (
                        <ul>
                          {mentorAnalysis.adjusted_plan.map(
                            (item, index) => (
                              <li key={index}>
                                {typeof item === "object"
                                  ? JSON.stringify(item)
                                  : item}
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p>
                          {typeof mentorAnalysis.adjusted_plan ===
                          "object"
                            ? JSON.stringify(
                                mentorAnalysis.adjusted_plan
                              )
                            : mentorAnalysis.adjusted_plan}
                        </p>
                      )}
                    </div>
                  )}

                  {/* NEXT ACTIONS */}

                  {Array.isArray(
                    mentorAnalysis.next_actions
                  ) &&
                    mentorAnalysis.next_actions.length >
                      0 && (
                      <div className="feedback-section">
                        <h3>Next Actions</h3>

                        <ul>
                          {mentorAnalysis.next_actions.map(
                            (action, index) => (
                              <li key={index}>
                                {typeof action === "object"
                                  ? JSON.stringify(action)
                                  : action}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WeeklyMentor;