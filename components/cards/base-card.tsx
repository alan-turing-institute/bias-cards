'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  type CategoryType,
  cardDesignTokens,
  categoryStyles,
} from '@/lib/design-tokens';
import type { Card as CardType } from '@/lib/types/cards';
import { cn } from '@/lib/utils';

export interface BaseCardProps extends HTMLAttributes<HTMLDivElement> {
  card: CardType;
  variant?: 'compact' | 'standard' | 'expanded';
  showCategory?: boolean;
  showPrompts?: boolean;
  interactive?: boolean;
}

export const BaseCard = forwardRef<HTMLDivElement, BaseCardProps>(
  (
    {
      card,
      variant = 'standard',
      showCategory = true,
      showPrompts = false,
      interactive = true,
      className,
      ...props
    },
    ref
  ) => {
    const categoryType = card.category as CategoryType;
    const categoryColors = categoryStyles[categoryType];

    const variantStyles = {
      compact: 'w-80 h-60',
      standard: 'w-96 h-72',
      expanded: 'max-w-2xl min-h-[530px]',
    };

    return (
      <Card
        className={cn(
          // Base styles
          'group relative overflow-hidden border-2 bg-white transition-all duration-300',
          // Size variant
          variantStyles[variant],
          // Interactive styles
          interactive && [
            'cursor-pointer hover:scale-[1.02] hover:shadow-lg',
            'hover:border-opacity-80',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          ],
          // Category border color
          `border-[${categoryColors.primary}]`,
          className
        )}
        ref={ref}
        style={{
          borderColor: categoryColors.primary,
        }}
        {...props}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3
                className="line-clamp-2 font-bold text-gray-900 text-lg leading-tight"
                style={{ fontSize: cardDesignTokens.typography.title.fontSize }}
              >
                {card.name}
              </h3>
              {variant !== 'compact' && (
                <p
                  className="mt-1 line-clamp-2 text-gray-600"
                  style={{
                    fontSize: cardDesignTokens.typography.caption.fontSize,
                  }}
                >
                  {card.caption}
                </p>
              )}
            </div>

            {showCategory && (
              <Badge
                className="shrink-0 font-medium text-xs"
                style={{
                  backgroundColor: categoryColors.light,
                  color: categoryColors.dark,
                }}
                variant="secondary"
              >
                {card.category.replace('-', ' ')}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          <div className="text-gray-700 text-sm leading-relaxed">
            {(() => {
              if (variant === 'compact') {
                return <p className="line-clamp-3">{card.description}</p>;
              }
              if (variant === 'standard') {
                return <p className="line-clamp-4">{card.description}</p>;
              }
              return <p>{card.description}</p>;
            })()}
          </div>

          {/* Example - only for expanded variant */}
          {variant === 'expanded' && card.example && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Example</h4>
              <p className="rounded-md bg-gray-50 p-3 text-gray-700 text-sm leading-relaxed">
                {card.example}
              </p>
            </div>
          )}

          {/* Prompts */}
          {showPrompts && card.prompts && card.prompts.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">
                Reflection Questions
              </h4>
              <ul className="space-y-2">
                {card.prompts
                  .slice(
                    0,
                    (() => {
                      if (variant === 'compact') {
                        return 2;
                      }
                      if (variant === 'standard') {
                        return 3;
                      }
                      return;
                    })()
                  )
                  .map((prompt, promptIndex) => (
                    <li
                      className="relative pl-3 text-gray-700 text-sm leading-relaxed before:absolute before:left-0 before:text-gray-400 before:content-['•']"
                      key={`prompt-${promptIndex}-${prompt.slice(0, 20)}`}
                    >
                      {prompt}
                    </li>
                  ))}
                {variant !== 'expanded' &&
                  card.prompts.length > (variant === 'compact' ? 2 : 3) && (
                    <li className="text-gray-500 text-sm italic">
                      +{card.prompts.length - (variant === 'compact' ? 2 : 3)}{' '}
                      more questions
                    </li>
                  )}
              </ul>
            </div>
          )}
        </CardContent>

        {/* Interactive hover overlay */}
        {interactive && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </Card>
    );
  }
);

BaseCard.displayName = 'BaseCard';
