import { motion, type HTMLMotionProps, useSpring, useTransform, useInView } from 'framer-motion';
import { type ReactNode, useRef, useEffect, useState } from 'react';

interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  delay?: number;
  hoverScale?: number;
  hoverY?: number;
}

export function AnimatedCard({
  children,
  delay = 0,
  hoverScale = 1.02,
  hoverY = -8,
  className = '',
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        scale: hoverScale,
        y: hoverY,
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({
  children,
  className = '',
  staggerDelay = 0.05,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className = '' }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  format?: (value: number) => string;
}

export function AnimatedNumber({
  value,
  duration = 2,
  className = '',
  format = (v) => v.toLocaleString(),
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [hasAnimated, setHasAnimated] = useState(false);

  const springValue = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  const displayValue = useTransform(springValue, (latest) => format(Math.round(latest)));

  useEffect(() => {
    if (isInView && !hasAnimated) {
      springValue.set(value);
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated, springValue, value]);

  return (
    <motion.span ref={ref} className={className}>
      {displayValue}
    </motion.span>
  );
}

interface LiveIndicatorProps {
  className?: string;
}

export function LiveIndicator({ className = '' }: LiveIndicatorProps) {
  return (
    <span className={`relative flex h-2 w-2 ${className}`}>
      <motion.span
        className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"
        animate={{ scale: [1, 1.5, 1], opacity: [0.75, 0, 0.75] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
    </span>
  );
}

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

interface MagneticButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode;
}

export function MagneticButton({
  children,
  className = '',
  ...props
}: MagneticButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}

interface HoverLiftProps {
  children: ReactNode;
  className?: string;
  y?: number;
}

export function HoverLift({ children, className = '', y = -4 }: HoverLiftProps) {
  return (
    <motion.div
      whileHover={{ y, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Fade in animation wrapper
interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function FadeIn({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'up' 
}: FadeInProps) {
  const directions = {
    up: { y: 30, x: 0 },
    down: { y: -30, x: 0 },
    left: { y: 0, x: 30 },
    right: { y: 0, x: -30 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Glass card with shimmer effect
interface GlassCardProps {
  children: ReactNode;
  className?: string;
  shimmer?: boolean;
}

export function GlassCard({ children, className = '', shimmer = false }: GlassCardProps) {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-3xl bg-bg-glass/80 backdrop-blur-xl border border-white/10 ${className}`}
      whileHover={{ 
        scale: 1.01,
        transition: { duration: 0.3 }
      }}
    >
      {shimmer && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
        </div>
      )}
      {children}
    </motion.div>
  );
}
