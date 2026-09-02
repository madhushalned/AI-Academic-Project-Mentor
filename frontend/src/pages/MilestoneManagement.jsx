import { useState } from "react";
import MilestoneCard from "../components/MilestoneCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import TaskList from "../components/TaskList.jsx";
import Icon from "../components/Icon.jsx";
import { getMilestones } from "../services/api.js";

export default function MilestoneManagement() {
  const initial = getMilestones();
  const [milestones, setMilestones] = useState(initial);
  const [selected, setSelected] = useState(null);
  const [progressValue, setProgressValue] = useState(0);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [filter, setFilter] = useState("All");

  const openMilestone = (m) => {
    setSelected(m);
    setProgressValue(m.progress);
    setShowAddTask(false);
    setNewTaskTitle("");
  };

  const closeMilestone = () => setSelected(null);

  const handleSaveProgress = () => {
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === selected.id ? { ...m, progress: progressValue, status: progressValue === 100 ? "Completed" : progressValue > 0 ? "In Progress" : m.status } : m
      )
    );
    setSelected((s) => ({ ...s, progress: progressValue }));
  };

  const toggleTask = (taskId) => {
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === selected.id
          ? { ...m, tasks: m.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)) }
          : m
      )
    );
    setSelected((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)) }));
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask = { id: Date.now(), title: newTaskTitle.trim(), done: false };
    setMilestones((prev) =>
      prev.map((m) => (m.id === selected.id ? { ...m, tasks: [...m.tasks, newTask] } : m))
    );
    setSelected((s) => ({ ...s, tasks: [...s.tasks, newTask] }));
    setNewTaskTitle("");
    setShowAddTask(false);
  };

  const filtered = filter === "All" ? milestones : milestones.filter((m) => m.status === filter);

  if (selected) {
    return (
      <div className="milestone-detail">
        <button className="btn btn-ghost back-btn" onClick={closeMilestone}>
          <Icon name="arrowLeft" size={18} /> Back to Milestones
        </button>

        <div className="milestone-detail-head">
          <div>
            <h2>{selected.title}</h2>
            <p className="milestone-detail-desc">{selected.description}</p>
          </div>
          <StatusBadge status={selected.status} />
        </div>

        <div className="milestone-detail-meta">
          <div className="meta-item"><span className="meta-label">Start Date</span><span className="meta-value">{selected.startDate}</span></div>
          <div className="meta-item"><span className="meta-label">End Date</span><span className="meta-value">{selected.endDate}</span></div>
          <div className="meta-item"><span className="meta-label">Priority</span><span className={`meta-value priority priority-${selected.priority.toLowerCase()}`}>{selected.priority}</span></div>
          <div className="meta-item"><span className="meta-label">Tasks</span><span className="meta-value">{selected.tasks.filter((t) => t.done).length}/{selected.tasks.length}</span></div>
        </div>

        <div className="milestone-detail-grid">
          <section className="panel">
            <div className="panel-head"><h3>Update Progress</h3></div>
            <div className="progress-slider">
              <input
                type="range"
                min="0"
                max="100"
                value={progressValue}
                onChange={(e) => setProgressValue(Number(e.target.value))}
              />
              <div className="progress-slider-value">
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${progressValue}%` }} />
                </div>
                <span>{progressValue}%</span>
              </div>
              <button className="btn btn-primary" onClick={handleSaveProgress}>Save Progress</button>
            </div>
          </section>

          <section className="panel">
            <TaskList
              tasks={selected.tasks}
              onToggle={toggleTask}
              onAdd={() => setShowAddTask((s) => !s)}
            />
            {showAddTask && (
              <div className="add-task-form">
                <input
                  type="text"
                  placeholder="Enter task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                />
                <button className="btn btn-primary btn-sm" onClick={addTask}>Add</button>
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="milestone-management">
      <div className="filter-bar">
        {["All", "Not Started", "In Progress", "Completed", "At Risk"].map((f) => (
          <button
            key={f}
            className={`filter-chip ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="milestone-grid">
        {filtered.map((m) => (
          <MilestoneCard key={m.id} milestone={m} onView={openMilestone} />
        ))}
      </div>
      {filtered.length === 0 && <p className="panel-empty">No milestones match this filter.</p>}
    </div>
  );
}
