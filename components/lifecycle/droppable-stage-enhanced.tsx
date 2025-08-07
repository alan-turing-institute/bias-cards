'use client';

import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';
import type { LifecycleStage } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DroppableStageEnhancedProps {
  stage: LifecycleStage;
  children: ReactNode;
  className?: string;
  isValidDrop?: boolean;
}

export function DroppableStageEnhanced({
  stage,
  children,
  className,
  isValidDrop = true,
}: DroppableStageEnhancedProps) {
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
        'relative transition-all duration-200',
        isOver && isValidDrop && 'ring-2 ring-green-500 ring-offset-2',
        isOver && !isValidDrop && 'ring-2 ring-red-500 ring-offset-2',
        className
      )}
      ref={setNodeRef}
    >
      {children}
      {isOver && !isValidDrop && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-red-500/10">
          <span className="rounded-md bg-red-100 px-3 py-1 font-medium text-red-700 text-sm">
            Already assigned to this stage
          </span>
        </div>
      )}
    </div>
  );
}
