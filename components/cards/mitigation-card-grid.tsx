'use client';

import { Card } from '@/components/ui/card';
import { getCardIcon, getCategoryColors } from '@/lib/config/card-config';
import type { MitigationCard as MitigationCardType } from '@/lib/types/cards';
import { cn } from '@/lib/utils';

interface MitigationCardGridProps {
  card: MitigationCardType;
  cardNumber?: string;
  className?: string;
  onClick?: () => void;
}

export function MitigationCardGrid({
  card,
  cardNumber = '01',
  className,
  onClick,
}: MitigationCardGridProps) {
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
        {/* Amber gradient section for mitigation - ultra-compact */}
        <div className="relative w-[35px] flex-shrink-0 bg-gradient-to-br from-[#8294A6]/80 to-[#8294A6]">
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
              mitigation
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
