interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'accent';
  className?: string;
}

export function Avatar({
  name,
  size = 'md',
  variant = 'default',
  className = '',
}: AvatarProps) {
  const sizeStyles = {
    sm: 'avatar-sm',
    md: '',
    lg: 'avatar-lg',
  };

  const variantStyles = {
    default: '',
    accent: 'avatar-accent',
  };

  return (
    <div
      className={`avatar ${sizeStyles[size]} ${variantStyles[variant]} ${className}`.trim()}
      role="img"
      aria-label={`${name} logo`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}