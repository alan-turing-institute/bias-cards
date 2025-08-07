'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EffectivenessRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

const labels = [
  'Not effective',
  'Slightly effective',
  'Moderately effective',
  'Very effective',
  'Highly effective',
];

export function EffectivenessRating({
  value = 0,
  onChange,
  size = 'md',
  readonly = false,
  showLabel = false,
  className,
}: EffectivenessRatingProps) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex gap-0.5">
        {stars.map((star) => (
          <button
            aria-label={`Rate ${star} out of 5`}
            className={cn(
              'transition-all',
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
              'rounded focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1'
            )}
            disabled={readonly}
            key={star}
            onClick={() => handleClick(star)}
            onMouseEnter={() => {
              if (!readonly && onChange) {
                // Add hover preview logic if needed
              }
            }}
            type="button"
          >
            <Star
              className={cn(
                sizeClasses[size],
                star <= value
                  ? 'fill-amber-500 text-amber-500'
                  : 'fill-gray-200 text-gray-200',
                !readonly && 'hover:fill-amber-400 hover:text-amber-400'
              )}
            />
          </button>
        ))}
      </div>
      {showLabel && value > 0 && (
        <span className="text-muted-foreground text-xs">
          {labels[value - 1]}
        </span>
      )}
    </div>
  );
}
