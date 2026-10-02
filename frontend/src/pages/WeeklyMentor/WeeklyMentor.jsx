import React, { useState } from "react";
import Sidebar from "../../common/sidebar";
import Header from "../../common/header";
import "./WeeklyMentor.css";

const API_BASE_URL = "http://127.0.0.1:8000";

const WeeklyMentor = () => {
  const [formData, setFormData] = useState({
    completedWork: "",
    currentProgress: "",
    blockers: "",
    nextGoals: "",
  });

  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setFeedback(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/ai/weekly-mentor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to generate mentor feedback."
        );
      }

      setFeedback(data);
    } catch (err) {
      console.error("Weekly Mentor Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="weekly-mentor-page">
      <Sidebar />

      <div className="weekly-mentor-main">
        <Header />

        <main className="weekly-mentor-content">
          <div className="page-heading">
            <h1>Weekly AI Mentor</h1>
            <p>
              Share your weekly progress and get personalized
              guidance from your AI mentor.
            </p>
          </div>

          <div className="mentor-layout">
            {/* CHECK-IN */}

            <section className="checkin-card">
              <div className="card-header">
                <h2>Weekly Check-in</h2>
                <p>
                  Tell your mentor what you worked on this week.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>
                    What did you complete this week?
                  </label>

                  <textarea
                    name="completedWork"
                    value={formData.completedWork}
                    onChange={handleChange}
                    placeholder="Describe the work you completed..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    What is your current progress?
                  </label>

                  <textarea
                    name="currentProgress"
                    value={formData.currentProgress}
                    onChange={handleChange}
                    placeholder="Describe the current state of your project..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Any blockers or challenges?
                  </label>

                  <textarea
                    name="blockers"
                    value={formData.blockers}
                    onChange={handleChange}
                    placeholder="Mention any problems, delays, or blockers..."
                  />
                </div>

                <div className="form-group">
                  <label>
                    What are your goals for next week?
                  </label>

                  <textarea
                    name="nextGoals"
                    value={formData.nextGoals}
                    onChange={handleChange}
                    placeholder="What do you plan to complete next?"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="submit-checkin-btn"
                  disabled={loading}
                >
                  {loading
                    ? "Submitting..."
                    : "Submit Check-in"}
                </button>
              </form>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
            </section>

            {/* AI RESPONSE */}

            <section className="mentor-response-card">
              <div className="card-header">
                <h2>AI Mentor Feedback</h2>
                <p>
                  Your mentor's feedback will appear here after
                  submitting your weekly check-in.
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

                  {feedback.feedback && (
                    <div className="feedback-section">
                      <h3>Feedback</h3>
                      <p>{feedback.feedback}</p>
                    </div>
                  )}

                  {feedback.risks && (
                    <div className="feedback-section">
                      <h3>Risks</h3>

                      {Array.isArray(feedback.risks) ? (
                        <ul>
                          {feedback.risks.map(
                            (risk, index) => (
                              <li key={index}>
                                {risk}
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p>{feedback.risks}</p>
                      )}
                    </div>
                  )}

                  {feedback.recommendations && (
                    <div className="feedback-section">
                      <h3>Recommendations</h3>

                      {Array.isArray(
                        feedback.recommendations
                      ) ? (
                        <ul>
                          {feedback.recommendations.map(
                            (item, index) => (
                              <li key={index}>
                                {item}
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p>
                          {feedback.recommendations}
                        </p>
                      )}
                    </div>
                  )}

                  {feedback.resolutions && (
                    <div className="feedback-section">
                      <h3>Resolutions</h3>

                      {Array.isArray(
                        feedback.resolutions
                      ) ? (
                        <ul>
                          {feedback.resolutions.map(
                            (item, index) => (
                              <li key={index}>
                                {item}
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p>
                          {feedback.resolutions}
                        </p>
                      )}
                    </div>
                  )}

                  {feedback.nextActions && (
                    <div className="feedback-section">
                      <h3>Next Actions</h3>

                      {Array.isArray(
                        feedback.nextActions
                      ) ? (
                        <ul>
                          {feedback.nextActions.map(
                            (item, index) => (
                              <li key={index}>
                                {item}
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p>
                          {feedback.nextActions}
                        </p>
                      )}
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