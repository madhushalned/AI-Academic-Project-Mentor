import StatusBadge from "./StatusBadge.jsx";
import Icon from "./Icon.jsx";

export default function MilestoneCard({ milestone, onView }) {
  const taskDone = milestone.tasks.filter((t) => t.done).length;
  return (
    <div className="milestone-card">
      <div className="milestone-card-head">
        <div>
          <h3 className="milestone-card-title">{milestone.title}</h3>
          <p className="milestone-card-desc">{milestone.description}</p>
        </div>
        <StatusBadge status={milestone.status} />
      </div>

      <div className="milestone-card-meta">
        <span><Icon name="calendar" size={16} /> {milestone.startDate} → {milestone.endDate}</span>
        <span className={`priority priority-${milestone.priority.toLowerCase()}`}>{milestone.priority} priority</span>
      </div>

      <div className="milestone-card-progress">
        <div className="milestone-card-progress-head">
          <span>Progress</span>
          <span>{milestone.progress}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${milestone.progress}%` }} />
        </div>
      </div>

      <div className="milestone-card-footer">
        <span className="milestone-task-count">{taskDone}/{milestone.tasks.length} tasks</span>
        <button className="btn btn-ghost" onClick={() => onView(milestone)}>View Details</button>
      </div>
    </div>
  );
}
