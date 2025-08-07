'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { getCardIcon, getCategoryColors } from '@/lib/config/card-config';
import type { MitigationCard as MitigationCardType } from '@/lib/types/cards';
import { cn } from '@/lib/utils';
import { DraggableCardEnhanced } from './draggable-card-enhanced';

interface MitigationCardGroupedProps {
  cards: MitigationCardType[];
  getCardNumber?: (card: MitigationCardType) => string;
  onCardClick?: (card: MitigationCardType) => void;
  className?: string;
}

export function MitigationCardGrouped({
  cards,
  getCardNumber = () => '01',
  onCardClick = () => {},
  className,
}: MitigationCardGroupedProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={cn('', className)}>
      {/* Category Header */}
      <button
        className={cn(
          'flex w-full items-center justify-between rounded-t-md px-3 py-2 transition-colors hover:opacity-80',
          getCategoryColors('mitigation-technique').lightBg
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'font-semibold text-xs',
              getCategoryColors('mitigation-technique').text
            )}
          >
            Mitigation Techniques
          </span>
          <span className="text-[10px] text-gray-500">({cards.length})</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-3 w-3 text-gray-600" />
        ) : (
          <ChevronRight className="h-3 w-3 text-gray-600" />
        )}
      </button>

      {/* Cards */}
      {isExpanded && (
        <div className="space-y-1 rounded-b-md border border-gray-100 bg-white p-1 shadow-sm">
          {cards.map((card) => (
            <DraggableCardEnhanced card={card} id={card.id} key={card.id}>
              <Card
                className="group relative h-[32px] w-full cursor-pointer overflow-hidden border-0 p-0 shadow-none transition-all duration-200 hover:shadow-sm"
                onClick={() => onCardClick(card)}
                title={`${card.name} - ${card.caption}`}
              >
                <div className="flex h-full">
                  {/* Amber indicator - very thin */}
                  <div className="relative w-[24px] flex-shrink-0 bg-gradient-to-br from-[#8294A6]/80 to-[#8294A6]">
                    {/* Card Number - micro */}
                    <div className="absolute top-0 left-0.5">
                      <span className="font-bold text-[8px] text-white/90 leading-none">
                        {getCardNumber(card)}
                      </span>
                    </div>

                    {/* Icon - micro */}
                    <div className="flex h-full items-center justify-center pt-0.5">
                      {(() => {
                        const IconComponent = getCardIcon(card);
                        return (
                          <IconComponent className="h-3 w-3 text-white/80" />
                        );
                      })()}
                    </div>
                  </div>

                  {/* Content - ultra minimal */}
                  <div className="flex flex-1 items-center bg-white px-2 py-1">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-medium text-[10px] text-gray-900 leading-tight">
                        {card.name}
                      </h3>
                    </div>
                  </div>
                </div>
              </Card>
            </DraggableCardEnhanced>
          ))}
        </div>
      )}
    </div>
  );
}
