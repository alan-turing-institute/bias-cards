'use client';

import { CheckCircle, Shield } from 'lucide-react';
import { getCategoryColors } from '@/lib/config/card-config';
import type { MitigationCard as MitigationCardType } from '@/lib/types/cards';
import { cn } from '@/lib/utils';
import { BaseCard, type BaseCardProps } from './base-card';

interface MitigationCardProps extends Omit<BaseCardProps, 'card'> {
  card: MitigationCardType;
  showIcon?: boolean;
  effectiveness?: number; // 1-5 scale for visual effectiveness indicator
}

export function MitigationCard({
  card,
  showIcon = true,
  showPrompts = true,
  effectiveness,
  className,
  ...props
}: MitigationCardProps) {
  const colors = getCategoryColors(card.category);

  return (
    <div className="relative">
      <BaseCard
        card={card}
        className={cn(
          'border-r-4', // Right accent border for mitigations
          colors.lightBg, // Subtle gradient
          className
        )}
        showPrompts={showPrompts}
        {...props}
      />

      {/* Mitigation-specific icon overlay */}
      {showIcon && (
        <div className="pointer-events-none absolute top-4 right-4 opacity-30 transition-opacity group-hover:opacity-50">
          <Shield className={cn('h-5 w-5', colors.text)} />
        </div>
      )}

      {/* Effectiveness indicator */}
      {effectiveness && effectiveness > 0 && (
        <div className="pointer-events-none absolute right-4 bottom-4 flex gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                i < effectiveness
                  ? colors.bg.replace('bg-', 'bg-').replace('/10', '')
                  : 'bg-gray-200'
              )}
              key={`effectiveness-${i}`}
            />
          ))}
        </div>
      )}

      {/* Applied indicator for cards marked as used */}
      {className?.includes('applied') && (
        <div className="pointer-events-none absolute top-2 right-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
        </div>
      )}
    </div>
  );
}
