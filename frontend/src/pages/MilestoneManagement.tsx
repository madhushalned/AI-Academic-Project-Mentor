import { useState } from 'react';
import type { Milestone, Task, TaskStatus } from '@/types';
import { milestones as mockMilestones } from '@/data/mockData';
import { api } from '@/services/api';
import PageHeader from '@/components/PageHeader';
import MilestoneCard from '@/components/MilestoneCard';
import MilestoneDetailModal from '@/components/MilestoneDetailModal';
import StatCard from '@/components/StatCard';
import ProgressBar from '@/components/ProgressBar';
import {
  milestoneStatusConfig,
  taskStatusConfig,
  priorityConfig,
} from '@/lib/statusConfig';
import {
  Target,
  CheckCircle2,
  PlayCircle,
  AlertTriangle,
  Plus,
  X,
} from 'lucide-react';

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'not_started', label: 'Not Started' },
  { value: 'at_risk', label: 'At Risk' },
] as const;

type FilterValue = (typeof statusFilters)[number]['value'];

const taskStatusCycle: TaskStatus[] = ['todo', 'in_progress', 'done'];

export default function MilestoneManagement() {
  const [milestones, setMilestones] = useState<Milestone[]>(mockMilestones);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [selected, setSelected] = useState<Milestone | null>(null);
  const [progressModal, setProgressModal] = useState<Milestone | null>(null);
  const [progressValue, setProgressValue] = useState(0);
  const [addTaskFor, setAddTaskFor] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState('');

  const filtered = filter === 'all'
    ? milestones
    : milestones.filter((m) => m.status === filter);

  const completedCount = milestones.filter((m) => m.status === 'completed').length;
  const activeMilestone = milestones.find((m) => m.status === 'in_progress');
  const upcomingMilestone = milestones.find((m) => m.status === 'not_started');
  const atRiskCount = milestones.filter((m) => m.status === 'at_risk').length;
  const avgProgress = Math.round(
    milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length,
  );

  function openDetails(m: Milestone) {
    setSelected(m);
  }

  function openUpdateProgress(m: Milestone) {
    setProgressModal(m);
    setProgressValue(m.progress);
  }

  function saveProgress() {
    if (!progressModal) return;
    const status: Milestone['status'] =
      progressValue >= 100 ? 'completed' : progressValue > 0 ? 'in_progress' : 'not_started';
    const updated = { ...progressModal, progress: progressValue, status };
    setMilestones((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setSelected((prev) => (prev && prev.id === updated.id ? updated : prev));
    api.updateMilestone(updated.id, { progress: progressValue, status });
    setProgressModal(null);
  }

  function toggleTaskStatus(milestoneId: string, taskId: string) {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== milestoneId) return m;
        const tasks = m.tasks.map((t) => {
          if (t.id !== taskId) return t;
          const idx = taskStatusCycle.indexOf(t.status);
          return { ...t, status: taskStatusCycle[(idx + 1) % taskStatusCycle.length] };
        });
        const doneCount = tasks.filter((t) => t.status === 'done').length;
        const progress = Math.round((doneCount / tasks.length) * 100);
        const status: Milestone['status'] =
          progress >= 100 ? 'completed' : progress > 0 ? 'in_progress' : m.status === 'at_risk' ? 'at_risk' : 'not_started';
        return { ...m, tasks, progress, status };
      }),
    );
    setSelected((prev) => {
      if (!prev || prev.id !== milestoneId) return prev;
      const m = milestones.find((x) => x.id === milestoneId);
      return m ? { ...m } : prev;
    });
  }

  function addTask(milestoneId: string) {
    if (!newTaskName.trim()) return;
    const newTask: Task = {
      id: `t-${Date.now()}`,
      name: newTaskName.trim(),
      status: 'todo',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      priority: 'medium',
    };
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === milestoneId ? { ...m, tasks: [...m.tasks, newTask] } : m,
      ),
    );
    setNewTaskName('');
    setAddTaskFor(null);
  }

  return (
    <div>
      <PageHeader
        title="Milestone Management"
        description="Track and manage all milestones for your academic project."
        actions={
          <button className="btn-primary">
            <Plus size={16} /> Add Milestone
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Overall Progress"
          value={`${avgProgress}%`}
          icon={Target}
        >
          <ProgressBar value={avgProgress} size="sm" />
        </StatCard>
        <StatCard
          label="Completed"
          value={completedCount}
          sublabel={`of ${milestones.length} milestones`}
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          label="Active Milestone"
          value={activeMilestone ? activeMilestone.title : '—'}
          sublabel={activeMilestone ? `${activeMilestone.progress}% done` : undefined}
          icon={PlayCircle}
        />
        <StatCard
          label="At Risk"
          value={atRiskCount}
          sublabel="needs attention"
          icon={AlertTriangle}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-brand-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
            {f.value !== 'all' && (
              <span className="ml-1.5 text-xs opacity-70">
                {milestones.filter((m) => m.status === f.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {upcomingMilestone && filter !== 'completed' && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600">
          <Target size={16} className="text-brand-500" />
          <span>
            Next up: <strong className="text-slate-800">{upcomingMilestone.title}</strong>
            {' — '}starts {new Date(upcomingMilestone.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((m) => (
          <MilestoneCard
            key={m.id}
            milestone={m}
            onViewDetails={openDetails}
            onEdit={openUpdateProgress}
            onUpdateProgress={openUpdateProgress}
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full card p-10 text-center text-slate-400">
            No milestones match this filter.
          </div>
        )}
      </div>

      <MilestoneDetailModal
        milestone={selected}
        onClose={() => setSelected(null)}
        onAddTask={() => selected && setAddTaskFor(selected.id)}
        onToggleTask={(taskId) => selected && toggleTaskStatus(selected.id, taskId)}
      />

      {addTaskFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setAddTaskFor(null)} />
          <div className="relative w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">Add Task</h3>
              <button onClick={() => setAddTaskFor(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <label className="label">Task Name</label>
            <input
              className="input"
              placeholder="e.g. Write unit tests for API"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask(addTaskFor)}
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setAddTaskFor(null)} className="btn-secondary">Cancel</button>
              <button onClick={() => addTask(addTaskFor)} className="btn-primary">Add Task</button>
            </div>
          </div>
        </div>
      )}

      {progressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setProgressModal(null)} />
          <div className="relative w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">Update Progress</h3>
              <button onClick={() => setProgressModal(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <p className="mb-3 text-sm text-slate-500">{progressModal.title}</p>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-600">Progress</span>
              <span className="font-bold text-brand-600">{progressValue}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={progressValue}
              onChange={(e) => setProgressValue(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
            <div className="mt-2">
              <ProgressBar value={progressValue} size="lg" />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setProgressModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={saveProgress} className="btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
