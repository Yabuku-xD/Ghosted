# Comprehensive UI Redesign Architecture
## Ghosted - Visa-Aware Job Intelligence Platform

> **Version 2.0** | A fresh, creative, and impeccable redesign building on the existing premium foundation

---

## Executive Summary

This document outlines a comprehensive UI redesign strategy that elevates the current "Premium Editorial" design system to a more refined, accessible, and visually striking experience. The redesign focuses on:

1. **Modern Visual Language** - Refined color system with sophisticated gradients and depth
2. **Enhanced Motion Design** - Purposeful micro-interactions with spring physics
3. **Improved Information Architecture** - Dashboard-style layouts for data-heavy pages
4. **Accessibility-First Approach** - WCAG 2.1 AA compliance throughout
5. **Performance Optimization** - 60fps animations with proper memoization

---

## 1. Current State Analysis

### 1.1 Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | React | 19.2.4 |
| Language | TypeScript | ~5.9.3 |
| Styling | Tailwind CSS | 3.4.19 |
| Build | Vite | 8.0.0 |
| State | TanStack Query | 5.90.21 |
| Routing | React Router | 7.13.1 |
| Forms | React Hook Form | 7.71.2 |
| Icons | Lucide React | 0.577.0 |
| Validation | Zod | 4.3.6 |
| HTTP | Axios | 1.13.6 |

### 1.2 Current Design System

**Color Palette:**
- Primary Accent: Emerald (#059669) - professional, desaturated
- Backgrounds: Warm Zinc scale (#fafafa → #e4e4e7)
- Text: Zinc scale (#18181b → #a1a1aa)
- Semantic: Success (Emerald), Warning (Amber), Danger (Red), Info (Blue)

**Typography:**
- Primary Font: Inter (Google Fonts)
- Display: Semibold, tight tracking
- Body: Regular, relaxed leading

**Component Patterns:**
- Cards: Large border-radius (2.5rem), subtle shadows
- Buttons: Pill-style with hover elevation
- Badges: Rounded-full with semantic colors
- Inputs: Rounded-xl with focus rings

### 1.3 Identified Pain Points

1. **Visual Hierarchy** - Some pages have flat information density
2. **Motion** - Limited micro-interactions and transitions
3. **Data Visualization** - Stats could be more visually engaging
4. **Mobile Experience** - Some layouts need mobile-first refinement
5. **Loading States** - Skeleton components could be more polished

---

## 2. Design System 2.0

### 2.1 Enhanced Color System

```css
:root {
  /* === PRIMARY ACCENT - Refined Emerald === */
  --accent-50: #ecfdf5;
  --accent-100: #d1fae5;
  --accent-200: #a7f3d0;
  --accent-300: #6ee7b7;
  --accent-400: #34d399;
  --accent-500: #10b981;  /* Primary */
  --accent-600: #059669;  /* Hover */
  --accent-700: #047857;  /* Active */
  --accent-800: #065f46;
  --accent-900: #064e3b;

  /* === SURFACE LAYERS - Warm Neutrals === */
  --surface-0: #ffffff;      /* Base - pure white */
  --surface-1: #fafafa;      /* Elevated - subtle lift */
  --surface-2: #f4f4f5;      /* Card background */
  --surface-3: #e4e4e7;      /* Inset/pressed */
  --surface-4: #d4d4d8;      /* Muted elements */
  --surface-inverted: #09090b;  /* Dark mode base */

  /* === TEXT HIERARCHY === */
  --text-primary: #09090b;    /* Headlines */
  --text-secondary: #52525b;  /* Body text */
  --text-tertiary: #71717a;   /* Secondary labels */
  --text-muted: #a1a1aa;      /* Disabled, placeholders */
  --text-accent: #059669;     /* Accent text */

  /* === SEMANTIC COLORS === */
  --success-500: #10b981;
  --success-bg: rgba(16, 185, 129, 0.08);
  --warning-500: #f59e0b;
  --warning-bg: rgba(245, 158, 11, 0.08);
  --danger-500: #ef4444;
  --danger-bg: rgba(239, 68, 68, 0.08);
  --info-500: #3b82f6;
  --info-bg: rgba(59, 130, 246, 0.08);

  /* === BORDER SYSTEM === */
  --border-default: #e4e4e7;
  --border-subtle: #f4f4f5;
  --border-strong: #d4d4d8;
  --border-accent: rgba(5, 150, 105, 0.3);

  /* === SHADOW SYSTEM - Premium Diffusion === */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.08);
  --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.10);
  --shadow-2xl: 0 24px 64px rgba(0, 0, 0, 0.12);
  --shadow-inner: inset 0 2px 4px rgba(0, 0, 0, 0.04);
  --shadow-glow: 0 0 0 3px rgba(5, 150, 105, 0.15);
  --shadow-glow-lg: 0 0 0 6px rgba(5, 150, 105, 0.10);

  /* === MOTION - Spring Physics === */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --duration-instant: 100ms;
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  --duration-slower: 600ms;
}

/* Dark Mode Support (Future) */
@media (prefers-color-scheme: dark) {
  :root {
    --surface-0: #09090b;
    --surface-1: #18181b;
    --surface-2: #27272a;
    --surface-3: #3f3f46;
    --surface-4: #52525b;
    --text-primary: #fafafa;
    --text-secondary: #a1a1aa;
    --text-tertiary: #71717a;
    --text-muted: #52525b;
    --border-default: #27272a;
    --border-subtle: #18181b;
    --border-strong: #3f3f46;
  }
}
```

### 2.2 Typography System

```css
/* === FONT STACK === */
--font-display: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
--font-body: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', Monaco, 'Cascadia Code', monospace;

/* === TYPE SCALE (Fluid Typography) === */
--text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem);    /* 12-13px */
--text-sm: clamp(0.875rem, 0.825rem + 0.25vw, 0.9375rem); /* 14-15px */
--text-base: clamp(1rem, 0.95rem + 0.25vw, 1.0625rem);    /* 16-17px */
--text-lg: clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem);   /* 18-20px */
--text-xl: clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem);       /* 20-24px */
--text-2xl: clamp(1.5rem, 1.35rem + 0.75vw, 1.875rem);    /* 24-30px */
--text-3xl: clamp(1.875rem, 1.65rem + 1.125vw, 2.25rem);  /* 30-36px */
--text-4xl: clamp(2.25rem, 1.9rem + 1.75vw, 3rem);        /* 36-48px */
--text-5xl: clamp(3rem, 2.5rem + 2.5vw, 4rem);            /* 48-64px */
--text-6xl: clamp(3.75rem, 3rem + 3.75vw, 5rem);          /* 60-80px */

/* === LETTER SPACING === */
--tracking-tighter: -0.04em;
--tracking-tight: -0.02em;
--tracking-normal: 0;
--tracking-wide: 0.02em;
--tracking-wider: 0.05em;
--tracking-widest: 0.1em;

/* === LINE HEIGHT === */
--leading-none: 1;
--leading-tight: 1.15;
--leading-snug: 1.35;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### 2.3 Spacing System

```css
/* === SPACE SCALE === */
--space-0: 0;
--space-px: 1px;
--space-0.5: 0.125rem;  /* 2px */
--space-1: 0.25rem;     /* 4px */
--space-1.5: 0.375rem;  /* 6px */
--space-2: 0.5rem;      /* 8px */
--space-2.5: 0.625rem;  /* 10px */
--space-3: 0.75rem;     /* 12px */
--space-3.5: 0.875rem;  /* 14px */
--space-4: 1rem;        /* 16px */
--space-5: 1.25rem;     /* 20px */
--space-6: 1.5rem;      /* 24px */
--space-7: 1.75rem;     /* 28px */
--space-8: 2rem;        /* 32px */
--space-9: 2.25rem;     /* 36px */
--space-10: 2.5rem;     /* 40px */
--space-12: 3rem;       /* 48px */
--space-14: 3.5rem;     /* 56px */
--space-16: 4rem;       /* 64px */
--space-20: 5rem;       /* 80px */
--space-24: 6rem;       /* 96px */
--space-28: 7rem;       /* 112px */
--space-32: 8rem;       /* 128px */

/* === CONTAINER WIDTHS === */
--container-xs: 20rem;   /* 320px */
--container-sm: 24rem;    /* 384px */
--container-md: 28rem;    /* 448px */
--container-lg: 32rem;    /* 512px */
--container-xl: 36rem;    /* 576px */
--container-2xl: 42rem;   /* 672px */
--container-3xl: 48rem;   /* 768px */
--container-4xl: 56rem;   /* 896px */
--container-5xl: 64rem;   /* 1024px */
--container-6xl: 72rem;   /* 1152px */
--container-7xl: 80rem;   /* 1280px */
--container-full: 100%;
```

### 2.4 Border Radius System

```css
/* === RADIUS SCALE === */
--radius-none: 0;
--radius-sm: 0.25rem;    /* 4px - subtle */
--radius-md: 0.5rem;     /* 8px - buttons, inputs */
--radius-lg: 0.75rem;    /* 12px - cards */
--radius-xl: 1rem;        /* 16px - large cards */
--radius-2xl: 1.5rem;     /* 24px - hero cards */
--radius-3xl: 2rem;       /* 32px - containers */
--radius-full: 9999px;    /* Pills, avatars */
```

---

## 3. Component Hierarchy

### 3.1 Atomic Components

```
src/components/ui/
├── primitives/
│   ├── Box.tsx              # Layout primitive
│   ├── Flex.tsx             # Flex container
│   ├── Grid.tsx             # Grid container
│   ├── Text.tsx             # Typography primitive
│   ├── Icon.tsx             # Icon wrapper
│   └── VisuallyHidden.tsx   # Screen reader only
├── Button/
│   ├── Button.tsx           # Main button component
│   ├── ButtonGroup.tsx      # Button group
│   ├── IconButton.tsx       # Icon-only button
│   └── Button.styles.ts     # Button variants
├── Input/
│   ├── Input.tsx            # Text input
│   ├── Textarea.tsx         # Textarea
│   ├── Select.tsx           # Select dropdown
│   ├── Checkbox.tsx         # Checkbox
│   ├── Radio.tsx            # Radio button
│   ├── Switch.tsx           # Toggle switch
│   └── Input.styles.ts      # Input variants
├── Card/
│   ├── Card.tsx             # Base card
│   ├── CardHeader.tsx       # Card header
│   ├── CardBody.tsx         # Card body
│   ├── CardFooter.tsx       # Card footer
│   ├── CardMedia.tsx        # Card media
│   └── Card.styles.ts       # Card variants
├── Badge/
│   ├── Badge.tsx            # Status badge
│   ├── Tag.tsx              # Interactive tag
│   └── Badge.styles.ts      # Badge variants
├── Progress/
│   ├── Progress.tsx         # Linear progress
│   ├── CircularProgress.tsx # Circular progress
│   └── Progress.styles.ts    # Progress variants
├── Feedback/
│   ├── Alert.tsx            # Alert notification
│   ├── Toast.tsx            # Toast notification
│   ├── Spinner.tsx          # Loading spinner
│   ├── Skeleton.tsx         # Skeleton loader
│   └── Feedback.styles.ts    # Feedback variants
├── Navigation/
│   ├── Tabs.tsx             # Tab navigation
│   ├── Breadcrumb.tsx       # Breadcrumb
│   ├── Pagination.tsx       # Pagination
│   └── Navigation.styles.ts  # Navigation variants
├── Overlay/
│   ├── Modal.tsx            # Modal dialog
│   ├── Drawer.tsx           # Side drawer
│   ├── Tooltip.tsx          # Tooltip
│   ├── Popover.tsx          # Popover
│   └── Overlay.styles.ts     # Overlay variants
├── DataDisplay/
│   ├── Avatar.tsx           # User avatar
│   ├── Table.tsx            # Data table
│   ├── Stat.tsx             # Statistic display
│   ├── CompanyLogo.tsx      # Company logo
│   └── DataDisplay.styles.ts # Data display variants
└── index.ts                 # Barrel export
```

### 3.2 Composite Components

```
src/components/
├── layout/
│   ├── Layout.tsx           # Main layout wrapper
│   ├── Header.tsx           # Site header
│   ├── Footer.tsx           # Site footer
│   ├── Sidebar.tsx          # Sidebar navigation
│   ├── PageHeader.tsx       # Page header
│   └── Section.tsx          # Section wrapper
├── forms/
│   ├── Form.tsx             # Form wrapper
│   ├── FormField.tsx        # Form field group
│   ├── FormLabel.tsx        # Form label
│   ├── FormError.tsx        # Form error
│   └── FormActions.tsx      # Form actions
├── data/
│   ├── CompanyCard.tsx      # Company card
│   ├── JobCard.tsx          # Job posting card
│   ├── OfferCard.tsx        # Salary offer card
│   ├── StatCard.tsx         # Statistic card
│   ├── ScoreCard.tsx        # Score display card
│   └── ComparisonCard.tsx   # Comparison card
├── charts/
│   ├── BarChart.tsx         # Bar chart
│   ├── LineChart.tsx        # Line chart
│   ├── DonutChart.tsx       # Donut chart
│   └── Sparkline.tsx        # Sparkline chart
├── motion/
│   ├── AnimatedNumber.tsx   # Number counter
│   ├── FadeIn.tsx           # Fade in animation
│   ├── SlideIn.tsx          # Slide in animation
│   ├── Stagger.tsx          # Staggered animation
│   └── PageTransition.tsx   # Page transition
└── seo/
    ├── SEO.tsx              # SEO component
    └── SkipLink.tsx         # Skip to content
```

### 3.3 Page Components

```
src/pages/
├── Home.tsx                 # Landing page
├── Companies.tsx            # Company listing
├── CompanyDetail.tsx        # Company detail
├── Jobs.tsx                 # Job listing
├── Offers.tsx               # Salary offers
├── Compare.tsx              # Company comparison
├── Predictions.tsx          # Salary predictions
├── LotteryCalculator.tsx    # Lottery calculator
├── Privacy.tsx              # Privacy policy
├── Terms.tsx                # Terms of service
└── NotFound.tsx             # 404 page
```

---

## 4. Component Specifications

### 4.1 Button Component

```tsx
// src/components/ui/Button/Button.tsx

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium tracking-wide
      transition-all duration-[var(--duration-fast)]
      ease-[var(--ease-out)]
      cursor-pointer
      disabled:opacity-50 disabled:cursor-not-allowed
      focus-visible:outline-none focus-visible:ring-2 
      focus-visible:ring-offset-2 focus-visible:ring-accent-500
      active:scale-[0.98]
    `;

    const variantStyles = {
      primary: `
        bg-accent-600 text-white
        shadow-md hover:shadow-lg
        hover:bg-accent-700
        active:bg-accent-800
      `,
      secondary: `
        bg-white text-text-primary
        border-2 border-border-default
        shadow-sm hover:shadow-md
        hover:bg-surface-1 hover:border-border-strong
        active:bg-surface-2
      `,
      ghost: `
        bg-transparent text-text-secondary
        hover:bg-surface-1 hover:text-text-primary
        active:bg-surface-2
      `,
      danger: `
        bg-danger-500 text-white
        shadow-md hover:shadow-lg
        hover:bg-red-600
        active:bg-red-700
      `,
      success: `
        bg-success-500 text-white
        shadow-md hover:shadow-lg
        hover:bg-emerald-600
        active:bg-emerald-700
      `,
      outline: `
        bg-transparent text-accent-600
        border-2 border-accent-600
        hover:bg-accent-50
        active:bg-accent-100
      `,
    };

    const sizeStyles = {
      xs: 'px-2.5 py-1 text-xs rounded-md',
      sm: 'px-3 py-1.5 text-sm rounded-lg',
      md: 'px-4 py-2 text-sm rounded-xl',
      lg: 'px-5 py-2.5 text-base rounded-xl',
      xl: 'px-6 py-3 text-lg rounded-2xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `.trim()}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!loading && leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
```

### 4.2 Card Component

```tsx
// src/components/ui/Card/Card.tsx

import { type ReactNode, forwardRef } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'bento';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  interactive?: boolean;
  as?: 'div' | 'article' | 'section';
  onClick?: () => void;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className = '',
      variant = 'default',
      padding = 'md',
      hover = false,
      interactive = false,
      as: Component = 'div',
      onClick,
    },
    ref
  ) => {
    const baseStyles = `
      rounded-2xl
      transition-all duration-[var(--duration-normal)]
      ease-[var(--ease-out)]
    `;

    const variantStyles = {
      default: `
        bg-white
        border border-border-default
        shadow-sm
      `,
      elevated: `
        bg-white
        shadow-md
        hover:shadow-lg
      `,
      outlined: `
        bg-white
        border-2 border-border-default
        hover:border-border-strong
      `,
      glass: `
        bg-white/80 backdrop-blur-xl
        border border-white/20
        shadow-md
      `,
      bento: `
        bg-surface-1
        border border-border-subtle
        hover:bg-white hover:shadow-md
      `,
    };

    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const hoverStyles = hover
      ? 'hover:-translate-y-1 hover:shadow-lg'
      : '';

    const interactiveStyles = interactive
      ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2'
      : '';

    return (
      <Component
        ref={ref}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${paddingStyles[padding]}
          ${hoverStyles}
          ${interactiveStyles}
          ${className}
        `.trim()}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

// Subcomponents
export const CardHeader = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`p-6 border-b border-border-subtle ${className}`}>{children}</div>
);

export const CardBody = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`p-6 border-t border-border-subtle ${className}`}>{children}</div>
);
```

### 4.3 Input Component

```tsx
// src/components/ui/Input/Input.tsx

import { forwardRef, type InputHTMLAttributes, useId } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      label,
      error,
      success,
      helperText,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-primary mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-4 py-3
              bg-white text-text-primary
              border-2 border-border-default
              rounded-xl
              text-base
              transition-all duration-[var(--duration-fast)]
              placeholder:text-text-muted
              focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10
              disabled:bg-surface-1 disabled:cursor-not-allowed disabled:text-text-muted
              ${leftIcon ? 'pl-11' : ''}
              ${rightIcon ? 'pr-11' : ''}
              ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/10' : ''}
              ${success ? 'border-success-500 focus:border-success-500 focus:ring-success-500/10' : ''}
              ${className}
            `.trim()}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <div id={errorId} className="flex items-center gap-2 mt-2 text-sm text-danger-500">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && !error && (
          <div className="flex items-center gap-2 mt-2 text-sm text-success-500">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}
        {helperText && !error && !success && (
          <p id={helperId} className="mt-2 text-sm text-text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
```

### 4.4 Badge Component

```tsx
// src/components/ui/Badge/Badge.tsx

import { type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export function Badge({
  children,
  variant = 'outline',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  className = '',
}: BadgeProps) {
  const baseStyles = `
    inline-flex items-center gap-1.5
    font-medium tracking-wide
    rounded-full
    transition-all duration-[var(--duration-fast)]
  `;

  const variantStyles = {
    accent: 'bg-accent-100 text-accent-700',
    success: 'bg-success-50 text-success-700',
    warning: 'bg-warning-50 text-warning-700',
    danger: 'bg-danger-50 text-danger-700',
    info: 'bg-info-50 text-info-700',
    ghost: 'bg-surface-2 text-text-muted',
    outline: 'bg-white text-text-secondary border-2 border-border-default',
  };

  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `.trim()}
    >
      {dot && (
        <span
          className={`
            w-1.5 h-1.5 rounded-full
            ${variant === 'accent' ? 'bg-accent-500' : ''}
            ${variant === 'success' ? 'bg-success-500' : ''}
            ${variant === 'warning' ? 'bg-warning-500' : ''}
            ${variant === 'danger' ? 'bg-danger-500' : ''}
            ${variant === 'info' ? 'bg-info-500' : ''}
            ${variant === 'ghost' ? 'bg-text-muted' : ''}
            ${variant === 'outline' ? 'bg-text-secondary' : ''}
          `}
        />
      )}
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-1 hover:text-text-primary transition-colors"
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </span>
  );
}
```

### 4.5 Progress Component

```tsx
// src/components/ui/Progress/Progress.tsx

interface ProgressProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

export function Progress({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  animated = false,
  className = '',
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const baseStyles = `
    w-full overflow-hidden rounded-full
    bg-surface-2
  `;

  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const barStyles = `
    h-full rounded-full
    transition-all duration-[var(--duration-slow)]
    ease-[var(--ease-out)]
  `;

  const variantStyles = {
    default: 'bg-gradient-to-r from-accent-500 to-accent-600',
    success: 'bg-gradient-to-r from-success-500 to-success-600',
    warning: 'bg-gradient-to-r from-warning-500 to-warning-600',
    danger: 'bg-gradient-to-r from-danger-500 to-danger-600',
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-text-secondary">Progress</span>
          <span className="text-sm font-bold text-text-primary">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={`${baseStyles} ${sizeStyles[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={`${barStyles} ${variantStyles[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Circular Progress
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showValue?: boolean;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showValue = false,
  className = '',
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const sizeStyles = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const variantStyles = {
    default: 'stroke-accent-500',
    success: 'stroke-success-500',
    warning: 'stroke-warning-500',
    danger: 'stroke-danger-500',
  };

  return (
    <div className={`relative ${sizeStyles[size]} ${className}`}>
      <svg
        className="w-full h-full transform -rotate-90"
        viewBox="0 0 100 100"
      >
        <circle
          className="stroke-surface-3 fill-none"
          cx="50"
          cy="50"
          r="45"
          strokeWidth="8"
        />
        <circle
          className={`${variantStyles[variant]} fill-none transition-all duration-[var(--duration-slow)]`}
          cx="50"
          cy="50"
          r="45"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-text-primary">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}
```

---

## 5. Page Redesign Specifications

### 5.1 Homepage Redesign

**Key Improvements:**
1. Asymmetric hero layout with featured sponsors panel
2. Animated stat counters with perpetual pulse
3. Bento grid feature cards with hover reveal
4. Staggered entrance animations
5. Enhanced data source attribution

**Component Structure:**

```tsx
// src/pages/Home.tsx (Redesigned)

function Home() {
  return (
    <div className="min-h-[100dvh] bg-surface-0">
      {/* Hero Section - Asymmetric Split */}
      <HeroSection />
      
      {/* Features Section - Bento Grid */}
      <FeaturesSection />
      
      {/* Hiring Signals Section */}
      <HiringSection />
      
      {/* CTA Section */}
      <CTASection />
      
      {/* Data Sources Footer */}
      <DataSourcesSection />
    </div>
  );
}

// Hero with animated stats
function HeroSection() {
  const { data: insights } = useQuery({
    queryKey: ['company-insights'],
    queryFn: () => companiesApi.getInsights(),
  });

  return (
    <section className="min-h-[90dvh] flex items-center relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface-0 via-surface-1 to-surface-0" />
      
      <div className="container relative z-10">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-20 items-center">
          {/* Left - Content */}
          <div className="space-y-8">
            <div className="section-marker">
              <span>Job Intelligence for International Talent</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              Know your worth.
              <br />
              <span className="text-accent-600">With better evidence.</span>
            </h1>
            
            <p className="text-lg text-text-secondary max-w-xl leading-relaxed">
              Explore sponsor history, salary records, and confidence signals in one place.
              Make informed career decisions with real data.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/companies" className="btn btn-primary btn-lg">
                Explore Companies
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/jobs" className="btn btn-secondary btn-lg">
                Browse Jobs
              </Link>
            </div>
            
            {/* Animated Stats */}
            <StatsGrid insights={insights} />
          </div>
          
          {/* Right - Featured Panel */}
          <FeaturedSponsorsPanel />
        </div>
      </div>
    </section>
  );
}

// Stats with animated counters
function StatsGrid({ insights }: { insights?: CompanyInsights }) {
  const stats = [
    { 
      value: insights?.total_companies || 0, 
      label: 'Companies', 
      icon: Building2,
      detail: 'Indexed across the searchable directory'
    },
    { 
      value: insights?.total_h1b_records || 0, 
      label: 'Gov Records', 
      icon: Database,
      detail: 'Historical filings loaded into the platform'
    },
    { 
      value: insights?.coverage_years?.last || '-', 
      label: 'Coverage', 
      icon: BarChart3,
      detail: 'Current fiscal-year range'
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border-default">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          className="relative overflow-hidden"
        >
          {/* Accent line */}
          <div className="absolute top-0 left-0 w-12 h-0.5 bg-accent-500 rounded-full" />
          
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-tertiary">
            <stat.icon className="w-4 h-4 text-accent-500" />
            {stat.label}
          </div>
          
          <motion.div
            className="mt-4 text-4xl font-bold tracking-tight text-text-primary"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 100, delay: index * 0.1 }}
          >
            <AnimatedNumber value={stat.value} />
          </motion.div>
          
          <p className="mt-3 text-sm text-text-secondary max-w-[17ch]">
            {stat.detail}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
```

### 5.2 Companies Page Redesign

**Key Improvements:**
1. Sticky filter bar with glass morphism
2. Staggered card animations
3. Enhanced company cards with hover reveal
4. Prefetching for instant navigation
5. Improved pagination with keyboard support

```tsx
// src/pages/Companies.tsx (Key sections)

function Companies() {
  // ... state management

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-border-subtle">
        <div className="container py-4">
          <FilterBar 
            search={search}
            onSearchChange={setSearch}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>
      </div>
      
      {/* Results */}
      <div className="container py-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <CompanyGridSkeleton count={PAGE_SIZE} />
          ) : (
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {companies.map((company, index) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <CompanyCard company={company} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPrevious={goToPreviousPage}
            onNext={goToNextPage}
          />
        )}
      </div>
    </div>
  );
}

// Enhanced Company Card
function CompanyCard({ company }: { company: Company }) {
  const score = Number(company.visa_fair_score || 0);
  const scoreBadge = getScoreBadge(score);
  
  return (
    <Link
      to={`/companies/${company.slug}`}
      className="group block p-6 bg-white rounded-2xl border border-border-subtle shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-[var(--duration-normal)]"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <CompanyLogo {...company} size="md" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate group-hover:text-accent-600 transition-colors">
            {company.name}
          </h3>
          <p className="text-sm text-text-secondary truncate">
            {company.industry} • {company.headquarters}
          </p>
        </div>
        <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-accent-600 group-hover:translate-x-1 transition-all" />
      </div>
      
      {/* Score Section */}
      <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
            Visa Score
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{score}</span>
            <Badge variant={scoreBadge.variant}>{scoreBadge.label}</Badge>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
            H-1B Count
          </div>
          <div className="text-2xl font-bold font-mono">
            {company.total_h1b_filings?.toLocaleString()}
          </div>
        </div>
      </div>
      
      {/* Hover Reveal */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--duration-normal)]">
        <div className="text-sm">
          <span className="text-text-tertiary">Coverage:</span>
          <span className="font-semibold ml-1">{company.coverage_years}</span>
        </div>
        <div className="text-sm">
          <span className="text-text-tertiary">Salary Records:</span>
          <span className="font-semibold ml-1">{company.offer_count?.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
}
```

### 5.3 Company Detail Page Redesign

**Key Improvements:**
1. Dashboard-style layout with Bento grid
2. Animated score breakdown with progress bars
3. Enhanced data visualization
4. Improved mobile responsiveness
5. Better information hierarchy

```tsx
// src/pages/CompanyDetail.tsx (Key sections)

function CompanyDetail() {
  const { slug } = useParams();
  
  return (
    <div className="min-h-screen bg-surface-0">
      {/* Hero */}
      <CompanyHero company={company} />
      
      {/* Bento Grid Layout */}
      <div className="container py-12">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content - 8 columns */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <ScoreBreakdownCard company={company} />
            <H1BHistoryCard company={company} />
            <RecentOffersCard offers={offers} />
            <ApplicantInsightsCard insights={insights} />
          </div>
          
          {/* Sidebar - 4 columns */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <QuickActionsCard company={company} />
            <CompanyInfoCard company={company} />
            <SimilarCompaniesCard companies={similarCompanies} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Score Breakdown with Animated Progress
function ScoreBreakdownCard({ company }: { company: Company }) {
  const score = Number(company.visa_fair_score || 0);
  const metrics = [
    { label: 'Approval Rate', value: Number(company.h1b_approval_rate || 0), color: 'var(--accent-500)' },
    { label: 'Salary vs Market', value: company.avg_salary_percentile || 0, color: 'var(--info-500)' },
    { label: 'Consistency', value: Number(company.sponsorship_consistency_score || 0), color: 'var(--success-500)' },
  ];
  
  return (
    <Card variant="elevated" padding="lg">
      <CardBody>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Award className="w-5 h-5 text-accent-500" />
          Visa Fair Score Breakdown
        </h2>
        
        {/* Main Score */}
        <div className="flex items-center gap-6 mb-8">
          <motion.div
            className="text-6xl font-bold text-accent-600"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            {score.toFixed(1)}
          </motion.div>
          <Badge variant={getScoreVariant(score)} size="lg">
            {getScoreLabel(score)}
          </Badge>
        </div>
        
        {/* Metrics */}
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">{metric.label}</span>
                <span className="font-mono font-semibold">{metric.value}%</span>
              </div>
              <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: metric.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
```

---

## 6. Motion Design System

### 6.1 Animation Principles

1. **Purposeful Motion** - Every animation serves a purpose (feedback, guidance, delight)
2. **Performance First** - Use `transform` and `opacity` only, no layout thrashing
3. **Spring Physics** - Natural, bouncy animations with spring easing
4. **Staggered Reveals** - Sequential entrance for lists and grids
5. **Reduced Motion** - Respect `prefers-reduced-motion`

### 6.2 Framer Motion Integration

```tsx
// src/components/motion/animations.ts

import { type Variants } from 'framer-motion';

// Fade in up animation
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// Scale in animation
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

// Stagger container
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

// Spring configuration
export const springConfig = {
  type: 'spring',
  stiffness: 100,
  damping: 20,
};

// Page transition
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

// Card hover
export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -4 },
};

// Button tap
export const buttonTap = {
  scale: 0.98,
  transition: { duration: 0.1 },
};
```

### 6.3 Animated Components

```tsx
// src/components/motion/AnimatedNumber.tsx

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatFn?: (value: number) => string;
}

export function AnimatedNumber({ 
  value, 
  duration = 1000,
  formatFn = (v) => v.toLocaleString() 
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const spring = useSpring(0, { stiffness: 100, damping: 20 });
  const display = useTransform(spring, (current) => formatFn(Math.round(current)));
  
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);
  
  return (
    <motion.span>
      <motion.span>{display}</motion.span>
    </motion.span>
  );
}

// src/components/motion/StaggeredList.tsx

import { motion, type Variants } from 'framer-motion';
import { type ReactNode } from 'react';

interface StaggeredListProps {
  children: ReactNode[];
  staggerDelay?: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function StaggeredList({ children, staggerDelay = 0.05 }: StaggeredListProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          transition={{ delay: index * staggerDelay }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// src/components/motion/PageTransition.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { type ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

---

## 7. Accessibility Guidelines

### 7.1 WCAG 2.1 AA Compliance

| Criterion | Implementation |
|-----------|---------------|
| Color Contrast | Minimum 4.5:1 for text, 3:1 for large text |
| Focus Indicators | Visible focus rings on all interactive elements |
| Keyboard Navigation | Full keyboard support with logical tab order |
| Screen Readers | ARIA labels, roles, and live regions |
| Motion | Respect `prefers-reduced-motion` |
| Semantic HTML | Proper heading hierarchy, landmarks |
| Forms | Labels, error messages, validation |

### 7.2 Focus Management

```css
/* Focus styles */
:focus-visible {
  outline: 2px solid var(--accent-500);
  outline-offset: 2px;
}

/* Skip link */
.skip-link {
  position: absolute;
  top: -100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 2rem;
  background: var(--accent-500);
  color: white;
  border-radius: var(--radius-lg);
  z-index: 9999;
  transition: top var(--duration-fast);
}

.skip-link:focus {
  top: 1rem;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 7.3 ARIA Implementation

```tsx
// Accessible Button
<button
  aria-label={label}
  aria-pressed={pressed}
  aria-expanded={expanded}
  aria-controls={controlsId}
  aria-disabled={disabled}
  role={role}
  tabIndex={tabIndex}
>
  {children}
</button>

// Accessible Modal
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby={titleId}
  aria-describedby={descriptionId}
>
  <h2 id={titleId}>{title}</h2>
  <p id={descriptionId}>{description}</p>
  {children}
</div>

// Accessible Progress
<div
  role="progressbar"
  aria-valuenow={value}
  aria-valuemin={0}
  aria-valuemax={max}
  aria-label={label}
>
  <div style={{ width: `${percentage}%` }} />
</div>
```

---

## 8. Performance Optimization

### 8.1 Code Splitting

```tsx
// src/App.tsx
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Companies = lazy(() => import('./pages/Companies'));
const CompanyDetail = lazy(() => import('./pages/CompanyDetail'));
// ... other pages

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/companies/:slug" element={<CompanyDetail />} />
        {/* ... other routes */}
      </Routes>
    </Suspense>
  );
}
```

### 8.2 Image Optimization

```tsx
// src/components/ui/OptimizedImage.tsx

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  className?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  loading = 'lazy',
  className,
}: OptimizedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      className={className}
      style={{
        maxWidth: '100%',
        height: 'auto',
      }}
    />
  );
}
```

### 8.3 React Query Optimization

```tsx
// src/api/queryClient.ts

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

// Prefetching
const prefetchCompany = async (slug: string) => {
  await queryClient.prefetchQuery({
    queryKey: ['company', slug],
    queryFn: () => companiesApi.get(slug),
  });
};
```

---

## 9. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Update CSS variables and design tokens
- [ ] Install and configure Framer Motion
- [ ] Update Tailwind config with new design system
- [ ] Create new typography classes
- [ ] Update color palette across all components

### Phase 2: Core Components (Week 3-4)
- [ ] Redesign Button component with variants
- [ ] Redesign Card component with elevation system
- [ ] Redesign Input component with enhanced states
- [ ] Redesign Badge component with animations
- [ ] Redesign Progress component with gradients
- [ ] Create Skeleton component with shimmer
- [ ] Create AnimatedNumber component

### Phase 3: Pages - High Priority (Week 5-7)
- [ ] Redesign Homepage with Bento layout
- [ ] Redesign Companies page with staggered animations
- [ ] Redesign Company Detail with dashboard layout
- [ ] Add page transitions
- [ ] Implement prefetching

### Phase 4: Pages - Medium Priority (Week 8-9)
- [ ] Redesign Jobs page with enhanced job cards
- [ ] Redesign Offers page with data visualization
- [ ] Redesign Predictions/Lottery Calculator
- [ ] Redesign Compare page

### Phase 5: Polish & Performance (Week 10)
- [ ] Add micro-interactions throughout
- [ ] Optimize animations for 60fps
- [ ] Add loading states and error boundaries
- [ ] Performance audit and optimization
- [ ] Cross-browser testing
- [ ] Accessibility audit

---

## 10. Success Metrics

### Performance Targets
| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3s |
| Cumulative Layout Shift | < 0.1 |
| Animation Frame Rate | 60fps |

### Accessibility Targets
| Criterion | Target |
|-----------|--------|
| WCAG 2.1 AA | 100% compliance |
| Keyboard Navigation | Full support |
| Screen Reader | Full support |
| Color Contrast | ≥ 4.5:1 |
| Focus Indicators | Visible on all elements |

### User Experience Targets
| Metric | Target |
|--------|--------|
| Visual Hierarchy | Clear on all pages |
| Interactive Feedback | All elements have feedback |
| Loading States | All async operations |
| Error Recovery | All error states |
| Empty States | All empty states with guidance |

---

## 11. File Structure

```
frontend/src/
├── components/
│   ├── ui/
│   │   ├── primitives/
│   │   │   ├── Box.tsx
│   │   │   ├── Flex.tsx
│   │   │   ├── Grid.tsx
│   │   │   ├── Text.tsx
│   │   │   └── VisuallyHidden.tsx
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── ButtonGroup.tsx
│   │   │   ├── IconButton.tsx
│   │   │   └── Button.styles.ts
│   │   ├── Input/
│   │   │   ├── Input.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Select.tsx
│   │   │   └── Input.styles.ts
│   │   ├── Card/
│   │   │   ├── Card.tsx
│   │   │   ├── CardHeader.tsx
│   │   │   ├── CardBody.tsx
│   │   │   ├── CardFooter.tsx
│   │   │   └── Card.styles.ts
│   │   ├── Badge/
│   │   │   ├── Badge.tsx
│   │   │   ├── Tag.tsx
│   │   │   └── Badge.styles.ts
│   │   ├── Progress/
│   │   │   ├── Progress.tsx
│   │   │   ├── CircularProgress.tsx
│   │   │   └── Progress.styles.ts
│   │   ├── Feedback/
│   │   │   ├── Alert.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── Skeleton.tsx
│   │   ├── Navigation/
│   │   │   ├── Tabs.tsx
│   │   │   ├── Breadcrumb.tsx
│   │   │   └── Pagination.tsx
│   │   ├── Overlay/
│   │   │   ├── Modal.tsx
│   │   │   ├── Drawer.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   └── Popover.tsx
│   │   ├── DataDisplay/
│   │   │   ├── Avatar.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Stat.tsx
│   │   │   └── CompanyLogo.tsx
│   │   └── index.ts
│   ├── layout/
│   │   ├── Layout.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── PageHeader.tsx
│   │   └── Section.tsx
│   ├── forms/
│   │   ├── Form.tsx
│   │   ├── FormField.tsx
│   │   ├── FormLabel.tsx
│   │   └── FormError.tsx
│   ├── data/
│   │   ├── CompanyCard.tsx
│   │   ├── JobCard.tsx
│   │   ├── OfferCard.tsx
│   │   ├── StatCard.tsx
│   │   └── ScoreCard.tsx
│   ├── charts/
│   │   ├── BarChart.tsx
│   │   ├── LineChart.tsx
│   │   ├── DonutChart.tsx
│   │   └── Sparkline.tsx
│   ├── motion/
│   │   ├── AnimatedNumber.tsx
│   │   ├── FadeIn.tsx
│   │   ├── SlideIn.tsx
│   │   ├── Stagger.tsx
│   │   ├── PageTransition.tsx
│   │   └── animations.ts
│   └── seo/
│       ├── SEO.tsx
│       └── SkipLink.tsx
├── pages/
│   ├── Home.tsx
│   ├── Companies.tsx
│   ├── CompanyDetail.tsx
│   ├── Jobs.tsx
│   ├── Offers.tsx
│   ├── Compare.tsx
│   ├── Predictions.tsx
│   ├── LotteryCalculator.tsx
│   ├── Privacy.tsx
│   ├── Terms.tsx
│   └── NotFound.tsx
├── styles/
│   ├── design-tokens.css
│   ├── animations.css
│   └── utilities.css
├── hooks/
│   ├── useMediaQuery.ts
│   ├── useIntersectionObserver.ts
│   ├── usePrefersReducedMotion.ts
│   └── useKeyboard.ts
├── utils/
│   ├── format.ts
│   ├── validation.ts
│   └── accessibility.ts
└── types/
    └── index.ts
```

---

## 12. Conclusion

This comprehensive UI redesign architecture transforms Ghosted from a functional interface into a premium, polished experience while preserving its distinctive character. The key improvements are:

1. **Refined Visual System** - Sophisticated color palette with proper elevation and depth
2. **Purposeful Motion** - Micro-interactions that guide and delight users
3. **Better Information Architecture** - Dashboard-style layouts for data-heavy pages
4. **Performance-First** - 60fps animations with proper memoization
5. **Accessibility** - WCAG 2.1 AA compliance throughout
6. **Modern Design Patterns** - Bento grids, glass morphism, and spring physics

The result will be a visa-aware job intelligence platform that feels premium, trustworthy, and distinctly modern—ready to serve international professionals navigating the U.S. job market with confidence.