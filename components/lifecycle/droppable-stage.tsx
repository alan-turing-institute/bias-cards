'use client';

import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';
import type { LifecycleStage } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DroppableStageProps {
  stage: LifecycleStage;
  children: ReactNode;
  className?: string;
}

export function DroppableStage({
  stage,
  children,
  className,
}: DroppableStageProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `stage-${stage}`,
    data: {
      stage,
      type: 'stage',
    },
  });

  return (
    <div
      className={cn(
        'transition-all duration-200',
        isOver && 'ring-2 ring-primary ring-offset-2',
        className
      )}
      ref={setNodeRef}
    >
      {children}
    </div>
  );
}
