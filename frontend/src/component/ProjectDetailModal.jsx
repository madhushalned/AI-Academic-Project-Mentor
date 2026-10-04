import React, { useMemo } from 'react';

const ProjectDetailModal = ({
  project,
  onClose,
  onMarkWeekComplete,
  completingWeek
}) => {
  if (!project) {
    return null;
  }

  const aiAnalysis = project.ai_analysis || {};
  const progressEvaluation = project.progress_evaluation || {};

  const milestones = Array.isArray(aiAnalysis.milestones)
    ? aiAnalysis.milestones
    : [];

  const progressList = Array.isArray(project.progress)
    ? project.progress
    : [];

  // =====================================================
  // NORMALIZE PROGRESS
  // Supports both:
  // progress
  // current_progress
  // =====================================================

  const normalizeProgress = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return 0;
    }

    return Math.min(Math.max(number, 0), 100);
  };

  const getProgressValue = (item) => {
    if (!item) {
      return 0;
    }

    // Prefer current_progress if available
    if (
      item.current_progress !== undefined &&
      item.current_progress !== null
    ) {
      return normalizeProgress(item.current_progress);
    }

    return normalizeProgress(item.progress);
  };

  const normalizeStatus = (status) => {
    return String(status || '')
      .trim()
      .toLowerCase();
  };

  // =====================================================
  // CHECK WHETHER WEEK IS COMPLETED
  // =====================================================

  const isCompletedProgressItem = (item) => {
    if (!item) {
      return false;
    }

    const progress = getProgressValue(item);
    const status = normalizeStatus(item.status);

    return progress >= 100 || status === 'completed';
  };

  // =====================================================
  // PROGRESS BY WEEK
  // =====================================================

  const progressByWeek = useMemo(() => {
    const map = {};

    progressList.forEach((item) => {
      if (
        item?.week !== undefined &&
        item?.week !== null
      ) {
        map[Number(item.week)] = item;
      }
    });

    return map;
  }, [progressList]);

  // =====================================================
  // PLANNED WEEKS
  // =====================================================

  const plannedWeeks = useMemo(() => {
    const weeks = milestones
      .map((milestone) => Number(milestone?.week))
      .filter((week) => Number.isFinite(week));

    const uniqueWeeks = [...new Set(weeks)];

    if (uniqueWeeks.length > 0) {
      return uniqueWeeks.sort((a, b) => a - b);
    }

    // Fallback if milestones are unavailable
    const progressWeeks = progressList
      .map((item) => Number(item?.week))
      .filter((week) => Number.isFinite(week));

    return [...new Set(progressWeeks)].sort(
      (a, b) => a - b
    );
  }, [milestones, progressList]);

  const totalWeeks = plannedWeeks.length;

  // =====================================================
  // COMPLETED WEEKS
  // =====================================================

  const completedWeekNumbers = useMemo(() => {
    return new Set(
      progressList
        .filter(isCompletedProgressItem)
        .map((item) => Number(item.week))
        .filter((week) => Number.isFinite(week))
    );
  }, [progressList]);

  const completedWeeks =
    totalWeeks > 0
      ? plannedWeeks.filter((week) =>
          completedWeekNumbers.has(Number(week))
        ).length
      : completedWeekNumbers.size;

  const pendingWeeks = Math.max(
    totalWeeks - completedWeeks,
    0
  );

  // =====================================================
  // OVERALL PROJECT PROGRESS
  //
  // ONLY COMPLETED WEEKS ARE COUNTED.
  //
  // Example:
  // 1 / 7 = 14.29%
  // 2 / 7 = 28.57%
  // 3 / 7 = 42.86%
  // 7 / 7 = 100%
  // =====================================================

  const projectProgress =
    totalWeeks > 0
      ? Number(
          ((completedWeeks / totalWeeks) * 100).toFixed(2)
        )
      : 0;

  // =====================================================
  // GET MILESTONE
  // =====================================================

  const getMilestoneForWeek = (week) => {
    return milestones.find(
      (milestone) =>
        Number(milestone?.week) === Number(week)
    );
  };

  // =====================================================
  // GET SAVED PROGRESS
  // =====================================================

  const getSavedProgressForWeek = (week) => {
    return progressByWeek[Number(week)] || null;
  };

  // =====================================================
  // GET WEEK PROGRESS
  //
  // Weekly progress shows the actual saved progress value.
  //
  // Examples:
  // 0%    = Not Started
  // 40%   = In Progress
  // 99%   = In Progress
  // 100%  = Completed
  //
  // IMPORTANT:
  // Overall project progress is still calculated separately
  // using only COMPLETED weeks.
  // =====================================================

  const getWeekProgress = (week) => {
    const saved = getSavedProgressForWeek(week);

    return getProgressValue(saved);
  };

  // =====================================================
  // CHECK WEEK COMPLETION
  // =====================================================

  const isWeekCompleted = (week) => {
    const saved = getSavedProgressForWeek(week);

    return isCompletedProgressItem(saved);
  };

  // =====================================================
  // WEEK STATUS
  // =====================================================

  const getWeekStatus = (week) => {
    const saved = getSavedProgressForWeek(week);
    const progress = getProgressValue(saved);

    if (isCompletedProgressItem(saved)) {
      return 'Completed';
    }

    if (progress > 0) {
      return 'In Progress';
    }

    return 'Not Started';
  };

  // =====================================================
  // COMPLETE WEEK
  // =====================================================

  const handleCompleteWeek = async (week) => {
    if (isWeekCompleted(week)) {
      return;
    }

    if (!onMarkWeekComplete) {
      return;
    }

    await onMarkWeekComplete(Number(week));
  };

  // =====================================================
  // AI EVALUATION DATA
  // =====================================================

  const evaluationProgressScore = normalizeProgress(
    progressEvaluation.progress_score
  );

  const evaluationStatus =
    progressEvaluation.current_status ||
    'Not Evaluated';

  const overallAssessment =
    progressEvaluation.overall_assessment ||
    'No AI progress evaluation available yet.';

  const evaluationCompletedWeeks = Array.isArray(
    progressEvaluation.completed_weeks
  )
    ? progressEvaluation.completed_weeks
    : [];

  const evaluationDelayedWeeks = Array.isArray(
    progressEvaluation.delayed_weeks
  )
    ? progressEvaluation.delayed_weeks
    : [];

  const issues = Array.isArray(
    progressEvaluation.issues
  )
    ? progressEvaluation.issues
    : [];

  const recommendations = Array.isArray(
    progressEvaluation.recommendations
  )
    ? progressEvaluation.recommendations
    : [];

  const nextActions = Array.isArray(
    progressEvaluation.next_actions
  )
    ? progressEvaluation.next_actions
    : [];

  // =====================================================
  // FORMAT WEEK LIST
  // =====================================================

  const formatWeekList = (weeks) => {
    if (!Array.isArray(weeks) || weeks.length === 0) {
      return 'None';
    }

    return weeks
      .map((week) => {
        if (
          typeof week === 'object' &&
          week !== null
        ) {
          return `Week ${week.week}`;
        }

        return `Week ${week}`;
      })
      .join(', ');
  };

  return (
    <div className="project-modal-overlay">
      <div className="project-detail-modal">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="project-modal-header">
          <div>
            <h2>
              {project.title || 'Project Details'}
            </h2>

            {project.domain && (
              <p className="project-domain">
                {project.domain}
              </p>
            )}
          </div>

          <button
            className="close-modal-btn"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        {/* ================================================= */}
        {/* PROJECT INFORMATION */}
        {/* ================================================= */}

        <div className="project-section">
          <h3>Project Information</h3>

          <div className="project-info-grid">

            <div className="info-card">
              <span className="info-label">
                Project ID
              </span>

              <span className="info-value">
                {project.project_id || 'N/A'}
              </span>
            </div>

            <div className="info-card">
              <span className="info-label">
                Domain
              </span>

              <span className="info-value">
                {project.domain || 'N/A'}
              </span>
            </div>

            <div className="info-card">
              <span className="info-label">
                Status
              </span>

              <span className="info-value">
                {project.status || 'N/A'}
              </span>
            </div>

            <div className="info-card">
              <span className="info-label">
                Total Weeks
              </span>

              <span className="info-value">
                {totalWeeks}
              </span>
            </div>

          </div>

          {project.description && (
            <div className="project-description">
              <h4>Description</h4>

              <p>
                {project.description}
              </p>
            </div>
          )}

          {project.problemStatement && (
            <div className="project-description">
              <h4>Problem Statement</h4>

              <p>
                {project.problemStatement}
              </p>
            </div>
          )}

          {project.expectedOutcome && (
            <div className="project-description">
              <h4>Expected Outcome</h4>

              <p>
                {project.expectedOutcome}
              </p>
            </div>
          )}
        </div>

        {/* ================================================= */}
        {/* PROGRESS SUMMARY */}
        {/* ================================================= */}

        <div className="project-section">

          <div className="section-header">
            <h3>Progress Summary</h3>
          </div>

          <div className="progress-summary-grid">

            {/* COMPLETED WEEKS */}

            <div className="summary-card">
              <span className="summary-label">
                Weeks Completed
              </span>

              <strong className="summary-value">
                {completedWeeks}
              </strong>

              <span className="summary-subtext">
                of {totalWeeks}
              </span>
            </div>

            {/* PENDING WEEKS */}

            <div className="summary-card">
              <span className="summary-label">
                Weeks Pending
              </span>

              <strong className="summary-value">
                {pendingWeeks}
              </strong>

              <span className="summary-subtext">
                remaining
              </span>
            </div>

            {/* OVERALL PROJECT PROGRESS */}

            <div className="summary-card">
              <span className="summary-label">
                Overall Project Progress
              </span>

              <strong className="summary-value">
                {projectProgress}%
              </strong>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${projectProgress}%`
                  }}
                />
              </div>

              <span className="summary-subtext">
                Based on completed weeks
              </span>
            </div>

            {/* TOTAL PROGRESS SCALE */}

            <div className="summary-card">
              <span className="summary-label">
                Total Progress
              </span>

              <strong className="summary-value">
                100%
              </strong>

              <span className="summary-subtext">
                Maximum project progress
              </span>
            </div>

          </div>
        </div>

        {/* ================================================= */}
        {/* AI PROGRESS EVALUATION */}
        {/* ================================================= */}

        <div className="project-section">

          <h3>AI Progress Evaluation</h3>

          <div className="ai-evaluation-card">

            <div className="evaluation-score">
              <span className="evaluation-label">
                AI Progress Score
              </span>

              <strong>
                {evaluationProgressScore}%
              </strong>
            </div>

            <div className="evaluation-row">
              <span className="evaluation-label">
                Overall Assessment
              </span>

              <p>
                {overallAssessment}
              </p>
            </div>

            <div className="evaluation-row">
              <span className="evaluation-label">
                Current Status
              </span>

              <span className="evaluation-status">
                {evaluationStatus}
              </span>
            </div>

            <div className="evaluation-row">
              <span className="evaluation-label">
                Completed Weeks
              </span>

              <p>
                {formatWeekList(
                  evaluationCompletedWeeks
                )}
              </p>
            </div>

            <div className="evaluation-row">
              <span className="evaluation-label">
                Delayed Weeks
              </span>

              <p>
                {formatWeekList(
                  evaluationDelayedWeeks
                )}
              </p>
            </div>

            {issues.length > 0 && (
              <div className="evaluation-row">

                <span className="evaluation-label">
                  Issues
                </span>

                <ul>
                  {issues.map((issue, index) => (
                    <li key={index}>
                      {typeof issue === 'object'
                        ? JSON.stringify(issue)
                        : issue}
                    </li>
                  ))}
                </ul>

              </div>
            )}

            {recommendations.length > 0 && (
              <div className="evaluation-row">

                <span className="evaluation-label">
                  Recommendations
                </span>

                <ul>
                  {recommendations.map(
                    (recommendation, index) => (
                      <li key={index}>
                        {typeof recommendation ===
                        'object'
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

            {nextActions.length > 0 && (
              <div className="evaluation-row">

                <span className="evaluation-label">
                  Next Actions
                </span>

                <ul>
                  {nextActions.map(
                    (action, index) => (
                      <li key={index}>
                        {typeof action === 'object'
                          ? JSON.stringify(action)
                          : action}
                      </li>
                    )
                  )}
                </ul>

              </div>
            )}

          </div>
        </div>

        {/* ================================================= */}
        {/* WEEKLY PROGRESS */}
        {/* ================================================= */}

        <div className="project-section">

          <h3>Weekly Progress</h3>

          <div className="weekly-progress-container">

            {plannedWeeks.length === 0 ? (
              <div className="empty-state">
                No milestones available.
              </div>
            ) : (
              plannedWeeks.map((week) => {

                const milestone =
                  getMilestoneForWeek(week);

                const weekProgress =
                  getWeekProgress(week);

                const completed =
                  isWeekCompleted(week);

                const weekStatus =
                  getWeekStatus(week);

                const isCompletingThisWeek =
                  Number(completingWeek) ===
                  Number(week);

                return (
                  <div
                    className={`weekly-card ${
                      completed
                        ? 'weekly-card-completed'
                        : ''
                    }`}
                    key={week}
                  >

                    {/* ===================================== */}
                    {/* WEEK HEADER */}
                    {/* ===================================== */}

                    <div className="weekly-card-header">

                      <div>
                        <h4>
                          Week {week}
                        </h4>

                        {milestone?.title && (
                          <p className="milestone-title">
                            {milestone.title}
                          </p>
                        )}
                      </div>

                      <span
                        className={`week-status ${
                          weekStatus === 'Completed'
                            ? 'completed'
                            : weekStatus === 'In Progress'
                              ? 'in-progress'
                              : 'not-started'
                        }`}
                      >
                        {weekStatus}
                      </span>

                    </div>

                    {/* ===================================== */}
                    {/* MILESTONE DESCRIPTION */}
                    {/* ===================================== */}

                    {milestone?.description && (
                      <div className="milestone-description">

                        <strong>
                          Planned Work
                        </strong>

                        <p>
                          {milestone.description}
                        </p>

                      </div>
                    )}

                    {/* ===================================== */}
                    {/* WEEK PROGRESS */}
                    {/* ===================================== */}

                    <div className="weekly-progress-section">

                      <div className="weekly-progress-header">

                        <span>
                          Progress
                        </span>

                        <strong>
                          {weekProgress}%
                        </strong>

                      </div>

                      <div className="progress-bar">

                        <div
                          className="progress-fill"
                          style={{
                            width: `${weekProgress}%`
                          }}
                        />

                      </div>

                    </div>

                    {/* ===================================== */}
                    {/* ACTION */}
                    {/* ===================================== */}

                    <div className="weekly-actions">

                      {!completed ? (
                        <button
                          type="button"
                          className="complete-week-btn"
                          onClick={() =>
                            handleCompleteWeek(week)
                          }
                          disabled={
                            isCompletingThisWeek
                          }
                        >
                          {isCompletingThisWeek
                            ? 'Completing...'
                            : 'Mark Week Complete'}
                        </button>
                      ) : (
                        <div className="completed-message">
                          ✓ Week Completed
                        </div>
                      )}

                    </div>

                  </div>
                );
              })
            )}

          </div>
        </div>

        {/* ================================================= */}
        {/* AI PROJECT ANALYSIS */}
        {/* ================================================= */}

        {Object.keys(aiAnalysis).length > 0 && (
          <div className="project-section">

            <h3>AI Project Analysis</h3>

            <div className="analysis-card">

              {aiAnalysis.feasibility && (
                <div className="analysis-row">

                  <h4>
                    Feasibility
                  </h4>

                  <p>
                    {typeof aiAnalysis.feasibility ===
                    'object'
                      ? JSON.stringify(
                          aiAnalysis.feasibility,
                          null,
                          2
                        )
                      : aiAnalysis.feasibility}
                  </p>

                </div>
              )}

              {aiAnalysis.technology_recommendation && (
                <div className="analysis-row">

                  <h4>
                    Technology Recommendation
                  </h4>

                  <p>
                    {typeof aiAnalysis.technology_recommendation ===
                    'object'
                      ? JSON.stringify(
                          aiAnalysis.technology_recommendation,
                          null,
                          2
                        )
                      : aiAnalysis.technology_recommendation}
                  </p>

                </div>
              )}

              {aiAnalysis.planning && (
                <div className="analysis-row">

                  <h4>
                    Planning
                  </h4>

                  <p>
                    {typeof aiAnalysis.planning ===
                    'object'
                      ? JSON.stringify(
                          aiAnalysis.planning,
                          null,
                          2
                        )
                      : aiAnalysis.planning}
                  </p>

                </div>
              )}

              {aiAnalysis.risk_analysis && (
                <div className="analysis-row">

                  <h4>
                    Risk Analysis
                  </h4>

                  <p>
                    {typeof aiAnalysis.risk_analysis ===
                    'object'
                      ? JSON.stringify(
                          aiAnalysis.risk_analysis,
                          null,
                          2
                        )
                      : aiAnalysis.risk_analysis}
                  </p>

                </div>
              )}

            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div className="project-modal-footer">

          <button
            type="button"
            className="close-footer-btn"
            onClick={onClose}
          >
            Close
          </button>

        </div>

      </div>

      {/* ================================================= */}
      {/* STYLES */}
      {/* ================================================= */}

      <style>{`

        .project-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          padding: 24px;
        }

        .project-detail-modal {
          width: min(1100px, 100%);
          max-height: 92vh;
          overflow-y: auto;
          background: #ffffff;
          border-radius: 18px;
          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.25);
          padding: 0;
        }

        .project-modal-header {
          position: sticky;
          top: 0;
          z-index: 5;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 24px 28px;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
        }

        .project-modal-header h2 {
          margin: 0;
          font-size: 26px;
          font-weight: 700;
          color: #111827;
        }

        .project-domain {
          margin: 6px 0 0;
          color: #6b7280;
          font-size: 14px;
        }

        .close-modal-btn {
          border: none;
          background: transparent;
          font-size: 32px;
          line-height: 1;
          cursor: pointer;
          color: #6b7280;
          padding: 0 4px;
        }

        .close-modal-btn:hover {
          color: #111827;
        }

        .project-section {
          padding: 24px 28px;
          border-bottom: 1px solid #e5e7eb;
        }

        .project-section h3 {
          margin: 0 0 18px;
          font-size: 20px;
          color: #111827;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 18px;
        }

        .section-header h3 {
          margin-bottom: 0;
        }

        .project-info-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .info-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 14px;
        }

        .info-label,
        .summary-label,
        .evaluation-label {
          display: block;
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 6px;
          font-weight: 600;
        }

        .info-value {
          color: #111827;
          font-size: 14px;
          word-break: break-word;
        }

        .project-description {
          margin-top: 18px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 12px;
        }

        .project-description h4 {
          margin: 0 0 8px;
          color: #111827;
        }

        .project-description p {
          margin: 0;
          color: #4b5563;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .progress-summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .summary-card {
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 18px;
          background: #ffffff;
        }

        .summary-value {
          display: block;
          font-size: 28px;
          color: #111827;
          margin-bottom: 4px;
        }

        .summary-subtext {
          font-size: 13px;
          color: #6b7280;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e5e7eb;
          border-radius: 999px;
          overflow: hidden;
          margin-top: 10px;
        }

        .progress-fill {
          height: 100%;
          background: #22c55e;
          border-radius: 999px;
          transition: width 0.3s ease;
        }

        /* ============================================= */
        /* AI EVALUATION */
        /* ============================================= */

        .ai-evaluation-card {
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 20px;
          background: #f9fafb;
        }

        .evaluation-score {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 16px;
          margin-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .evaluation-score strong {
          font-size: 30px;
          color: #111827;
        }

        .evaluation-row {
          margin-top: 16px;
        }

        .evaluation-row p {
          margin: 0;
          color: #374151;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .evaluation-row ul {
          margin: 8px 0 0;
          padding-left: 22px;
          color: #374151;
        }

        .evaluation-row li {
          margin-bottom: 7px;
          line-height: 1.5;
        }

        .evaluation-status {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 8px;
          background: #eef2ff;
          color: #3730a3;
          font-size: 13px;
          font-weight: 600;
        }

        /* ============================================= */
        /* WEEKLY PROGRESS */
        /* ============================================= */

        .weekly-progress-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .weekly-card {
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 20px;
          background: #ffffff;
        }

        .weekly-card-completed {
          border-color: #bbf7d0;
          background: #f0fdf4;
        }

        .weekly-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 16px;
        }

        .weekly-card-header h4 {
          margin: 0;
          font-size: 18px;
          color: #111827;
        }

        .milestone-title {
          margin: 5px 0 0;
          color: #4b5563;
          font-size: 14px;
        }

        .week-status {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          text-transform: capitalize;
          white-space: nowrap;
        }

        .week-status.completed {
          background: #dcfce7;
          color: #166534;
        }

        .week-status.not-started {
          background: #f3f4f6;
          color: #4b5563;
        }

        .week-status.in-progress {
          background: #fef3c7;
          color: #92400e;
        }

        .milestone-description {
          padding: 14px;
          background: #f9fafb;
          border-radius: 10px;
          margin-bottom: 16px;
        }

        .milestone-description strong {
          display: block;
          font-size: 13px;
          color: #374151;
          margin-bottom: 5px;
        }

        .milestone-description p {
          margin: 0;
          color: #4b5563;
          line-height: 1.5;
          font-size: 14px;
        }

        .weekly-progress-section {
          margin-bottom: 18px;
        }

        .weekly-progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 7px;
          color: #374151;
          font-size: 14px;
        }

        /* ============================================= */
        /* ACTION BUTTON */
        /* ============================================= */

        .weekly-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 14px;
        }

        .complete-week-btn {
          border: none;
          border-radius: 9px;
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s ease;
          background: #16a34a;
          color: #ffffff;
        }

        .complete-week-btn:hover:not(:disabled) {
          background: #15803d;
        }

        .complete-week-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .completed-message {
          width: 100%;
          text-align: right;
          color: #166534;
          font-size: 14px;
          font-weight: 700;
        }

        /* ============================================= */
        /* AI ANALYSIS */
        /* ============================================= */

        .analysis-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .analysis-row {
          padding: 16px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
        }

        .analysis-row h4 {
          margin: 0 0 8px;
          color: #111827;
        }

        .analysis-row p {
          margin: 0;
          color: #4b5563;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        /* ============================================= */
        /* EMPTY STATE */
        /* ============================================= */

        .empty-state {
          padding: 30px;
          text-align: center;
          color: #6b7280;
          background: #f9fafb;
          border-radius: 12px;
        }

        /* ============================================= */
        /* FOOTER */
        /* ============================================= */

        .project-modal-footer {
          display: flex;
          justify-content: flex-end;
          padding: 20px 28px;
          background: #ffffff;
        }

        .close-footer-btn {
          border: none;
          border-radius: 9px;
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          background: #111827;
          color: #ffffff;
        }

        .close-footer-btn:hover {
          background: #1f2937;
        }

        /* ============================================= */
        /* RESPONSIVE */
        /* ============================================= */

        @media (max-width: 900px) {
          .project-info-grid,
          .progress-summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .project-modal-overlay {
            padding: 10px;
          }

          .project-detail-modal {
            max-height: 96vh;
            border-radius: 12px;
          }

          .project-modal-header,
          .project-section,
          .project-modal-footer {
            padding-left: 18px;
            padding-right: 18px;
          }

          .project-info-grid,
          .progress-summary-grid {
            grid-template-columns: 1fr;
          }

          .weekly-card-header {
            flex-direction: column;
          }

          .weekly-actions {
            flex-direction: column;
          }

          .complete-week-btn {
            width: 100%;
          }
        }

      `}</style>
    </div>
  );
};

export default ProjectDetailModal;