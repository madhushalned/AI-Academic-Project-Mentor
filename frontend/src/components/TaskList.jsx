import Icon from "./Icon.jsx";

export default function TaskList({ tasks, onAdd, onToggle }) {
  return (
    <div className="task-list">
      <div className="task-list-head">
        <h3>Tasks</h3>
        {onAdd && (
          <button className="btn btn-primary btn-sm" onClick={onAdd}>
            <Icon name="plus" size={16} /> Add Task
          </button>
        )}
      </div>
      <ul className="task-list-items">
        {tasks.map((t) => (
          <li key={t.id} className={`task-item ${t.done ? "done" : ""}`}>
            <button className="task-check" onClick={() => onToggle && onToggle(t.id)} aria-label="Toggle task">
              {t.done && <Icon name="check" size={14} />}
            </button>
            <span className="task-title">{t.title}</span>
          </li>
        ))}
        {tasks.length === 0 && <p className="task-empty">No tasks yet.</p>}
      </ul>
    </div>
  );
}
