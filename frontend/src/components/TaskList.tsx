import type { Task } from '@/types';
import { taskStatusConfig, priorityConfig, formatDateShort } from '@/lib/statusConfig';
import StatusBadge from './StatusBadge';
import { Plus, Circle, Clock, CheckCircle2, Loader2, Ban } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onAddTask?: () => void;
  onToggleStatus?: (taskId: string) => void;
}

const statusIcon = {
  todo: Circle,
  in_progress: Loader2,
  done: CheckCircle2,
  blocked: Ban,
};

export default function TaskList({ tasks, onAddTask, onToggleStatus }: TaskListProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-900">Tasks</h4>
        {onAddTask && (
          <button onClick={onAddTask} className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
            <Plus size={14} /> Add Task
          </button>
        )}
      </div>
      <div className="space-y-2">
        {tasks.map((task) => {
          const cfg = taskStatusConfig[task.status];
          const pri = priorityConfig[task.priority];
          const Icon = statusIcon[task.status];
          return (
            <div
              key={task.id}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5"
            >
              <button
                onClick={() => onToggleStatus?.(task.id)}
                className="text-slate-400 hover:text-brand-600"
                aria-label="Toggle status"
              >
                <Icon size={18} className={task.status === 'in_progress' ? 'animate-spin' : ''} />
              </button>
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                  {task.name}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} />
                    {formatDateShort(task.dueDate)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <StatusBadge label={pri.label} badge={pri.badge} showDot={false} />
                <StatusBadge label={cfg.label} badge={cfg.badge} showDot={false} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
