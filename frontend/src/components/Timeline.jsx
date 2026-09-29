import StatusBadge from "./StatusBadge.jsx";

export default function Timeline({ weeks, onMilestoneClick }) {
  const milestoneNames = [...new Set(weeks.map((w) => w.milestone))];
  return (
    <div className="timeline">
      {weeks.map((w) => (
        <div key={w.week} className={`timeline-row status-${w.status.toLowerCase().replace(/\s+/g, "-")}`}>
          <div className="timeline-week">
            <span className="timeline-week-num">W{w.week}</span>
          </div>
          <div className="timeline-dot" />
          <div className="timeline-content">
            <div className="timeline-content-head">
              <h4>{w.title}</h4>
              <StatusBadge status={w.status} />
            </div>
            <p className="timeline-date"><span>{w.dateRange}</span></p>
            <ul className="timeline-activities">
              {w.activities.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
            <div className="timeline-footer">
              <button className="timeline-milestone-link" onClick={() => onMilestoneClick && onMilestoneClick(w.milestone)}>
                {w.milestone}
              </button>
              <div className="timeline-progress">
                <div className="progress-bar sm">
                  <div className="progress-bar-fill" style={{ width: `${w.progress}%` }} />
                </div>
                <span>{w.progress}%</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
