import { useState } from "react";
import Timeline from "../components/Timeline.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Icon from "../components/Icon.jsx";
import { getTimeline, getTimelineSummary, getMilestones } from "../services/api.js";

export default function TimelineManagement({ onNavigate }) {
  const weeks = getTimeline();
  const summary = getTimelineSummary();
  const milestones = getMilestones();
  const [filter, setFilter] = useState("All");
  const overallProgress = Math.round(weeks.reduce((acc, w) => acc + w.progress, 0) / weeks.length);

  const filtered = filter === "All" ? weeks : weeks.filter((w) => w.status === filter);

  const handleMilestoneClick = (name) => {
    onNavigate("milestones");
  };

  return (
    <div className="timeline-management">
      <div className="timeline-overview">
        <div className="timeline-overview-ring" style={{ "--ring-value": overallProgress }}>
          <span>{overallProgress}%</span>
          <p>Overall</p>
        </div>
        <div className="timeline-overview-stats">
          <div className="ts-item"><span className="ts-value">{summary.total}</span><span className="ts-label">Total Weeks</span></div>
          <div className="ts-item"><span className="ts-value">{summary.completed}</span><span className="ts-label">Completed</span></div>
          <div className="ts-item"><span className="ts-value">{summary.inProgress}</span><span className="ts-label">In Progress</span></div>
          <div className="ts-item"><span className="ts-value">{summary.atRisk}</span><span className="ts-label">At Risk</span></div>
        </div>
      </div>

      <div className="filter-bar">
        {["All", "Upcoming", "In Progress", "Completed", "At Risk"].map((f) => (
          <button
            key={f}
            className={`filter-chip ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="timeline-gantt">
        <h3 className="timeline-gantt-title">Project Gantt Overview</h3>
        <div className="gantt-chart">
          {weeks.map((w) => (
            <div key={w.week} className="gantt-row">
              <span className="gantt-label">W{w.week}</span>
              <div className="gantt-track">
                <div
                  className={`gantt-bar status-${w.status.toLowerCase().replace(/\s+/g, "-")}`}
                  style={{ left: `${(w.week - 1) * 7}%`, width: "6%" }}
                >
                  <span className="gantt-bar-tooltip">{w.title} — {w.progress}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Timeline weeks={filtered} onMilestoneClick={handleMilestoneClick} />

      <section className="panel timeline-milestones-panel">
        <div className="panel-head"><h3>Linked Milestones</h3></div>
        <div className="milestone-mini-grid">
          {milestones.map((m) => (
            <div key={m.id} className="milestone-mini" onClick={() => onNavigate("milestones")}>
              <div className="milestone-mini-head">
                <span className="milestone-mini-title">{m.title}</span>
                <StatusBadge status={m.status} />
              </div>
              <div className="progress-bar sm">
                <div className="progress-bar-fill" style={{ width: `${m.progress}%` }} />
              </div>
              <span className="milestone-mini-progress">{m.progress}%</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
