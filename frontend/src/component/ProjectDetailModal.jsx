import React from 'react';

const ProjectDetailModal = ({
  project,
  onClose,
  onToggleTask
}) => {
  if (!project) {
    return null;
  }

  const tasks = project.tasks || [];

  const totalTasks = tasks.length;

  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingCount = totalTasks - completedCount;

  const progressPercent =
    totalTasks === 0
      ? 0
      : Math.round((completedCount / totalTasks) * 100);

  return (
    <div
      style={styles.overlay}
      onClick={onClose}
    >

      <div
        style={styles.modal}
        onClick={(event) => event.stopPropagation()}
      >

        {/* Header */}
        <div style={styles.header}>

          <div style={styles.headerContent}>

            <span style={styles.dateBadge}>
              {project.dateText}
            </span>

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
            {project.status}
          </span>
        </div>

        {/* Description */}
        <div style={styles.descriptionContainer}>

          <h3 style={styles.sectionLabel}>
            Project Description
          </h3>

          <p style={styles.description}>
            {project.description}
          </p>

        </div>

        {/* Metrics */}
        <div style={styles.metricsRow}>

          {/* Completed */}
          <div
            style={{
              ...styles.metricCard,
              borderLeft: '4px solid #22c55e'
            }}
          >

            <span style={styles.metricLabel}>
              Tasks Completed
            </span>

            <span
              style={{
                ...styles.metricValue,
                color: '#16a34a'
              }}
            >
              {completedCount}
            </span>

          </div>

          {/* Pending */}
          <div
            style={{
              ...styles.metricCard,
              borderLeft: '4px solid #eab308'
            }}
          >

            <span style={styles.metricLabel}>
              Tasks Left
            </span>

            <span
              style={{
                ...styles.metricValue,
                color: '#ca8a04'
              }}
            >
              {pendingCount}
            </span>

          </div>

          {/* Progress */}
          <div
            style={{
              ...styles.metricCard,
              borderLeft: '4px solid #2563eb'
            }}
          >

            <span style={styles.metricLabel}>
              Progress
            </span>

            <span
              style={{
                ...styles.metricValue,
                color: '#1d4ed8'
              }}
            >
              {progressPercent}%
            </span>

          </div>

        </div>

        {/* Progress Bar */}
        <div style={styles.progressSection}>

          <div style={styles.progressHeader}>

            <span style={styles.progressLabel}>
              Overall Progress
            </span>

            <span style={styles.progressPercentage}>
              {progressPercent}%
            </span>

          </div>

          <div style={styles.progressTrack}>

            <div
              style={{
                ...styles.progressBar,
                width: `${progressPercent}%`
              }}
            />

          </div>

        </div>

        {/* Tasks */}
        <div style={styles.taskListContainer}>

          <div style={styles.taskHeaderRow}>

            <div>
              <h3 style={styles.taskHeader}>
                Project Action Items
              </h3>

              <p style={styles.taskSubtitle}>
                Complete these tasks to move your project forward.
              </p>
            </div>

            <span style={styles.taskCount}>
              {completedCount}/{totalTasks}
            </span>

          </div>

          {tasks.length === 0 ? (

            <div style={styles.noTasks}>
              No tasks available for this project yet.
            </div>

          ) : (

            <ul style={styles.taskList}>

              {tasks.map((task) => (

                <li
                  key={task.id}
                  style={{
                    ...styles.taskItem,
                    ...(task.completed
                      ? styles.completedTaskItem
                      : {})
                  }}
                >

                  <label style={styles.checkboxLabel}>

                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() =>
                        onToggleTask(
                          project.id,
                          task.id
                        )
                      }
                      style={styles.checkbox}
                    />

                    <span
                      style={{
                        ...styles.taskText,
                        textDecoration: task.completed
                          ? 'line-through'
                          : 'none',

                        color: task.completed
                          ? '#94a3b8'
                          : '#334155'
                      }}
                    >
                      {task.text}
                    </span>

                  </label>

                </li>

              ))}

            </ul>

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
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    backdropFilter: 'blur(2px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 1000,
    boxSizing: 'border-box'
  },

  modal: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto',
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
    borderBottom: '1px solid #f1f5f9'
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
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    margin: '20px 0 18px 0'
  },

  metricCard: {
    backgroundColor: '#f8fafc',
    padding: '13px 14px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0
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
    transition: 'width 0.3s ease'
  },

  taskListContainer: {
    borderTop: '1px solid #f1f5f9',
    paddingTop: '18px'
  },

  taskHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '15px',
    marginBottom: '12px'
  },

  taskHeader: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  },

  taskSubtitle: {
    fontSize: '12px',
    color: '#94a3b8',
    margin: '4px 0 0 0'
  },

  taskCount: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    fontSize: '11px',
    fontWeight: '700',
    padding: '5px 9px',
    borderRadius: '12px',
    flexShrink: 0
  },

  taskList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },

  taskItem: {
    padding: '11px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    transition: 'background-color 0.2s ease'
  },

  completedTaskItem: {
    backgroundColor: '#f8fafc'
  },

  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    width: '100%'
  },

  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
    flexShrink: 0
  },

  taskText: {
    fontSize: '13px',
    lineHeight: '1.4'
  },

  noTasks: {
    padding: '20px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '13px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px'
  }
};

export default ProjectDetailModal;