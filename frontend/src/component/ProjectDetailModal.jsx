import React from 'react';

const ProjectDetailModal = ({
  project,
  onClose,
  onEvaluateProgress,
  isEvaluatingProgress
}) => {
  if (!project) {
    return null;
  }

  const aiAnalysis = project.ai_analysis || {};

  const progressEvaluation =
    project.progress_evaluation || {};

  const milestones = Array.isArray(aiAnalysis.milestones)
    ? aiAnalysis.milestones
    : [];

  const progressList = Array.isArray(project.progress)
    ? project.progress
    : [];

  // Create lookup for weekly progress
  const progressByWeek = {};

  progressList.forEach((item) => {
    if (
      item &&
      item.week !== undefined &&
      item.week !== null
    ) {
      progressByWeek[item.week] = item;
    }
  });

  // Get planned milestone weeks
  const plannedWeeks = milestones
    .map((milestone) => milestone.week)
    .filter(
      (week) =>
        week !== undefined &&
        week !== null
    );

  // Calculate overall progress
  let overallProgress = 0;

  if (plannedWeeks.length > 0) {
    const totalProgress = plannedWeeks.reduce(
      (total, week) => {
        const progress =
          Number(
            progressByWeek[week]?.progress
          ) || 0;

        return total + progress;
      },
      0
    );

    overallProgress = Math.round(
      totalProgress / plannedWeeks.length
    );
  } else if (progressList.length > 0) {
    const totalProgress = progressList.reduce(
      (total, item) => {
        return (
          total +
          (Number(item?.progress) || 0)
        );
      },
      0
    );

    overallProgress = Math.round(
      totalProgress / progressList.length
    );
  }

  // Keep progress between 0 and 100
  overallProgress = Math.min(
    Math.max(overallProgress, 0),
    100
  );

  // Completed weeks
  const completedWeeks = progressList.filter(
    (item) =>
      Number(item?.progress) >= 100
  ).length;

  // Total planned weeks
  const totalWeeks =
    plannedWeeks.length > 0
      ? plannedWeeks.length
      : progressList.length;

  const pendingWeeks = Math.max(
    totalWeeks - completedWeeks,
    0
  );

  return (
    <div
      style={styles.overlay}
      onClick={onClose}
    >
      <div
        style={styles.modal}
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>

            {project.dateText && (
              <span style={styles.dateBadge}>
                {project.dateText}
              </span>
            )}

            <h2 style={styles.title}>
              {project.title}
            </h2>

          </div>

          <button
            type="button"
            style={styles.closeBtn}
            onClick={onClose}
            aria-label="Close project details"
          >
            &times;
          </button>
        </div>

        {/* Status */}
        <div style={styles.statusWrapper}>
          <span style={styles.statusLabel}>
            Status
          </span>

          <span style={styles.statusBadge}>
            {project.status || 'Not Started'}
          </span>
        </div>

        {/* Project Description */}
        <div style={styles.descriptionContainer}>

          <h3 style={styles.sectionLabel}>
            Project Description
          </h3>

          <p style={styles.description}>
            {project.description ||
              'No description available.'}
          </p>

        </div>

        {/* Domain */}
        {project.domain && (
          <div style={styles.infoSection}>

            <h3 style={styles.sectionLabel}>
              Domain
            </h3>

            <p style={styles.description}>
              {project.domain}
            </p>

          </div>
        )}

        {/* Problem Statement */}
        {project.problemStatement && (
          <div style={styles.infoSection}>

            <h3 style={styles.sectionLabel}>
              Problem Statement
            </h3>

            <p style={styles.description}>
              {project.problemStatement}
            </p>

          </div>
        )}

        {/* Expected Outcome */}
        {project.expectedOutcome && (
          <div style={styles.infoSection}>

            <h3 style={styles.sectionLabel}>
              Expected Outcome
            </h3>

            <p style={styles.description}>
              {project.expectedOutcome}
            </p>

          </div>
        )}

        {/* Metrics */}
        <div style={styles.metricsRow}>

          {/* Completed */}
          <div
            style={{
              ...styles.metricCard,
              borderLeft:
                '4px solid #22c55e'
            }}
          >
            <span style={styles.metricLabel}>
              Weeks Completed
            </span>

            <span
              style={{
                ...styles.metricValue,
                color: '#16a34a'
              }}
            >
              {completedWeeks}
            </span>
          </div>

          {/* Pending */}
          <div
            style={{
              ...styles.metricCard,
              borderLeft:
                '4px solid #eab308'
            }}
          >
            <span style={styles.metricLabel}>
              Weeks Pending
            </span>

            <span
              style={{
                ...styles.metricValue,
                color: '#ca8a04'
              }}
            >
              {pendingWeeks}
            </span>
          </div>

          {/* Overall */}
          <div
            style={{
              ...styles.metricCard,
              borderLeft:
                '4px solid #2563eb'
            }}
          >
            <span style={styles.metricLabel}>
              Overall Progress
            </span>

            <span
              style={{
                ...styles.metricValue,
                color: '#1d4ed8'
              }}
            >
              {overallProgress}%
            </span>
          </div>

        </div>

        {/* Overall Progress */}
        <div style={styles.progressSection}>

          <div style={styles.progressHeader}>

            <span style={styles.progressLabel}>
              Overall Project Progress
            </span>

            <span
              style={styles.progressPercentage}
            >
              {overallProgress}%
            </span>

          </div>

          <div style={styles.progressTrack}>

            <div
              style={{
                ...styles.progressBar,
                width: `${overallProgress}%`
              }}
            />

          </div>

        </div>

        {/* AI Progress Evaluation Action */}
        <div style={styles.evaluationActionSection}>

          <div>
            <h3 style={styles.sectionTitle}>
              AI Progress Evaluation
            </h3>

            <p style={styles.sectionSubtitle}>
              Compare your current progress with
              the AI-generated project plan.
            </p>
          </div>

          <button
            type="button"
            style={{
              ...styles.evaluateButton,
              opacity: isEvaluatingProgress
                ? 0.7
                : 1,
              cursor: isEvaluatingProgress
                ? 'not-allowed'
                : 'pointer'
            }}
            onClick={onEvaluateProgress}
            disabled={isEvaluatingProgress}
          >
            {isEvaluatingProgress
              ? 'Evaluating...'
              : 'Evaluate Progress'}
          </button>

        </div>

        {/* AI Progress Evaluation Result */}
        {Object.keys(progressEvaluation).length > 0 && (
          <div style={styles.evaluationContainer}>

            <div style={styles.evaluationHeader}>

              <div>
                <h3 style={styles.sectionTitle}>
                  AI Progress Evaluation
                </h3>

                <p style={styles.sectionSubtitle}>
                  Evaluation generated by the
                  Progress Mentor agent.
                </p>
              </div>

              <span style={styles.evaluationScore}>
                {progressEvaluation.progress_score ?? 0}%
              </span>

            </div>

            {/* Overall Assessment */}
            {progressEvaluation.overall_assessment && (
              <div style={styles.evaluationBox}>

                <span style={styles.evaluationLabel}>
                  Overall Assessment
                </span>

                <p style={styles.evaluationText}>
                  {progressEvaluation.overall_assessment}
                </p>

              </div>
            )}

            {/* Current Status */}
            {progressEvaluation.current_status && (
              <div style={styles.evaluationBox}>

                <span style={styles.evaluationLabel}>
                  Current Status
                </span>

                <p style={styles.evaluationText}>
                  {progressEvaluation.current_status}
                </p>

              </div>
            )}

            {/* Completed Weeks */}
            {Array.isArray(
              progressEvaluation.completed_weeks
            ) &&
              progressEvaluation.completed_weeks.length > 0 && (
                <div style={styles.evaluationBox}>

                  <span style={styles.evaluationLabel}>
                    Completed Weeks
                  </span>

                  <p style={styles.evaluationText}>
                    {progressEvaluation.completed_weeks
                      .map(
                        (week) =>
                          `Week ${week}`
                      )
                      .join(', ')}
                  </p>

                </div>
              )}

            {/* Delayed / Incomplete Weeks */}
            {Array.isArray(
              progressEvaluation.delayed_weeks
            ) &&
              progressEvaluation.delayed_weeks.length > 0 && (
                <div style={styles.evaluationBox}>

                  <span style={styles.evaluationLabel}>
                    Delayed / Incomplete Weeks
                  </span>

                  <p style={styles.evaluationText}>
                    {progressEvaluation.delayed_weeks
                      .map(
                        (week) =>
                          `Week ${week}`
                      )
                      .join(', ')}
                  </p>

                </div>
              )}

            {/* Issues */}
            {Array.isArray(
              progressEvaluation.issues
            ) &&
              progressEvaluation.issues.length > 0 && (
                <div style={styles.evaluationBox}>

                  <span style={styles.evaluationLabel}>
                    Issues
                  </span>

                  <ul style={styles.evaluationList}>

                    {progressEvaluation.issues.map(
                      (issue, index) => (
                        <li key={index}>
                          {issue}
                        </li>
                      )
                    )}

                  </ul>

                </div>
              )}

            {/* Recommendations */}
            {Array.isArray(
              progressEvaluation.recommendations
            ) &&
              progressEvaluation.recommendations.length > 0 && (
                <div style={styles.evaluationBox}>

                  <span style={styles.evaluationLabel}>
                    Recommendations
                  </span>

                  <ul style={styles.evaluationList}>

                    {progressEvaluation.recommendations.map(
                      (
                        recommendation,
                        index
                      ) => (
                        <li key={index}>
                          {recommendation}
                        </li>
                      )
                    )}

                  </ul>

                </div>
              )}

            {/* Next Actions */}
            {Array.isArray(
              progressEvaluation.next_actions
            ) &&
              progressEvaluation.next_actions.length > 0 && (
                <div style={styles.evaluationBox}>

                  <span style={styles.evaluationLabel}>
                    Next Actions
                  </span>

                  <ul style={styles.evaluationList}>

                    {progressEvaluation.next_actions.map(
                      (action, index) => (
                        <li key={index}>
                          {action}
                        </li>
                      )
                    )}

                  </ul>

                </div>
              )}

          </div>
        )}

        {/* AI Milestones */}
        <div style={styles.milestoneContainer}>

          <div style={styles.sectionHeaderRow}>

            <div>
              <h3 style={styles.sectionTitle}>
                AI-Generated Project Milestones
              </h3>

              <p style={styles.sectionSubtitle}>
                Milestones generated by CrewAI
                during project analysis.
              </p>
            </div>

            <span style={styles.countBadge}>
              {milestones.length}
            </span>

          </div>

          {milestones.length === 0 ? (

            <div style={styles.emptyState}>
              AI milestones are not available yet.
              Analyze the project first.
            </div>

          ) : (

            <div style={styles.milestoneList}>

              {milestones.map(
                (milestone, index) => {

                  const week =
                    milestone?.week ??
                    index + 1;

                  const weekProgress = Math.min(
                    Math.max(
                      Number(
                        progressByWeek[week]
                          ?.progress
                      ) || 0,
                      0
                    ),
                    100
                  );

                  const weekStatus =
                    progressByWeek[week]
                      ?.status ||
                    'not_started';

                  const remarks =
                    progressByWeek[week]
                      ?.remarks;

                  const tasks =
                    Array.isArray(
                      milestone?.tasks
                    )
                      ? milestone.tasks
                      : [];

                  const deliverables =
                    Array.isArray(
                      milestone?.deliverables
                    )
                      ? milestone.deliverables
                      : [];

                  return (
                    <div
                      key={`${week}-${index}`}
                      style={
                        styles.milestoneCard
                      }
                    >

                      {/* Milestone Header */}
                      <div
                        style={
                          styles.milestoneHeader
                        }
                      >

                        <div>

                          <span
                            style={
                              styles.weekBadge
                            }
                          >
                            Week {week}
                          </span>

                          <h4
                            style={
                              styles.milestoneTitle
                            }
                          >
                            {milestone?.title ||
                              `Milestone ${
                                index + 1
                              }`}
                          </h4>

                        </div>

                        <span
                          style={{
                            ...styles.progressBadge,
                            backgroundColor:
                              weekProgress >=
                              100
                                ? '#dcfce7'
                                : weekProgress >
                                  0
                                ? '#dbeafe'
                                : '#f1f5f9',
                            color:
                              weekProgress >=
                              100
                                ? '#15803d'
                                : weekProgress >
                                  0
                                ? '#1d4ed8'
                                : '#64748b'
                          }}
                        >
                          {weekProgress}%
                        </span>

                      </div>

                      {/* Description */}
                      {milestone?.description && (
                        <p
                          style={
                            styles.milestoneDescription
                          }
                        >
                          {milestone.description}
                        </p>
                      )}

                      {/* Weekly Status */}
                      <div
                        style={
                          styles.weekStatusRow
                        }
                      >

                        <span
                          style={
                            styles.smallLabel
                          }
                        >
                          Current Status:
                        </span>

                        <span
                          style={
                            styles.statusText
                          }
                        >
                          {String(
                            weekStatus
                          ).replace(
                            /_/g,
                            ' '
                          )}
                        </span>

                      </div>

                      {/* Weekly Progress */}
                      <div
                        style={
                          styles.weekProgressTrack
                        }
                      >

                        <div
                          style={{
                            ...styles.weekProgressBar,
                            width: `${weekProgress}%`
                          }}
                        />

                      </div>

                      {/* Tasks */}
                      {tasks.length > 0 && (
                        <div
                          style={
                            styles.subSection
                          }
                        >

                          <h5
                            style={
                              styles.subSectionTitle
                            }
                          >
                            Tasks
                          </h5>

                          <ul
                            style={
                              styles.taskList
                            }
                          >

                            {tasks.map(
                              (
                                task,
                                taskIndex
                              ) => (

                                <li
                                  key={
                                    taskIndex
                                  }
                                  style={
                                    styles.taskItem
                                  }
                                >
                                  {typeof task ===
                                  'string'
                                    ? task
                                    : task?.title ||
                                      task?.task ||
                                      task?.name ||
                                      JSON.stringify(
                                        task
                                      )}
                                </li>

                              )
                            )}

                          </ul>

                        </div>
                      )}

                      {/* Deliverables */}
                      {deliverables.length >
                        0 && (
                        <div
                          style={
                            styles.subSection
                          }
                        >

                          <h5
                            style={
                              styles.subSectionTitle
                            }
                          >
                            Deliverables
                          </h5>

                          <ul
                            style={
                              styles.taskList
                            }
                          >

                            {deliverables.map(
                              (
                                deliverable,
                                deliverableIndex
                              ) => (

                                <li
                                  key={
                                    deliverableIndex
                                  }
                                  style={
                                    styles.deliverableItem
                                  }
                                >
                                  {typeof deliverable ===
                                  'string'
                                    ? deliverable
                                    : deliverable?.title ||
                                      deliverable?.name ||
                                      JSON.stringify(
                                        deliverable
                                      )}
                                </li>

                              )
                            )}

                          </ul>

                        </div>
                      )}

                      {/* Remarks */}
                      {remarks && (
                        <div
                          style={
                            styles.remarksBox
                          }
                        >

                          <span
                            style={
                              styles.smallLabel
                            }
                          >
                            Progress Remarks
                          </span>

                          <p
                            style={
                              styles.remarksText
                            }
                          >
                            {remarks}
                          </p>

                        </div>
                      )}

                    </div>
                  );
                }
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

const styles = {

  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor:
      'rgba(15, 23, 42, 0.45)',
    backdropFilter: 'blur(2px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 1000,
    boxSizing: 'border-box',
    overflowY: 'auto'
  },

  modal: {
    position: 'relative',
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: '700px',
    height: '90vh',
    maxHeight: '90vh',
    overflowY: 'scroll',
    overflowX: 'hidden',
    borderRadius: '16px',
    padding: '28px',
    boxSizing: 'border-box',
    boxShadow:
      '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '20px'
  },

  headerContent: {
    minWidth: 0,
    flex: 1
  },

  dateBadge: {
    display: 'inline-block',
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: '5px'
  },

  title: {
    margin: 0,
    fontSize: '21px',
    lineHeight: '1.3',
    fontWeight: '700',
    color: '#0f172a',
    wordBreak: 'break-word'
  },

  closeBtn: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    border: 'none',
    borderRadius: '7px',
    fontSize: '24px',
    lineHeight: 1,
    cursor: 'pointer',
    color: '#64748b',
    flexShrink: 0
  },

  statusWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '16px'
  },

  statusLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b'
  },

  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    padding: '5px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600'
  },

  descriptionContainer: {
    marginTop: '20px',
    paddingBottom: '18px',
    borderBottom:
      '1px solid #f1f5f9'
  },

  infoSection: {
    marginTop: '18px',
    paddingBottom: '18px',
    borderBottom:
      '1px solid #f1f5f9'
  },

  sectionLabel: {
    margin: '0 0 7px 0',
    fontSize: '13px',
    fontWeight: '700',
    color: '#0f172a'
  },

  description: {
    margin: 0,
    fontSize: '14px',
    color: '#475569',
    lineHeight: '1.6',
    wordBreak: 'break-word'
  },

  metricsRow: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(3, 1fr)',
    gap: '12px',
    margin: '20px 0 18px 0'
  },

  metricCard: {
    backgroundColor: '#f8fafc',
    padding: '13px 14px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    borderLeft:
      '4px solid #2563eb'
  },

  metricLabel: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '600'
  },

  metricValue: {
    fontSize: '20px',
    fontWeight: '700',
    marginTop: '3px'
  },

  progressSection: {
    marginBottom: '24px'
  },

  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '7px'
  },

  progressLabel: {
    fontSize: '12px',
    color: '#475569',
    fontWeight: '600'
  },

  progressPercentage: {
    fontSize: '12px',
    color: '#1d4ed8',
    fontWeight: '700'
  },

  progressTrack: {
    height: '8px',
    width: '100%',
    backgroundColor: '#e2e8f0',
    borderRadius: '5px',
    overflow: 'hidden'
  },

  progressBar: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: '5px',
    transition:
      'width 0.3s ease'
  },

  /* AI Evaluation Button Section */
  evaluationActionSection: {
    marginTop: '20px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '15px'
  },

  evaluateButton: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '9px 14px',
    fontSize: '12px',
    fontWeight: '700',
    flexShrink: 0
  },

  /* AI Evaluation Result */
  evaluationContainer: {
    marginTop: '15px',
    padding: '18px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px'
  },

  evaluationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '15px',
    marginBottom: '15px'
  },

  evaluationScore: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: '7px 11px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '700',
    flexShrink: 0
  },

  evaluationBox: {
    marginTop: '12px',
    padding: '11px 13px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px'
  },

  evaluationLabel: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '5px'
  },

  evaluationText: {
    margin: 0,
    fontSize: '12px',
    color: '#475569',
    lineHeight: '1.5'
  },

  evaluationList: {
    margin: 0,
    paddingLeft: '18px',
    color: '#475569',
    fontSize: '12px',
    lineHeight: '1.6'
  },

  /* Milestones */
  milestoneContainer: {
    borderTop:
      '1px solid #f1f5f9',
    paddingTop: '18px'
  },

  sectionHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '15px',
    marginBottom: '15px'
  },

  sectionTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  },

  sectionSubtitle: {
    fontSize: '12px',
    color: '#94a3b8',
    margin: '4px 0 0 0'
  },

  countBadge: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    fontSize: '11px',
    fontWeight: '700',
    padding: '5px 9px',
    borderRadius: '12px',
    flexShrink: 0
  },

  milestoneList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  milestoneCard: {
    border:
      '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '16px',
    backgroundColor: '#ffffff'
  },

  milestoneHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '15px'
  },

  weekBadge: {
    display: 'inline-block',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    fontSize: '10px',
    fontWeight: '700',
    padding: '4px 7px',
    borderRadius: '6px',
    marginBottom: '5px'
  },

  milestoneTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a'
  },

  progressBadge: {
    padding: '5px 9px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '700',
    flexShrink: 0
  },

  milestoneDescription: {
    fontSize: '12px',
    color: '#64748b',
    lineHeight: '1.5',
    margin: '10px 0'
  },

  weekStatusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '10px'
  },

  smallLabel: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '600'
  },

  statusText: {
    fontSize: '11px',
    color: '#334155',
    fontWeight: '600',
    textTransform: 'capitalize'
  },

  weekProgressTrack: {
    width: '100%',
    height: '6px',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '8px'
  },

  weekProgressBar: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: '4px',
    transition:
      'width 0.3s ease'
  },

  subSection: {
    marginTop: '14px'
  },

  subSectionTitle: {
    margin: '0 0 7px 0',
    fontSize: '11px',
    fontWeight: '700',
    color: '#334155'
  },

  taskList: {
    margin: 0,
    paddingLeft: '18px'
  },

  taskItem: {
    fontSize: '12px',
    color: '#475569',
    lineHeight: '1.5',
    marginBottom: '4px'
  },

  deliverableItem: {
    fontSize: '12px',
    color: '#334155',
    lineHeight: '1.5',
    marginBottom: '4px'
  },

  remarksBox: {
    marginTop: '14px',
    padding: '10px 12px',
    backgroundColor: '#f8fafc',
    borderRadius: '7px'
  },

  remarksText: {
    margin: '4px 0 0 0',
    fontSize: '12px',
    color: '#475569',
    lineHeight: '1.5'
  },

  emptyState: {
    padding: '20px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '13px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px'
  }
};

export default ProjectDetailModal;