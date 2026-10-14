import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './ProgressTracking.css';

const API_BASE_URL = 'http://127.0.0.1:8000';
const ACTIVE_PROJECT_STORAGE_KEY = 'activeProjectId';

export default function ProgressTracking() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryProjectId = searchParams.get('project_id');

  const [student, setStudent] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [error, setError] = useState('');

  // Load student profile
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('student') || 'null');
      if (stored) {
        setStudent(stored);
      }
    } catch (e) {
      console.error('Error loading student profile:', e);
    }
  }, []);

  // Fetch projects belonging to this authenticated student
  useEffect(() => {
    const fetchStudentProjects = async () => {
      try {
        setLoadingProjects(true);
        setError('');

        const studentData = JSON.parse(localStorage.getItem('student') || 'null');
        const studentId = studentData?.student_id;

        const url = studentId
          ? `${API_BASE_URL}/projects/?student_id=${encodeURIComponent(studentId)}`
          : `${API_BASE_URL}/projects/`;

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to load student projects (${res.status})`);
        }

        const data = await res.json();
        const projectList = Array.isArray(data) ? data : [];
        setProjects(projectList);

        // Determine active project ID preserving URL query and localStorage
        let initialId = queryProjectId;
        if (!initialId) {
          initialId = localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY);
        }
        if (!initialId || !projectList.some((p) => p.project_id === initialId)) {
          if (projectList.length > 0) {
            initialId = projectList[0].project_id;
          }
        }

        if (initialId) {
          setActiveProjectId(initialId);
          localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, initialId);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
        setError(err.message || 'Failed to load projects.');
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchStudentProjects();
  }, [queryProjectId]);

  // Synchronize when query parameter changes
  useEffect(() => {
    if (queryProjectId && queryProjectId !== activeProjectId) {
      setActiveProjectId(queryProjectId);
      localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, queryProjectId);
    }
  }, [queryProjectId, activeProjectId]);

  // Load read-only tracking data for active project
  const loadTrackingData = useCallback(async (projectId) => {
    if (!projectId) return;

    try {
      setLoadingTracking(true);
      setError('');

      const res = await fetch(`${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/tracking`);
      if (!res.ok) {
        throw new Error(`Failed to load progress tracking data (${res.status})`);
      }

      const data = await res.json();
      setTrackingData(data);
    } catch (err) {
      console.error('Tracking fetch error:', err);
      setError(err.message || 'Unable to retrieve tracking details.');
    } finally {
      setLoadingTracking(false);
    }
  }, []);

  useEffect(() => {
    if (activeProjectId) {
      loadTrackingData(activeProjectId);
    }
  }, [activeProjectId, loadTrackingData]);

  const handleProjectSelect = (e) => {
    const newId = e.target.value;
    setActiveProjectId(newId);
    localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, newId);
    setSearchParams({ project_id: newId });
  };

  const activeProject = useMemo(() => {
    return projects.find((p) => p.project_id === activeProjectId) || null;
  }, [projects, activeProjectId]);

  const prediction = trackingData?.prediction;
  const milestones = trackingData?.milestones || [];
  const checkins = trackingData?.weekly_checkins || [];
  const progressRecords = trackingData?.progress_records || [];

  return (
    <div className="progress-tracking-page">
      {/* Top Header & Project Selector */}
      <div className="tracking-header">
        <div className="tracking-header-title">
          <h1>Progress Tracking</h1>
          <p>
            Verifiable milestone progress metrics, verified completion records, and evidence-based completion predictions.
          </p>
        </div>

        <div className="project-selector-wrapper">
          <label htmlFor="project-selector" className="project-selector-label">
            Active Project:
          </label>
          <select
            id="project-selector"
            className="project-select-dropdown"
            value={activeProjectId}
            onChange={handleProjectSelect}
            disabled={loadingProjects || projects.length === 0}
          >
            {projects.length === 0 ? (
              <option value="">No projects found</option>
            ) : (
              projects.map((proj) => (
                <option key={proj.project_id} value={proj.project_id}>
                  {proj.title || proj.project_id} ({proj.domain || 'General'})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {error && (
        <div className="alert-message error" style={{ marginBottom: '20px' }}>
          <strong>Error: </strong> {error}
        </div>
      )}

      {loadingTracking ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 16px' }} />
          Loading project tracking details...
        </div>
      ) : trackingData ? (
        <>
          {/* Quick Nav Banner to Weekly AI Mentor */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '12px 18px',
              borderRadius: '10px',
              marginBottom: '20px',
              fontSize: '14px',
            }}
          >
            <div>
              <span style={{ color: '#475569' }}>Weekly Check-in Form is managed in </span>
              <strong style={{ color: '#0f172a' }}>Weekly AI Mentor</strong>.
            </div>
            <button
              type="button"
              onClick={() =>
                navigate(`/weekly-mentor?project_id=${encodeURIComponent(activeProjectId)}`)
              }
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Go to Weekly AI Mentor →
            </button>
          </div>

          {/* KPI Summary Cards */}
          <div className="tracking-kpi-grid">
            {/* 1. Actual Progress */}
            <div className="tracking-kpi-card">
              <div className="kpi-title">Actual Progress</div>
              <div className="kpi-value-row">
                <span className="kpi-main-number">{trackingData.actual_progress}%</span>
                <span className="kpi-badge completed">Verified</span>
              </div>
              <div className="kpi-progress-bar">
                <div
                  className="kpi-progress-fill"
                  style={{ width: `${trackingData.actual_progress}%` }}
                />
              </div>
              <div className="kpi-subtext">
                Formula: &frac1N; &sum; p_w across {trackingData.total_planned_weeks} planned weeks
              </div>
            </div>

            {/* 2. Planned Progress */}
            <div className="tracking-kpi-card">
              <div className="kpi-title">Planned Progress</div>
              <div className="kpi-value-row">
                <span className="kpi-main-number">{trackingData.planned_progress}%</span>
                <span className="kpi-badge in-progress">Target</span>
              </div>
              <div className="kpi-progress-bar">
                <div
                  className="kpi-progress-fill planned"
                  style={{ width: `${trackingData.planned_progress}%` }}
                />
              </div>
              <div className="kpi-subtext">
                Based on approved 7-day milestone schedule
              </div>
            </div>

            {/* 3. Overall Project Status */}
            <div className="tracking-kpi-card">
              <div className="kpi-title">Overall Status</div>
              <div className="kpi-value-row">
                <span style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
                  {trackingData.overall_status}
                </span>
                <span
                  className={`kpi-badge ${
                    trackingData.overall_status === 'Completed'
                      ? 'completed'
                      : trackingData.overall_status === 'At Risk'
                      ? 'at-risk'
                      : trackingData.overall_status === 'Delayed'
                      ? 'delayed'
                      : 'in-progress'
                  }`}
                >
                  {trackingData.overall_status}
                </span>
              </div>
              <div className="kpi-subtext">
                {trackingData.completed_weeks?.length || 0} of {trackingData.total_planned_weeks} weeks completed
              </div>
            </div>

            {/* 4. Active Risks & Blockers */}
            <div className="tracking-kpi-card">
              <div className="kpi-title">Risk &amp; Blockers</div>
              <div className="kpi-value-row">
                <span className="kpi-main-number">
                  {trackingData.active_blockers?.length || 0}
                </span>
                <span
                  className={`kpi-badge ${
                    trackingData.delayed_weeks?.length > 0 ? 'delayed' : 'completed'
                  }`}
                >
                  {trackingData.delayed_weeks?.length || 0} Delayed
                </span>
              </div>
              <div className="kpi-subtext">
                {trackingData.blocked_weeks?.length || 0} weeks currently blocked
              </div>
            </div>

            {/* 5. Total Cumulative Hours */}
            <div className="tracking-kpi-card">
              <div className="kpi-title">Hours Logged</div>
              <div className="kpi-value-row">
                <span className="kpi-main-number">{trackingData.total_hours_spent}</span>
                <span className="kpi-badge in-progress">Hours</span>
              </div>
              <div className="kpi-subtext">
                Total dedicated time across {checkins.length} submitted check-in{checkins.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Evidence-Based AI Prediction Card */}
          <div
            className={`prediction-card ${
              prediction?.can_predict
                ? 'predicted'
                : prediction?.status === 'stalled'
                ? 'stalled'
                : 'insufficient'
            }`}
          >
            <div className="prediction-header">
              <div className="prediction-title-group">
                <h3>Evidence-Based AI Completion Forecast</h3>
                <span
                  className={`prediction-tag ${
                    prediction?.can_predict
                      ? 'blue'
                      : prediction?.status === 'stalled'
                      ? 'red'
                      : 'amber'
                  }`}
                >
                  {prediction?.can_predict
                    ? 'Prediction Active'
                    : prediction?.status === 'stalled'
                    ? 'Stalled Velocity'
                    : 'Insufficient Data for Reliable Prediction'}
                </span>
              </div>
            </div>

            <div className="prediction-body">
              {prediction?.can_predict ? (
                <>
                  <p style={{ margin: '0 0 12px 0', fontSize: '15px' }}>
                    {prediction.message}
                  </p>
                  <div className="prediction-grid">
                    <div className="prediction-stat">
                      <span className="prediction-stat-label">Estimated Completion</span>
                      <span className="prediction-stat-value" style={{ color: '#2563eb' }}>
                        {prediction.predicted_completion_formatted}
                      </span>
                    </div>

                    <div className="prediction-stat">
                      <span className="prediction-stat-label">Prediction Confidence</span>
                      <span className="prediction-stat-value">
                        {prediction.prediction_confidence}%
                      </span>
                    </div>

                    <div className="prediction-stat">
                      <span className="prediction-stat-label">Measured Velocity</span>
                      <span className="prediction-stat-value">
                        {prediction.velocity_per_week}% / week
                      </span>
                    </div>

                    <div className="prediction-stat">
                      <span className="prediction-stat-label">Remaining Duration</span>
                      <span className="prediction-stat-value">
                        {prediction.weeks_remaining} weeks
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: '#92400e' }}>
                    {prediction?.message || 'Insufficient data for reliable prediction'}
                  </p>
                  <p style={{ margin: 0, color: '#475569', fontSize: '13px' }}>
                    {prediction?.details ||
                      'At least 2 weekly check-ins with verified progress are required to evaluate historical velocity and calculate statistical confidence without speculative projection.'}
                  </p>
                  <div style={{ marginTop: '12px', fontSize: '13px', color: '#64748b' }}>
                    Currently recorded: <strong>{prediction?.checkins_recorded ?? checkins.length}</strong> of{' '}
                    <strong>{prediction?.checkins_required ?? 2}</strong> required check-ins.
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Read-Only Two-Column Content Layout: Milestones Schedule + Check-in History */}
          <div className="tracking-main-grid">
            {/* Left Column: Planned Milestones Schedule */}
            <div>
              <div className="tracking-section">
                <h3>
                  <span>Milestone Schedule &amp; Verified Progress</span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>
                    {milestones.length} Milestones Planned
                  </span>
                </h3>

                <div className="milestones-schedule-list">
                  {milestones.length === 0 ? (
                    <div style={{ color: '#64748b', fontStyle: 'italic', padding: '16px' }}>
                      No milestone breakdown found. Submit or re-run AI planning to generate schedule.
                    </div>
                  ) : (
                    milestones.map((milestone, idx) => {
                      const weekNum = milestone.week || idx + 1;
                      const progressItem = progressRecords.find(
                        (p) => Number(p.week) === Number(weekNum)
                      );
                      const currentProg = Number(
                        progressItem?.current_progress ?? progressItem?.progress ?? 0
                      );
                      const isComplete = currentProg >= 100;
                      const isDelayed = trackingData.delayed_weeks?.includes(weekNum);
                      const isBlocked = trackingData.blocked_weeks?.includes(weekNum);

                      return (
                        <div
                          key={idx}
                          className={`milestone-schedule-item ${
                            isComplete
                              ? 'is-completed'
                              : isBlocked
                              ? 'is-blocked'
                              : isDelayed
                              ? 'is-delayed'
                              : ''
                          }`}
                        >
                          <div className="milestone-header-row">
                            <span className="milestone-week-tag">Week {weekNum}</span>
                            <span
                              className={`kpi-badge ${
                                isComplete
                                  ? 'completed'
                                  : isBlocked
                                  ? 'at-risk'
                                  : isDelayed
                                  ? 'delayed'
                                  : currentProg > 0
                                  ? 'in-progress'
                                  : 'not-started'
                              }`}
                            >
                              {isComplete
                                ? 'Completed'
                                : isBlocked
                                ? 'Blocked'
                                : isDelayed
                                ? 'Delayed'
                                : currentProg > 0
                                ? 'In Progress'
                                : 'Planned'}
                            </span>
                          </div>

                          <h4 className="milestone-title-text">
                            {milestone.title || `Milestone ${weekNum}`}
                          </h4>

                          {milestone.description && (
                            <p className="milestone-desc-text">{milestone.description}</p>
                          )}

                          <div className="milestone-progress-bar-row">
                            <div className="milestone-progress-track">
                              <div
                                className="milestone-progress-fill"
                                style={{
                                  width: `${currentProg}%`,
                                  backgroundColor: isComplete
                                    ? '#16a34a'
                                    : isBlocked
                                    ? '#dc2626'
                                    : '#2563eb',
                                }}
                              />
                            </div>
                            <span className="milestone-progress-percent">{currentProg}%</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Submitted Weekly Check-ins History & Guidance */}
            <div>
              {/* Submitted Weekly Check-ins History */}
              <div className="tracking-section">
                <h3>
                  <span>Submitted Weekly Check-ins History</span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>
                    {checkins.length} Total Check-in{checkins.length !== 1 ? 's' : ''}
                  </span>
                </h3>

                {checkins.length === 0 ? (
                  <div style={{ color: '#64748b', fontStyle: 'italic', padding: '16px' }}>
                    No weekly check-ins recorded yet.{' '}
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/weekly-mentor?project_id=${encodeURIComponent(activeProjectId)}`)
                      }
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Record check-ins in Weekly AI Mentor →
                    </button>
                  </div>
                ) : (
                  <div>
                    {checkins.map((chk, idx) => (
                      <div key={idx} className="checkin-history-item">
                        <div className="checkin-history-header">
                          <span className="checkin-history-week">Week {chk.week} Check-in</span>
                          <span className="checkin-history-date">
                            {chk.submitted_at
                              ? new Date(chk.submitted_at).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Persisted Record'}
                          </span>
                        </div>

                        <div style={{ fontSize: '13px', color: '#475569', marginBottom: '6px' }}>
                          Verified Progress:{' '}
                          <strong style={{ color: '#0f172a' }}>{chk.current_progress}%</strong>
                          {chk.hours_spent ? ` | Hours: ${chk.hours_spent} hrs` : ''}
                        </div>

                        {chk.completed_work && chk.completed_work.length > 0 && (
                          <div>
                            <strong style={{ fontSize: '12px', color: '#16a34a' }}>Completed Work:</strong>
                            <ul className="checkin-history-bullets">
                              {chk.completed_work.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {chk.blockers && chk.blockers.length > 0 && (
                          <div style={{ marginTop: '8px' }}>
                            <strong style={{ fontSize: '12px', color: '#dc2626' }}>
                              Reported Blockers:
                            </strong>
                            <ul className="checkin-history-bullets" style={{ color: '#b91c1c' }}>
                              {chk.blockers.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Mentor & Evaluation Feedback */}
              {trackingData.mentor_risk_analysis && (
                <div className="tracking-section" style={{ marginTop: '20px' }}>
                  <h3>
                    <span>AI Mentor Feedback &amp; Recommendations</span>
                  </h3>
                  <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px' }}>
                    {trackingData.mentor_risk_analysis.overall_assessment && (
                      <p style={{ margin: '0 0 10px 0', fontSize: '14px', lineHeight: 1.5, color: '#1e293b' }}>
                        <strong>Assessment: </strong> {trackingData.mentor_risk_analysis.overall_assessment}
                      </p>
                    )}

                    {trackingData.mentor_risk_analysis.summary && (
                      <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: 1.5, color: '#1e293b' }}>
                        {trackingData.mentor_risk_analysis.summary}
                      </p>
                    )}

                    {trackingData.mentor_risk_analysis.recommendations &&
                      trackingData.mentor_risk_analysis.recommendations.length > 0 && (
                        <div>
                          <strong style={{ fontSize: '13px', color: '#2563eb' }}>
                            Actionable Guidance:
                          </strong>
                          <ul style={{ margin: '6px 0 0 18px', padding: 0, fontSize: '13px', color: '#334155' }}>
                            {trackingData.mentor_risk_analysis.recommendations.map((rec, i) => (
                              <li key={i} style={{ marginBottom: '4px' }}>
                                {typeof rec === 'object' ? JSON.stringify(rec) : rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          Select or submit a project to view progress tracking.
        </div>
      )}
    </div>
  );
}
