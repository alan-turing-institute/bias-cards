'use client';

import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { getCardIcon, getCategoryColors } from '@/lib/config/card-config';
import type { BiasCard as BiasCardType } from '@/lib/types/cards';
import { cn } from '@/lib/utils';

interface BiasCardProps {
  card: BiasCardType;
  cardNumber?: string;
  className?: string;
  onClick?: () => void;
}

export function BiasCard({
  card,
  cardNumber = '01',
  className,
  onClick,
}: BiasCardProps) {
  const colors = getCategoryColors(card.category);
  const IconComponent = getCardIcon(card);
  const categoryLabel = card.category
    .replace('-', ' ')
    .replace('bias', 'Biases');

  return (
    <Card
      className={cn(
        'group relative h-[650px] w-full overflow-hidden border-0 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl',
        'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="flex h-full">
        {/* Left Panel */}
        <div
          className={cn(
            'relative flex w-[180px] flex-col items-center justify-center p-6',
            colors.bg
          )}
        >
          {/* Card Number */}
          <div className="absolute top-6 left-6">
            <span className="font-bold text-6xl text-white/80">
              {cardNumber}
            </span>
          </div>

          {/* Icon */}
          <div className="mt-8">
            <IconComponent className="h-24 w-24 text-white/40" />
          </div>

          {/* Rotated Category Text */}
          <div
            className="absolute right-0 left-0"
            style={{ bottom: '50%', transform: 'translateY(50%)' }}
          >
            <div
              className="flex origin-center items-center justify-center"
              style={{ transform: 'rotate(-90deg)' }}
            >
              <span className="whitespace-nowrap font-medium text-sm text-white/60 uppercase tracking-[0.2em]">
                {categoryLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-1 flex-col bg-white p-8">
          {/* Category Badge */}
          <div className="mb-6 flex justify-end">
            <Badge
              className={cn('font-medium text-xs', colors.lightBg, colors.text)}
              variant="secondary"
            >
              {card.category.replace('-', ' ')}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="mb-3 font-bold text-[32px] text-gray-900 leading-tight">
            {card.name}
          </h3>

          {/* Caption */}
          <p className="mb-6 text-[17px] text-gray-600 leading-relaxed">
            {card.caption}
          </p>

          {/* Description Section */}
          <div className="mb-6">
            <h4 className={cn('mb-3 font-semibold text-lg', colors.text)}>
              Description
            </h4>
            <div className={cn('border-l-4 pl-4', colors.border)}>
              <p className="text-[15px] text-gray-700 leading-relaxed">
                {card.description}
              </p>
            </div>
          </div>

          {/* Example Section */}
          {card.example && (
            <div className="mb-6">
              <h4 className="mb-3 font-semibold text-gray-900 text-lg">
                Example
              </h4>
              <p className="rounded-lg bg-gray-50 p-4 text-[15px] text-gray-700 leading-relaxed">
                {card.example}
              </p>
            </div>
          )}

          {/* Deliberative Prompts */}
          {card.prompts && card.prompts.length > 0 && (
            <div>
              <h4 className="mb-3 font-semibold text-gray-900 text-lg">
                Deliberative Prompts
              </h4>
              <ul className="space-y-3">
                {card.prompts.slice(0, 3).map((prompt) => (
                  <li className="flex gap-3" key={prompt}>
                    <ChevronRight
                      className={cn(
                        'mt-0.5 h-5 w-5 flex-shrink-0',
                        colors.text
                      )}
                    />
                    <span className="text-gray-700 leading-relaxed">
                      {prompt}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
