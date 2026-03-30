import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  static?: boolean;
  bento?: boolean;
  glass?: boolean;
  onClick?: () => void;
  as?: 'div' | 'article' | 'section';
}

export function Card({
  children,
  className = '',
  static: isStatic = false,
  bento = false,
  glass = false,
  onClick,
  as: Component = 'div',
}: CardProps) {
  let baseClass = 'card';
  if (bento) baseClass = 'card-bento';
  else if (glass) baseClass = 'card-glass';
  else if (isStatic) baseClass = 'card-static';

  return (
    <Component
      className={`${baseClass} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </Component>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`p-6 sm:p-8 border-b border-border ${className}`}>
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return <div className={`p-6 sm:p-8 ${className}`}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`p-6 sm:p-8 border-t border-border ${className}`}>
      {children}
    </div>
  );
}
