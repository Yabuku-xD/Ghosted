import { type ReactNode } from 'react';
import { AlertTriangle, SearchX, Inbox } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type EmptyStateVariant = 'empty' | 'error' | 'no-results';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  variant?: EmptyStateVariant;
}

const variantStyles: Record<EmptyStateVariant, string> = {
  empty: '',
  error: 'border-l-4 border-l-danger bg-danger-light/30',
  'no-results': 'border-l-4 border-l-warning bg-warning-light/30',
};

const variantIcons: Record<EmptyStateVariant, LucideIcon> = {
  empty: Inbox,
  error: AlertTriangle,
  'no-results': SearchX,
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
  variant = 'empty',
}: EmptyStateProps) {
  const IconComponent = Icon || variantIcons[variant];

  return (
    <div className={`empty-state ${variantStyles[variant]} ${className}`}>
      <IconComponent className="empty-state-icon" aria-hidden="true" />
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}