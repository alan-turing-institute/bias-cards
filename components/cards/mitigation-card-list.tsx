'use client';

import { ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getCardIcon, getCategoryColors } from '@/lib/config/card-config';
import type { MitigationCard as MitigationCardType } from '@/lib/types/cards';
import { cn } from '@/lib/utils';

interface MitigationCardListProps {
  card: MitigationCardType;
  cardNumber?: string;
  className?: string;
  onClick?: () => void;
  showCategory?: boolean;
}

export function MitigationCardList({
  card,
  cardNumber = '01',
  className,
  onClick,
  showCategory = true,
}: MitigationCardListProps) {
  const IconComponent = getCardIcon(card);
  const colors = getCategoryColors(card.category);
  return (
    <Card
      className={cn(
        'group relative h-[90px] w-full overflow-hidden border-0 shadow-sm transition-all duration-200 hover:scale-[1.01] hover:shadow-md',
        'cursor-pointer p-0',
        className
      )}
      onClick={onClick}
    >
      <div className="flex h-full">
        {/* Gradient section for mitigation - fixed width */}
        <div className="relative w-[60px] flex-shrink-0 bg-gradient-to-br from-[#8294A6]/80 to-[#8294A6]">
          {/* Card Number */}
          <div className="absolute top-1 left-2">
            <span className="font-bold text-white/90 text-xs">
              {cardNumber}
            </span>
          </div>

          {/* Icon */}
          <div className="flex h-full items-center justify-center">
            <IconComponent className="h-7 w-7 text-white/70" />
          </div>
        </div>

        {/* White content section - takes remaining space */}
        <div className="flex flex-1 items-center bg-white px-3 py-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium text-gray-900 text-sm leading-tight">
              {card.name}
            </h3>
            <p className="line-clamp-2 text-gray-600 text-xs leading-relaxed">
              {card.caption}
            </p>
          </div>
          {showCategory && (
            <div className="ml-2 flex items-center">
              <span className={cn('font-medium text-xs', colors.text)}>
                mitigation
              </span>
              <ChevronRight className="ml-1 h-3 w-3 text-gray-400" />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
