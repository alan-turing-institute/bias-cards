'use client';

import { Card } from '@/components/ui/card';
import { getCardIcon, getCategoryColors } from '@/lib/config/card-config';
import type { BiasCard as BiasCardType } from '@/lib/types/cards';
import { cn } from '@/lib/utils';

interface BiasCardCompactProps {
  card: BiasCardType;
  cardNumber?: string;
  className?: string;
  onClick?: () => void;
}

export function BiasCardCompact({
  card,
  cardNumber = '01',
  className,
  onClick,
}: BiasCardCompactProps) {
  const IconComponent = getCardIcon(card);
  const colors = getCategoryColors(card.category);

  return (
    <Card
      className={cn(
        'group relative h-[420px] w-full overflow-hidden border-0 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl',
        'cursor-pointer p-0',
        className
      )}
      onClick={onClick}
    >
      <div className="flex h-full flex-col">
        {/* Colored header section - fixed height */}
        <div className={cn('relative h-[190px] p-6', colors.bg)}>
          {/* Card Number */}
          <div className="absolute top-4 left-4">
            <span className="font-bold text-4xl text-white/90">
              {cardNumber}
            </span>
          </div>

          {/* Icon */}
          <div className="flex h-full items-center justify-center">
            <IconComponent className="h-20 w-20 text-white" />
          </div>
        </div>

        {/* White content section - flex to fill remaining space */}
        <div className="flex flex-1 flex-col bg-white p-6">
          <h3 className="mb-2 font-bold text-gray-900 text-lg leading-tight">
            {card.name}
          </h3>
          <p className="line-clamp-3 flex-1 text-gray-600 text-sm leading-relaxed">
            {card.caption}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className={cn('font-medium text-xs', colors.text)}>
              {card.category.replace('-', ' ')}
            </span>
            <span className="text-gray-400 text-xs">Click to learn more →</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
