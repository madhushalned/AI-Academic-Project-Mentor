import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  sublabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  children?: ReactNode;
}

export default function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  iconColor = 'text-brand-600',
  iconBg = 'bg-brand-50',
  children,
}: StatCardProps) {
  return (
    <div className="card card-hover p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          {sublabel && <p className="mt-0.5 text-xs text-slate-500">{sublabel}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </div>
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
