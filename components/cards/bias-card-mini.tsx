'use client';

import { Card } from '@/components/ui/card';
import { getCardIcon, getCategoryColors } from '@/lib/config/card-config';
import type { BiasCard as BiasCardType } from '@/lib/types/cards';
import { cn } from '@/lib/utils';

interface BiasCardMiniProps {
  card: BiasCardType;
  cardNumber?: string;
  className?: string;
  onClick?: () => void;
}

export function BiasCardMini({
  card,
  cardNumber = '01',
  className,
  onClick,
}: BiasCardMiniProps) {
  const IconComponent = getCardIcon(card);
  const colors = getCategoryColors(card.category);

  return (
    <Card
      className={cn(
        'group relative h-[45px] w-full overflow-hidden border-0 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md',
        'cursor-pointer p-0',
        className
      )}
      onClick={onClick}
    >
      <div className="flex h-full">
        {/* Colored side section - very small fixed width */}
        <div className={cn('relative w-[40px] flex-shrink-0', colors.bg)}>
          {/* Card Number - very small */}
          <div className="absolute top-0.5 left-1">
            <span className="font-bold text-[10px] text-white/90">
              {cardNumber}
            </span>
          </div>

          {/* Icon */}
          <div className="flex h-full items-center justify-center">
            <IconComponent className="h-4 w-4 text-white/70" />
          </div>
        </div>

        {/* White content section - takes remaining space */}
        <div className="flex flex-1 items-center bg-white px-2 py-1">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium text-gray-900 text-xs leading-tight">
              {card.name}
            </h3>
            <p className="truncate text-[10px] text-gray-500">
              {card.category.replace('-', ' ')}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
