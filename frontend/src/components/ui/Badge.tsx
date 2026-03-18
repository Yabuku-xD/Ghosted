import { type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'ghost' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'outline',
  size = 'md',
  className = '',
}: BadgeProps) {
  const variantStyles = {
    accent: 'badge-accent',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    ghost: 'badge-ghost',
    outline: 'badge-outline',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5',
    md: '',
  };

  return (
    <span
      className={`badge ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}