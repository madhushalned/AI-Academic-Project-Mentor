interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'brand' | 'emerald' | 'amber' | 'slate';
  showLabel?: boolean;
  label?: string;
}

const sizeMap = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-2.5',
};

const colorMap = {
  brand: 'bg-brand-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  slate: 'bg-slate-400',
};

export default function ProgressBar({
  value,
  max = 100,
  size = 'md',
  color = 'brand',
  showLabel = false,
  label,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
          <span>{label}</span>
          <span className="font-medium text-slate-700">{Math.round(pct)}%</span>
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-slate-200 ${sizeMap[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorMap[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
