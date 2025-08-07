'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { type KeyboardEvent, type ReactNode, useRef, useState } from 'react';
import type { Card } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DraggableCardEnhancedProps {
  id: string | number;
  card: Card;
  children: ReactNode;
  disabled?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  isSelected?: boolean;
  dragHandleOnly?: boolean; // New prop to enable drag handle mode
}

export function DraggableCardEnhanced({
  id,
  card,
  children,
  disabled = false,
  onFocus,
  onBlur,
  isSelected = false,
  dragHandleOnly = false,
}: DraggableCardEnhancedProps) {
  const [isFocused, setIsFocused] = useState(false);
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

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    // Space or Enter to start drag
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      // Trigger drag start programmatically
      ref.current?.dispatchEvent(
        new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
        })
      );
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
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
      aria-label={`Draggable card: ${card.name}`}
      aria-selected={isSelected}
      className={cn(
        'outline-none transition-all',
        isDragging && 'cursor-grabbing opacity-50',
        !(disabled || isDragging) && 'cursor-grab',
        isFocused && 'rounded-lg ring-2 ring-amber-500 ring-offset-2',
        isSelected && 'rounded-lg ring-2 ring-amber-400 ring-offset-2',
        disabled && 'cursor-not-allowed opacity-60'
      )}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={disabled ? -1 : 0}
    >
      {children}
    </div>
  );
}
