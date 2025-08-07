'use client';

import { XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvalidDropIndicatorProps {
  isActive: boolean;
  className?: string;
}

export function InvalidDropIndicator({
  isActive,
  className,
}: InvalidDropIndicatorProps) {
  if (!isActive) {
    return null;
  }

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-red-500/10 backdrop-blur-sm',
        'animate-pulse',
        className
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <XCircle className="h-12 w-12 text-red-500" />
        <span className="font-medium text-red-600 text-sm">
          Cannot drop here
        </span>
      </div>
    </div>
  );
}
