import type { ReactNode } from 'react';

interface StatusBadgeProps {
  label: string;
  dot?: string;
  badge: string;
  showDot?: boolean;
  children?: ReactNode;
}

export default function StatusBadge({
  label,
  dot,
  badge,
  showDot = true,
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge}`}
    >
      {showDot && dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
      {label}
    </span>
  );
}
