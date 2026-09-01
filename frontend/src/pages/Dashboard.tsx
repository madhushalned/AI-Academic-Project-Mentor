import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ProjectInfo, Milestone, TimelineWeek } from '@/types';
import { api } from '@/services/api';
import {
  projectInfo as mockProject,
  milestones as mockMilestones,
  timelineWeeks as mockTimeline,
  initialSkillAssessment,
} from '@/data/mockData';
import StatCard from '@/components/StatCard';
import ProgressBar from '@/components/ProgressBar';
import StatusBadge from '@/components/StatusBadge';
import PageHeader from '@/components/PageHeader';
import {
  milestoneStatusConfig,
  weekStatusConfig,
  formatDate,
  daysUntil,
  formatDateShort,
} from '@/lib/statusConfig';
import {
  Target,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ClipboardCheck,
  CalendarRange,
  ArrowRight,
  ListChecks,
} from 'lucide-react';

export default function Dashboard() {
  const [project] = useState<ProjectInfo>(mockProject);
  const [milestones] = useState<Milestone[]>(mockMilestones);
  const [timeline] = useState<TimelineWeek[]>(mockTimeline);

  useEffect(() => {
    api.getProject();
    api.getMilestones();
    api.getTimeline();
  }, []);

  const completed = milestones.filter((m) => m.status === 'completed').length;
  const active = milestones.find((m) => m.status === 'in_progress');
  const upcoming = milestones.find((m) => m.status === 'not_started');
  const atRisk = milestones.filter((m) => m.status === 'at_risk').length;
  const pendingTasks = milestones
    .flatMap((m) => m.tasks)
    .filter((t) => t.status !== 'done').length;
  const completedWeeks = timeline.filter((w) => w.status === 'completed').length;
  const assessmentCompletion = initialSkillAssessment.completion;

  const nextDeadline =
    active?.endDate || upcoming?.endDate || project.expectedCompletion;
  const nextDeadlineLabel = active ? active.title : upcoming?.title || 'Final Submission';

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your academic project progress and key milestones."
      />

      <div className="card mb-6 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-brand-600">Active Project</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">{project.name}</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">{project.description}</p>
          </div>
          <div className="shrink-0">
            <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
              <span>Overall Progress</span>
              <span className="font-semibold text-slate-800">{project.overallProgress}%</span>
            </div>
            <div className="w-full sm:w-40">
              <ProgressBar value={project.overallProgress} size="lg" />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              Week {project.currentWeek} of {project.totalWeeks}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Completed Milestones"
          value={`${completed}/${milestones.length}`}
          sublabel="milestones done"
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          label="Active Milestone"
          value={active ? active.title : '—'}
          sublabel={active ? `${active.progress}% complete` : undefined}
          icon={Target}
        >
          {active && <ProgressBar value={active.progress} size="sm" />}
        </StatCard>
        <StatCard
          label="Upcoming Deadline"
          value={formatDateShort(nextDeadline)}
          sublabel={nextDeadlineLabel}
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        >
          <p className="text-xs font-medium text-amber-600">
            {daysUntil(nextDeadline)} days remaining
          </p>
        </StatCard>
        <StatCard
          label="Pending Tasks"
          value={pendingTasks}
          sublabel="across all milestones"
          icon={ListChecks}
          iconColor="text-slate-600"
          iconBg="bg-slate-100"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="At-Risk Milestones"
          value={atRisk}
          sublabel="needs attention"
          icon={AlertTriangle}
          iconColor="text-red-600"
          iconBg="bg-red-50"
        />
        <StatCard
          label="Skill Assessment"
          value={`${assessmentCompletion}%`}
          sublabel="assessment completed"
          icon={ClipboardCheck}
        >
          <ProgressBar value={assessmentCompletion} size="sm" color={assessmentCompletion >= 100 ? 'emerald' : 'brand'} />
        </StatCard>
        <StatCard
          label="Completed Weeks"
          value={`${completedWeeks}/${timeline.length}`}
          sublabel="timeline weeks done"
          icon={CalendarRange}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          label="Project Duration"
          value={`${project.totalWeeks} wks`}
          sublabel={`${formatDateShort(project.startDate)} – ${formatDateShort(project.expectedCompletion)}`}
          icon={CalendarRange}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="section-title">Milestone Progress</h3>
            <Link to="/milestones" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {milestones.slice(0, 5).map((m) => {
              const cfg = milestoneStatusConfig[m.status];
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-40 shrink-0">
                    <p className="truncate text-sm font-medium text-slate-700">{m.title}</p>
                  </div>
                  <div className="flex-1">
                    <ProgressBar
                      value={m.progress}
                      size="sm"
                      color={m.status === 'at_risk' ? 'amber' : m.status === 'completed' ? 'emerald' : 'brand'}
                    />
                  </div>
                  <div className="w-16 shrink-0 text-right">
                    <span className="text-xs font-medium text-slate-600">{m.progress}%</span>
                  </div>
                  <div className="hidden w-28 shrink-0 sm:block">
                    <StatusBadge label={cfg.label} dot={cfg.dot} badge={cfg.badge} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="section-title">Timeline Summary</h3>
            <Link to="/timeline" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
              View <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {timeline.slice(0, 6).map((w) => {
              const cfg = weekStatusConfig[w.status];
              return (
                <div key={w.id} className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-xs font-semibold text-slate-600">
                      {w.weekNumber}
                    </span>
                    <span className="truncate text-slate-600">{w.milestoneTitle}</span>
                  </div>
                  <StatusBadge label={cfg.label} dot={cfg.dot} badge={cfg.badge} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
