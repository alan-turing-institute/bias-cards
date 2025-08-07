'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { getCardIcon, getCategoryColors } from '@/lib/config/card-config';
import type { BiasCard as BiasCardType } from '@/lib/types/cards';
import { cn } from '@/lib/utils';
import { DraggableCardEnhanced } from './draggable-card-enhanced';

interface BiasCardGroupedProps {
  cards: BiasCardType[];
  getCardNumber?: (card: BiasCardType) => string;
  onCardClick?: (card: BiasCardType) => void;
  className?: string;
}

interface CategoryGroupProps {
  category: BiasCardType['category'];
  cards: BiasCardType[];
  getCardNumber: (card: BiasCardType) => string;
  onCardClick: (card: BiasCardType) => void;
}

function CategoryGroup({
  category,
  cards,
  getCardNumber,
  onCardClick,
}: CategoryGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const colors = getCategoryColors(category);

  // Add headerBg property for grouped view
  const extendedColors = {
    ...colors,
    headerBg: (() => {
      if (category === 'cognitive-bias') {
        return 'bg-teal-100';
      }
      if (category === 'social-bias') {
        return 'bg-emerald-100';
      }
      if (category === 'statistical-bias') {
        return 'bg-amber-100';
      }
      return 'bg-gray-100';
    })(),
  };

  const categoryNames = {
    'cognitive-bias': 'Cognitive Biases',
    'social-bias': 'Social Biases',
    'statistical-bias': 'Statistical Biases',
  };

  return (
    <div className="mb-3">
      {/* Category Header */}
      <button
        className={cn(
          'flex w-full items-center justify-between rounded-t-md px-3 py-2 transition-colors',
          extendedColors.headerBg,
          'hover:opacity-80'
        )}
        onClick={() => setIsExpanded(!isExpanded)}
        type="button"
      >
        <div className="flex items-center gap-2">
          <span className={cn('font-semibold text-xs', colors.text)}>
            {categoryNames[category]}
          </span>
          <span className="text-[10px] text-gray-500">({cards.length})</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-3 w-3 text-gray-600" />
        ) : (
          <ChevronRight className="h-3 w-3 text-gray-600" />
        )}
      </button>

      {/* Cards in category */}
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
                  {/* Colored indicator - very thin */}
                  <div
                    className={cn('relative w-[24px] flex-shrink-0', colors.bg)}
                  >
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

export function BiasCardGrouped({
  cards,
  getCardNumber = () => '01',
  onCardClick = () => {
    // Default empty handler for card clicks
  },
  className,
}: BiasCardGroupedProps) {
  // Group cards by category
  const groupedCards = cards.reduce(
    (acc, card) => {
      if (!acc[card.category]) {
        acc[card.category] = [];
      }
      acc[card.category].push(card);
      return acc;
    },
    {} as Record<BiasCardType['category'], BiasCardType[]>
  );

  // Sort categories in preferred order
  const categoryOrder: BiasCardType['category'][] = [
    'cognitive-bias',
    'social-bias',
    'statistical-bias',
  ];

  return (
    <div className={cn('space-y-0', className)}>
      {categoryOrder.map((category) => {
        const categoryCards = groupedCards[category];
        if (!categoryCards || categoryCards.length === 0) {
          return null;
        }

        return (
          <CategoryGroup
            cards={categoryCards}
            category={category}
            getCardNumber={getCardNumber}
            key={category}
            onCardClick={onCardClick}
          />
        );
      })}
    </div>
  );
}
