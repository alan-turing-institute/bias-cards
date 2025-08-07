'use client';

import { Card } from '@/components/ui/card';
import { getCardIcon, getCategoryColors } from '@/lib/config/card-config';
import type { BiasCard as BiasCardType } from '@/lib/types/cards';
import { cn } from '@/lib/utils';

interface BiasCardChipProps {
  card: BiasCardType;
  cardNumber?: string;
  className?: string;
  onClick?: () => void;
}

export function BiasCardChip({
  card,
  cardNumber = '01',
  className,
  onClick,
}: BiasCardChipProps) {
  const IconComponent = getCardIcon(card);
  const colors = getCategoryColors(card.category);

  return (
    <Card
      className={cn(
        'group relative h-[32px] w-auto overflow-hidden border-0 shadow-sm transition-all duration-200 hover:scale-[1.05] hover:shadow-md',
        'inline-flex cursor-pointer p-0',
        className
      )}
      onClick={onClick}
      title={`${card.name} - ${card.caption}`} // Tooltip with full info
    >
      <div className="flex h-full items-center">
        {/* Colored section with icon and number */}
        <div
          className={cn(
            'relative flex items-center gap-1 px-2 py-1',
            colors.bg
          )}
        >
          {/* Icon */}
          <IconComponent className="h-3 w-3 text-white/90" />

          {/* Card Number Badge - overlaid */}
          <div className="-top-0.5 -right-0.5 absolute flex h-3 w-3 items-center justify-center rounded-full bg-white/20">
            <span className="font-bold text-[7px] text-white leading-none">
              {cardNumber}
            </span>
          </div>
        </div>

        {/* White content section - minimal padding */}
        <div className="flex items-center bg-white px-2 py-1">
          <span className="max-w-[80px] truncate whitespace-nowrap font-medium text-[10px] text-gray-900 leading-tight">
            {card.name}
          </span>
        </div>

        {/* Color indicator dot */}
        <div className="flex items-center bg-white pr-2">
          <div className={cn('h-2 w-2 rounded-full', colors.bg)} />
        </div>
      </div>
    </Card>
  );
}
