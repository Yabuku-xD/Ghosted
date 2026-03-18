interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
}: SkeletonProps) {
  const variantStyles = {
    text: 'h-4',
    circular: 'rounded-full',
    rectangular: '',
  };

  const style = {
    width: width,
    height: height,
  };

  return (
    <div
      className={`skeleton ${variantStyles[variant]} ${className}`.trim()}
      style={style}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="card-static p-6">
      <div className="flex items-start gap-4 mb-4">
        <Skeleton variant="circular" className="w-12 h-12" />
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="pt-4 border-t-2 border-border-light">
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-6 w-1/2" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-4 px-6">
          <Skeleton className="h-4" />
        </td>
      ))}
    </tr>
  );
}

export function StatBoxSkeleton() {
  return (
    <div className="stat-box">
      <Skeleton className="h-4 w-20 mb-2" />
      <Skeleton className="h-8 w-24" />
    </div>
  );
}