'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';
import type { Card } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DraggableCardProps {
  id: string | number;
  card: Card;
  children: ReactNode;
  disabled?: boolean;
}

export function DraggableCard({
  id,
  card,
  children,
  disabled = false,
}: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: id.toString(),
      data: {
        card,
        type: 'card',
      },
      disabled,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(disabled ? {} : listeners)}
      {...attributes}
      className={cn(
        'transition-opacity',
        isDragging && 'opacity-50',
        !disabled && 'cursor-move'
      )}
    >
      {children}
    </div>
  );
}
