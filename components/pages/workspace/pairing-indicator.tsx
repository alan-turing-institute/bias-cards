'use client';

import { Link } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PairingIndicatorProps {
  pairCount: number;
  isActive?: boolean;
  className?: string;
}

export function PairingIndicator({
  pairCount,
  isActive = false,
  className,
}: PairingIndicatorProps) {
  if (pairCount === 0) {
    return null;
  }

  return (
    <div className={cn('-top-2 -right-2 absolute z-10', className)}>
      <Badge
        className={cn(
          'flex items-center gap-1 px-2 py-0.5',
          isActive && 'bg-amber-500 hover:bg-amber-600'
        )}
        variant={isActive ? 'default' : 'secondary'}
      >
        <Link className="h-3 w-3" />
        <span className="font-semibold text-xs">{pairCount}</span>
      </Badge>
    </div>
  );
}
