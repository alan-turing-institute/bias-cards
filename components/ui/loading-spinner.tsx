'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  variant?: 'spinner' | 'dots' | 'pulse';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

const dotVariants = {
  initial: { y: 0 },
  animate: { y: -10 },
};

const dotTransition = {
  duration: 0.5,
  repeat: Number.POSITIVE_INFINITY,
  repeatType: 'reverse' as const,
  ease: 'easeInOut' as const,
};

export function LoadingSpinner({
  className,
  size = 'md',
  text,
  variant = 'spinner',
}: LoadingSpinnerProps) {
  if (variant === 'dots') {
    return (
      <div
        className={cn('flex items-center justify-center space-x-1', className)}
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            animate="animate"
            className={cn('rounded-full bg-current', {
              'h-2 w-2': size === 'sm',
              'h-3 w-3': size === 'md',
              'h-4 w-4': size === 'lg',
            })}
            initial="initial"
            key={index}
            transition={{
              ...dotTransition,
              delay: index * 0.1,
            }}
            variants={dotVariants}
          />
        ))}
        {text && (
          <span className="ml-2 text-muted-foreground text-sm">{text}</span>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          className={cn(
            'rounded-full bg-current opacity-75',
            sizeClasses[size]
          )}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut' as const,
          }}
        />
        {text && (
          <span className="ml-2 text-muted-foreground text-sm">{text}</span>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      {text && (
        <span className="ml-2 text-muted-foreground text-sm">{text}</span>
      )}
    </div>
  );
}
