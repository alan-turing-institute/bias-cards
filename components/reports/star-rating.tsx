import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function StarRating({
  value,
  max = 5,
  size = 'md',
  showLabel = false,
  className,
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[...new Array(max)].map((_, i) => (
        <Star
          className={cn(
            sizeClasses[size],
            i < value
              ? 'fill-amber-400 text-amber-400'
              : 'text-muted-foreground/30'
          )}
          key={`star-${i}-${max}-${value}`}
        />
      ))}
      {showLabel && (
        <span className="ml-2 text-muted-foreground text-sm">
          {value > 0 ? `${value}/${max}` : 'Not rated'}
        </span>
      )}
    </div>
  );
}
