import type { Milestone } from '@/types';
import {
  milestoneStatusConfig,
  priorityConfig,
  formatDate,
} from '@/lib/statusConfig';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import TaskList from './TaskList';
import { X, Calendar, Flag, Target, StickyNote } from 'lucide-react';

interface MilestoneDetailModalProps {
  milestone: Milestone | null;
  onClose: () => void;
  onAddTask?: () => void;
  onToggleTask?: (taskId: string) => void;
}

export default function MilestoneDetailModal({
  milestone,
  onClose,
  onAddTask,
  onToggleTask,
}: MilestoneDetailModalProps) {
  if (!milestone) return null;
  const status = milestoneStatusConfig[milestone.status];
  const priority = priorityConfig[milestone.priority];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">{milestone.title}</h2>
              <StatusBadge label={status.label} dot={status.dot} badge={status.badge} />
            </div>
            <p className="mt-1 text-sm text-slate-500">{milestone.description}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-500">
                <Calendar size={12} /> Start
              </p>
              <p className="text-sm text-slate-800">{formatDate(milestone.startDate)}</p>
            </div>
            <div>
              <p className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-500">
                <Calendar size={12} /> End
              </p>
              <p className="text-sm text-slate-800">{formatDate(milestone.endDate)}</p>
            </div>
            <div>
              <p className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-500">
                <Flag size={12} /> Priority
              </p>
              <StatusBadge label={priority.label} badge={priority.badge} showDot={false} />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-slate-500">Progress</p>
              <p className="text-sm font-semibold text-slate-800">{milestone.progress}%</p>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
              <span>Overall Progress</span>
              <span className="font-medium">{milestone.progress}%</span>
            </div>
            <ProgressBar
              value={milestone.progress}
              color={milestone.status === 'at_risk' ? 'amber' : milestone.status === 'completed' ? 'emerald' : 'brand'}
              size="lg"
            />
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <Target size={16} /> Objectives
            </p>
            <ul className="space-y-1.5">
              {milestone.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-500" />
                  {obj}
                </li>
              ))}
            </ul>
          </div>

          <TaskList tasks={milestone.tasks} onAddTask={onAddTask} onToggleStatus={onToggleTask} />

          {milestone.notes && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <StickyNote size={16} /> Notes
              </p>
              <p className="rounded-lg bg-amber-50/60 p-3 text-sm text-slate-600">{milestone.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
