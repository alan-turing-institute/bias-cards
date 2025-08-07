'use client';

import { Card } from '@/components/ui/card';
import { getCardIcon, getCategoryColors } from '@/lib/config/card-config';
import type { MitigationCard as MitigationCardType } from '@/lib/types/cards';
import { cn } from '@/lib/utils';

interface MitigationCardDroppedProps {
  card: MitigationCardType;
  cardNumber?: string;
  className?: string;
  onClick?: () => void;
}

export function MitigationCardDropped({
  card,
  cardNumber = '01',
  className,
  onClick,
}: MitigationCardDroppedProps) {
  const IconComponent = getCardIcon(card);
  const _colors = getCategoryColors(card.category);

  return (
    <Card
      className={cn(
        'group relative h-auto w-full overflow-hidden border-0 shadow-sm transition-all duration-200 hover:shadow-md',
        'cursor-grab p-0 active:cursor-grabbing',
        className
      )}
      onClick={onClick}
      title={`${card.name} - ${card.caption}`}
    >
      <div className="flex h-full">
        {/* Amber gradient section for mitigation */}
        <div className="relative w-12 flex-shrink-0 bg-gradient-to-br from-[#8294A6]/80 to-[#8294A6]">
          {/* Card Number */}
          <div className="absolute top-2 left-0 w-full text-center">
            <span className="font-bold text-white/90 text-xs">
              {cardNumber}
            </span>
          </div>

          {/* Icon centered */}
          <div className="flex h-full items-center justify-center pt-2">
            <IconComponent className="h-5 w-5 text-white/70" />
          </div>
        </div>

        {/* White content section */}
        <div className="flex flex-1 flex-col bg-white p-3">
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">
              {card.name}
            </h3>
            <p className="line-clamp-2 text-gray-600 text-xs leading-relaxed">
              {card.caption}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
