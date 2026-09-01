import type {
  MilestoneStatus,
  TaskStatus,
  WeekStatus,
  Priority,
  SkillLevel,
} from '@/types';

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function daysUntil(iso: string): number {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export const milestoneStatusConfig: Record<
  MilestoneStatus,
  { label: string; dot: string; badge: string }
> = {
  not_started: {
    label: 'Not Started',
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-600',
  },
  in_progress: {
    label: 'In Progress',
    dot: 'bg-brand-500',
    badge: 'bg-brand-50 text-brand-700',
  },
  completed: {
    label: 'Completed',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700',
  },
  at_risk: {
    label: 'At Risk',
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700',
  },
};

export const weekStatusConfig: Record<
  WeekStatus,
  { label: string; dot: string; badge: string }
> = {
  upcoming: {
    label: 'Upcoming',
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-600',
  },
  in_progress: {
    label: 'In Progress',
    dot: 'bg-brand-500',
    badge: 'bg-brand-50 text-brand-700',
  },
  completed: {
    label: 'Completed',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700',
  },
  at_risk: {
    label: 'At Risk',
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700',
  },
};

export const taskStatusConfig: Record<
  TaskStatus,
  { label: string; badge: string }
> = {
  todo: { label: 'To Do', badge: 'bg-slate-100 text-slate-600' },
  in_progress: { label: 'In Progress', badge: 'bg-brand-50 text-brand-700' },
  done: { label: 'Done', badge: 'bg-emerald-50 text-emerald-700' },
  blocked: { label: 'Blocked', badge: 'bg-red-50 text-red-700' },
};

export const priorityConfig: Record<Priority, { label: string; badge: string }> = {
  low: { label: 'Low', badge: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Medium', badge: 'bg-blue-50 text-blue-700' },
  high: { label: 'High', badge: 'bg-red-50 text-red-700' },
};

export const skillLevelConfig: Record<
  SkillLevel,
  { label: string; proficiency: number; color: string }
> = {
  beginner: { label: 'Beginner', proficiency: 1, color: 'text-slate-600' },
  intermediate: { label: 'Intermediate', proficiency: 3, color: 'text-brand-600' },
  advanced: { label: 'Advanced', proficiency: 4, color: 'text-emerald-600' },
  expert: { label: 'Expert', proficiency: 5, color: 'text-purple-600' },
};

export const proficiencyLabels = ['Not Rated', 'Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'];
