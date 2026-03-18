interface ProgressProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning';
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function Progress({
  value,
  max = 100,
  variant = 'default',
  showLabel = false,
  size = 'md',
  className = '',
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const variantStyles = {
    default: 'progress-bar',
    success: 'progress-bar progress-bar-success',
    warning: 'progress-bar progress-bar-warning',
  };

  const sizeStyles = {
    sm: 'h-1',
    md: '',
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-mono">Progress</span>
          <span className="text-sm font-mono font-bold">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`progress ${sizeStyles[size]}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <div className={variantStyles[variant]} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}