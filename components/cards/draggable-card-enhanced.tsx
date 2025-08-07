'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { type ReactNode, useRef } from 'react';
import type { Card } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DraggableCardEnhancedProps {
  id: string | number;
  card: Card;
  children: ReactNode;
  disabled?: boolean;
  isSelected?: boolean;
}

export function DraggableCardEnhanced({
  id,
  card,
  children,
  disabled = false,
  isSelected = false,
}: DraggableCardEnhancedProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: id.toString(),
      data: {
        card: card || null, // Ensure card is always defined, even if null
        type: 'card',
        cardId: card?.id || null, // Add card ID as fallback
      },
      disabled: disabled || !card, // Disable if no card data
    });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (node) {
          ref.current = node;
        }
      }}
      style={style}
      {...(disabled ? {} : listeners)}
      {...attributes}
      aria-grabbed={isDragging}
      className={cn(
        'outline-none transition-all',
        isDragging && 'cursor-grabbing opacity-50',
        !(disabled || isDragging) && 'cursor-grab',
        isSelected && 'rounded-lg ring-2 ring-amber-400 ring-offset-2',
        disabled && 'cursor-not-allowed opacity-60'
      )}
    >
      {children}
    </div>
  );
}
