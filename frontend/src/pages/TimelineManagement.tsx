import { useMemo, useState } from 'react';
import type { TimelineWeek, Milestone } from '@/types';
import { timelineWeeks as mockTimeline, milestones as mockMilestones, projectInfo as mockProject } from '@/data/mockData';
import PageHeader from '@/components/PageHeader';
import Timeline from '@/components/Timeline';
import StatCard from '@/components/StatCard';
import ProgressBar from '@/components/ProgressBar';
import MilestoneDetailModal from '@/components/MilestoneDetailModal';
import { formatDate, formatDateShort, weekStatusConfig } from '@/lib/statusConfig';
import { CalendarDays, Flag, Calendar, PlayCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

const filters = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'at_risk', label: 'At Risk' },
] as const;

type FilterValue = (typeof filters)[number]['value'];

export default function TimelineManagement() {
  const [weeks] = useState<TimelineWeek[]>(mockTimeline);
  const [milestones] = useState<Milestone[]>(mockMilestones);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

  const project = mockProject;

  const filtered = useMemo(() => {
    if (filter === 'all') return weeks;
    return weeks.filter((w) => w.status === filter);
  }, [weeks, filter]);

  const completedWeeks = weeks.filter((w) => w.status === 'completed').length;
  const currentWeek = weeks.find((w) => w.status === 'in_progress');
  const atRiskWeeks = weeks.filter((w) => w.status === 'at_risk').length;

  function handleMilestoneClick(milestoneId: string) {
    const m = milestones.find((x) => x.id === milestoneId);
    if (m) setSelectedMilestone(m);
  }

  return (
    <div>
      <PageHeader
        title="Timeline Management"
        description="Week-by-week execution plan showing how milestones and tasks map to your project schedule."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Project Start"
          value={formatDateShort(project.startDate)}
          sublabel={formatDate(project.startDate)}
          icon={Calendar}
        />
        <StatCard
          label="Expected Completion"
          value={formatDateShort(project.expectedCompletion)}
          sublabel={formatDate(project.expectedCompletion)}
          icon={Flag}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          label="Current Week"
          value={currentWeek ? `Week ${currentWeek.weekNumber}` : '—'}
          sublabel={currentWeek ? currentWeek.milestoneTitle : 'Not started'}
          icon={PlayCircle}
        />
        <StatCard
          label="Overall Progress"
          value={`${project.overallProgress}%`}
          sublabel={`${completedWeeks}/${weeks.length} weeks completed`}
          icon={CheckCircle2}
          iconColor="text-brand-600"
          iconBg="bg-brand-50"
        >
          <ProgressBar value={project.overallProgress} size="sm" />
        </StatCard>
      </div>

      {atRiskWeeks > 0 && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
          <AlertTriangle size={16} />
          <span>
            <strong>{atRiskWeeks}</strong> week{atRiskWeeks > 1 ? 's' : ''} at risk. Review and adjust your schedule to stay on track.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === f.value
                    ? 'bg-brand-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f.label}
                {f.value !== 'all' && (
                  <span className="ml-1.5 text-xs opacity-70">
                    {weeks.filter((w) => w.status === f.value).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <Timeline weeks={filtered} onMilestoneClick={handleMilestoneClick} />
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <div className="mb-3 flex items-center gap-2">
              <CalendarDays size={18} className="text-brand-600" />
              <h3 className="section-title">Schedule Overview</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total Weeks</span>
                <span className="font-medium text-slate-800">{weeks.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Completed</span>
                <span className="font-medium text-emerald-600">{completedWeeks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">In Progress</span>
                <span className="font-medium text-brand-600">
                  {weeks.filter((w) => w.status === 'in_progress').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Upcoming</span>
                <span className="font-medium text-slate-600">
                  {weeks.filter((w) => w.status === 'upcoming').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">At Risk</span>
                <span className="font-medium text-amber-600">{atRiskWeeks}</span>
              </div>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                <span>Timeline Progress</span>
                <span className="font-semibold">{project.overallProgress}%</span>
              </div>
              <ProgressBar value={project.overallProgress} size="lg" />
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 section-title">Status Legend</h3>
            <div className="space-y-2">
              {Object.entries(weekStatusConfig).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                  <span className="text-slate-600">{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 section-title">Milestones on Timeline</h3>
            <div className="space-y-2">
              {milestones.map((m) => {
                const weekCount = weeks.filter((w) => w.milestoneId === m.id).length;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleMilestoneClick(m.id)}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50"
                  >
                    <span className="truncate text-slate-600">{m.title}</span>
                    <span className="ml-2 shrink-0 text-xs text-slate-400">{weekCount} wk{weekCount > 1 ? 's' : ''}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <MilestoneDetailModal
        milestone={selectedMilestone}
        onClose={() => setSelectedMilestone(null)}
      />
    </div>
  );
}
