import { motion } from 'framer-motion';

export function LiveIndicator({ className = '' }: { className?: string }) {
  return (
    <span className={`relative flex h-2 w-2 ${className}`}>
      <motion.span
        className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.5, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
    </span>
  );
}

export default LiveIndicator;
