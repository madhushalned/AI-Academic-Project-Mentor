import ProgressCard from "../components/ProgressCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Icon from "../components/Icon.jsx";
import { getProject, getStats, getMilestones, getPendingTasks, getTimelineSummary, getSkillSummary } from "../services/api.js";

export default function Dashboard({ onNavigate }) {
  const project = getProject();
  const stats = getStats();
  const milestones = getMilestones();
  const tasks = getPendingTasks();
  const timelineSummary = getTimelineSummary();
  const skillSummary = getSkillSummary();
  const currentMilestone = milestones.find((m) => m.status === "In Progress");
  const completedMilestones = milestones.filter((m) => m.status === "Completed");

  return (
    <div className="dashboard">
      <div className="dashboard-hero">
        <div className="dashboard-hero-text">
          <h2>{project.name}</h2>
          <p>{project.student} · {project.course} · Supervisor: {project.supervisor}</p>
          <p className="dashboard-hero-dates">
            <Icon name="calendar" size={16} /> {project.startDate} → {project.endDate}
          </p>
        </div>
        <div className="dashboard-hero-ring">
          <div className="ring" style={{ "--ring-value": project.overallProgress }}>
            <span>{project.overallProgress}%</span>
          </div>
          <p>Overall Progress</p>
        </div>
      </div>

      <div className="stat-grid">
        {stats.map((s) => (
          <ProgressCard key={s.id} value={s.value} label={s.label} sub={s.sub} />
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-head">
            <h3>Current Milestone</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("milestones")}>View all</button>
          </div>
          {currentMilestone ? (
            <div className="current-milestone">
              <div className="current-milestone-head">
                <h4>{currentMilestone.title}</h4>
                <StatusBadge status={currentMilestone.status} />
              </div>
              <p className="current-milestone-desc">{currentMilestone.description}</p>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${currentMilestone.progress}%` }} />
              </div>
              <div className="current-milestone-meta">
                <span><Icon name="calendar" size={16} /> {currentMilestone.startDate} → {currentMilestone.endDate}</span>
                <span>{currentMilestone.tasks.filter((t) => t.done).length}/{currentMilestone.tasks.length} tasks</span>
              </div>
            </div>
          ) : (
            <p className="panel-empty">No active milestone.</p>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <h3>Pending Tasks</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("milestones")}>Manage</button>
          </div>
          <ul className="pending-task-list">
            {tasks.map((t) => (
              <li key={t.id} className="pending-task">
                <span className="pending-task-dot" />
                <div className="pending-task-body">
                  <p className="pending-task-title">{t.title}</p>
                  <p className="pending-task-meta">{t.milestone} · Due {t.due}</p>
                </div>
                <span className={`priority priority-${t.priority.toLowerCase()}`}>{t.priority}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h3>Completed Milestones</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("milestones")}>View all</button>
          </div>
          <ul className="completed-list">
            {completedMilestones.map((m) => (
              <li key={m.id} className="completed-item">
                <span className="completed-check"><Icon name="check" size={14} /></span>
                <div>
                  <p className="completed-title">{m.title}</p>
                  <p className="completed-meta">{m.startDate} → {m.endDate}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h3>Skill Assessment Summary</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("skill-assessment")}>Details</button>
          </div>
          <div className="summary-row">
            <div className="summary-ring small" style={{ "--ring-value": skillSummary.average }}>
              <span>{skillSummary.average}</span>
            </div>
            <div className="summary-info">
              <p><strong>{skillSummary.count}</strong> skills assessed</p>
              <p>Average proficiency</p>
            </div>
          </div>
        </section>

        <section className="panel panel-wide">
          <div className="panel-head">
            <h3>Timeline Summary</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("timeline")}>Open timeline</button>
          </div>
          <div className="timeline-summary-grid">
            <div className="ts-item"><span className="ts-value">{timelineSummary.total}</span><span className="ts-label">Total Weeks</span></div>
            <div className="ts-item"><span className="ts-value">{timelineSummary.completed}</span><span className="ts-label">Completed</span></div>
            <div className="ts-item"><span className="ts-value">{timelineSummary.inProgress}</span><span className="ts-label">In Progress</span></div>
            <div className="ts-item"><span className="ts-value">{timelineSummary.atRisk}</span><span className="ts-label">At Risk</span></div>
          </div>
        </section>
      </div>
    </div>
  );
}
