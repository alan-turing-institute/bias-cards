'use client';

import { motion, type Variants } from 'framer-motion';
import { forwardRef, type HTMLAttributes } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnimatedCardProps extends HTMLAttributes<HTMLDivElement> {
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  hover?: boolean;
}

const cardVariants: Variants = {
  hidden: (direction: string) => ({
    opacity: 0,
    x: (() => {
      if (direction === 'left') {
        return -50;
      }
      if (direction === 'right') {
        return 50;
      }
      return 0;
    })(),
    y: (() => {
      if (direction === 'up') {
        return -50;
      }
      if (direction === 'down') {
        return 50;
      }
      return 0;
    })(),
  }),
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
  },
  hover: {
    scale: 1.02,
    y: -2,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  (
    {
      children,
      className,
      delay = 0,
      direction = 'up',
      duration = 0.5,
      hover = true,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        animate="visible"
        custom={direction}
        initial="hidden"
        ref={ref}
        transition={{
          duration,
          delay,
          ease: 'easeOut',
        }}
        variants={cardVariants}
        whileHover={hover ? 'hover' : undefined}
      >
        <Card
          className={cn('transition-shadow duration-200', className)}
          {...props}
        >
          {children}
        </Card>
      </motion.div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';
