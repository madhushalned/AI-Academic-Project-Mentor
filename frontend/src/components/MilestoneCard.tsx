import type { Milestone } from '@/types';
import { milestoneStatusConfig, priorityConfig, formatDateShort, daysUntil } from '@/lib/statusConfig';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import { Calendar, ListChecks, AlertCircle, ChevronRight } from 'lucide-react';

interface MilestoneCardProps {
  milestone: Milestone;
  onViewDetails: (m: Milestone) => void;
  onEdit?: (m: Milestone) => void;
  onUpdateProgress?: (m: Milestone) => void;
}

export default function MilestoneCard({
  milestone,
  onViewDetails,
  onEdit,
  onUpdateProgress,
}: MilestoneCardProps) {
  const status = milestoneStatusConfig[milestone.status];
  const priority = priorityConfig[milestone.priority];
  const doneTasks = milestone.tasks.filter((t) => t.status === 'done').length;
  const daysLeft = daysUntil(milestone.endDate);

  return (
    <div className="card card-hover flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-slate-900">
              {milestone.title}
            </h3>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
            {milestone.description}
          </p>
        </div>
        <StatusBadge label={status.label} dot={status.dot} badge={status.badge} />
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
          <span>Progress</span>
          <span className="font-medium text-slate-700">{milestone.progress}%</span>
        </div>
        <ProgressBar
          value={milestone.progress}
          color={milestone.status === 'at_risk' ? 'amber' : milestone.status === 'completed' ? 'emerald' : 'brand'}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <Calendar size={14} />
          {formatDateShort(milestone.startDate)} – {formatDateShort(milestone.endDate)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ListChecks size={14} />
          {doneTasks}/{milestone.tasks.length} tasks
        </span>
        <StatusBadge label={priority.label} badge={priority.badge} showDot={false} />
        {milestone.status === 'in_progress' && daysLeft >= 0 && (
          <span className="inline-flex items-center gap-1 text-amber-600">
            <AlertCircle size={14} />
            {daysLeft}d left
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
        <button
          onClick={() => onViewDetails(milestone)}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          View Details
          <ChevronRight size={16} />
        </button>
        <span className="ml-auto flex items-center gap-2">
          {onEdit && (
            <button onClick={() => onEdit(milestone)} className="btn-ghost px-2.5 py-1.5 text-xs">
              Edit
            </button>
          )}
          {onUpdateProgress && (
            <button
              onClick={() => onUpdateProgress(milestone)}
              className="btn-secondary px-2.5 py-1.5 text-xs"
            >
              Update Progress
            </button>
          )}
        </span>
      </div>
    </div>
  );
}
