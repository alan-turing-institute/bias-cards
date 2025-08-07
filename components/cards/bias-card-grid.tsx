'use client';

import { Card } from '@/components/ui/card';
import { getCardIcon, getCategoryColors } from '@/lib/config/card-config';
import type { BiasCard as BiasCardType } from '@/lib/types/cards';
import { cn } from '@/lib/utils';

interface BiasCardGridProps {
  card: BiasCardType;
  cardNumber?: string;
  className?: string;
  onClick?: () => void;
}

export function BiasCardGrid({
  card,
  cardNumber = '01',
  className,
  onClick,
}: BiasCardGridProps) {
  const IconComponent = getCardIcon(card);
  const colors = getCategoryColors(card.category);

  return (
    <Card
      className={cn(
        'group relative h-[50px] w-full overflow-hidden border-0 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md',
        'cursor-pointer p-0',
        className
      )}
      onClick={onClick}
      title={`${card.name} - ${card.caption}`} // Tooltip with full info
    >
      <div className="flex h-full">
        {/* Colored side section - ultra-compact */}
        <div className={cn('relative w-[35px] flex-shrink-0', colors.bg)}>
          {/* Card Number - tiny */}
          <div className="absolute top-0.5 left-1">
            <span className="font-bold text-[9px] text-white/90 leading-none">
              {cardNumber}
            </span>
          </div>

          {/* Icon - centered */}
          <div className="flex h-full items-center justify-center pt-1">
            <IconComponent className="h-3.5 w-3.5 text-white/80" />
          </div>
        </div>

        {/* White content section - minimal padding */}
        <div className="flex flex-1 items-center bg-white px-2 py-1">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium text-[11px] text-gray-900 leading-tight">
              {card.name}
            </h3>
            <div className={cn('truncate font-medium text-[9px]', colors.text)}>
              {card.category.replace('-', ' ')}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
