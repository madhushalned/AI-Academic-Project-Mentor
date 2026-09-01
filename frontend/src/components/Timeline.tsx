import type { TimelineWeek } from '@/types';
import { weekStatusConfig, formatDateShort } from '@/lib/statusConfig';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import { ChevronRight, MapPin } from 'lucide-react';

interface TimelineProps {
  weeks: TimelineWeek[];
  onMilestoneClick?: (milestoneId: string) => void;
}

export default function Timeline({ weeks, onMilestoneClick }: TimelineProps) {
  return (
    <div className="relative">
      {weeks.map((week, idx) => {
        const cfg = weekStatusConfig[week.status];
        const isLast = idx === weeks.length - 1;
        return (
          <div key={week.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-4 ring-white ${
                  week.status === 'completed'
                    ? 'bg-emerald-500 text-white'
                    : week.status === 'in_progress'
                      ? 'bg-brand-500 text-white'
                      : week.status === 'at_risk'
                        ? 'bg-amber-500 text-white'
                        : 'border-2 border-slate-300 bg-white text-slate-500'
                }`}
              >
                {week.weekNumber}
              </div>
              {!isLast && (
                <div
                  className={`my-1 w-0.5 flex-1 ${
                    week.status === 'completed' ? 'bg-emerald-300' : 'bg-slate-200'
                  }`}
                  style={{ minHeight: '2rem' }}
                />
              )}
            </div>

            <div className={`card card-hover mb-4 flex-1 p-4 ${week.status === 'in_progress' ? 'ring-1 ring-brand-200' : ''}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    {formatDateShort(week.startDate)} – {formatDateShort(week.endDate)}
                  </p>
                  <h4 className="mt-0.5 text-sm font-semibold text-slate-900">Week {week.weekNumber}</h4>
                </div>
                <StatusBadge label={cfg.label} dot={cfg.dot} badge={cfg.badge} />
              </div>

              <button
                onClick={() => onMilestoneClick?.(week.milestoneId)}
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                <MapPin size={12} />
                {week.milestoneTitle}
                <ChevronRight size={12} />
              </button>

              <ul className="mt-2 space-y-1">
                {week.tasks.map((task, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                    <span className="mt-1 h-1 w-1 rounded-full bg-slate-400" />
                    {task}
                  </li>
                ))}
              </ul>

              <div className="mt-3">
                <ProgressBar
                  value={week.progress}
                  size="sm"
                  color={week.status === 'at_risk' ? 'amber' : week.status === 'completed' ? 'emerald' : 'brand'}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
